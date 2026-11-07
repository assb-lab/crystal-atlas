import assert from "node:assert/strict";
import { test } from "vite-plus/test";
import { DATA } from "../../src/data/atlas.ts";
import { PACKING_CONCEPTS, PACKING_ROOTS } from "../../src/data/packing-plan.ts";
import {
  alternativeRelations, ancestors, buildPackingAtlas, descendants, lensMatches,
  packingPositions, projectPacking, rootOf, searchPacking,
} from "../../src/lib/packing.ts";

const atlas = buildPackingAtlas(DATA);

test("all source structures survive without modifying the source dataset", () => {
  const before = JSON.stringify(DATA);
  const built = buildPackingAtlas(DATA);
  assert.equal(JSON.stringify(DATA), before);
  assert.equal(built.nodes.size, DATA.nodes.length + PACKING_CONCEPTS.length);
  assert.deepEqual(built.unplaced, []);
  for (const source of DATA.nodes) assert.equal(built.nodes.get(source.id)?.structure, source);
});

test("every primary path reaches an explicitly declared root without a cycle", () => {
  assert.equal(atlas.parent.size, atlas.nodes.size - PACKING_ROOTS.length);
  for (const id of atlas.nodes.keys()) {
    const path = ancestors(atlas, id);
    assert.ok(PACKING_ROOTS.includes(path[0]), id);
    assert.equal(new Set(path).size, path.length, id);
    assert.equal(atlas.depth.get(id), path.length - 1);
  }
});

test("concrete compositions are leaves rather than parents of other compositions", () => {
  for (const n of atlas.nodes.values())
    if (n.role === "material") assert.equal(atlas.children.get(n.id)?.length, 0, n.id);
});

test("pyrochlore compositions have instance links and their complete ccp ancestry", () => {
  for (const id of ["y2ti2o7", "la2zr2o7", "cd2re2o7"]) {
    assert.deepEqual(ancestors(atlas, id), ["fcc", "fluorite", "defectfluorite", "pyrochlore", id]);
    assert.equal(atlas.parent.get(id)?.kind, "instance");
  }
  assert.equal(atlas.parent.get("kos2o6")?.parent, "pyro-beta");
  assert.equal(atlas.parent.get("rbos2o6")?.parent, "pyro-beta");
});

test("1:1 and 1:2 B ordering are siblings, not a chain of unrelated compounds", () => {
  assert.equal(atlas.parent.get("doubleperov")?.parent, "perov-order-b");
  assert.equal(atlas.parent.get("b-order12")?.parent, "perov-order-b");
  for (const id of ["bast", "bamt", "bamnb"]) {
    assert.equal(atlas.parent.get(id)?.parent, "b-order12");
    assert.equal(atlas.parent.get(id)?.kind, "instance");
  }
  assert.ok(ancestors(atlas, "bamgwo6").includes("ccp-ax3"));
  assert.ok(!ancestors(atlas, "bast").includes("bamgwo6"));
});

test("layer thickness and polar direction do not define successive generations", () => {
  for (const id of ["rp1", "rp2", "rp3-type"]) assert.equal(atlas.parent.get(id)?.parent, "rp-series");
  assert.equal(atlas.depth.get("bt-ortho"), atlas.depth.get("bt-rhombo"));
  assert.equal(atlas.parent.get("kno-tet")?.parent, "polar-tetragonal");
  assert.ok(!ancestors(atlas, "kno-tet").includes("kto"));
});

test("rutile descendants and inverse ReO3 no longer disappear into arbitrary families", () => {
  assert.deepEqual(ancestors(atlas, "rutile"), ["bcc", "b2", "rutile"]);
  const ids = new Set(descendants(atlas, "rutile"));
  for (const id of ["cacl2", "trirutile", "pyrolusite", "ti4o7", "ti5o9", "ramsdellite"]) assert.ok(ids.has(id), id);
  assert.ok(!ids.has("cdcl2"));
  assert.equal(atlas.parent.get("cu3n")?.parent, "reo3");
});

test("opening any branch retains every ancestor even if that ancestor was folded", () => {
  const folded = new Set(["fcc", "fluorite", "defectfluorite", "pyrochlore"]);
  const view = projectPacking(atlas, "y2ti2o7", folded);
  assert.deepEqual(view.ids, ancestors(atlas, "y2ti2o7"));
  assert.equal(view.folded.size, 0);
});

test("folding a branch hides descendants and records the hidden count", () => {
  const view = projectPacking(atlas, "fluorite", new Set(["pyrochlore"]));
  assert.ok(view.ids.includes("pyrochlore"));
  assert.ok(!view.ids.includes("y2ti2o7"));
  assert.equal(view.folded.get("pyrochlore"), descendants(atlas, "pyrochlore").length - 1);
});

test("source and figure highlights do not move or remove nodes", () => {
  const base = projectPacking(atlas, "fcc");
  for (const lens of [{ type: "source", id: "K" }, { type: "flow", id: "nias" }] as const) {
    const view = projectPacking(atlas, "fcc", new Set(), lens);
    assert.deepEqual(view.ids, base.ids);
    assert.deepEqual(packingPositions(atlas, view), packingPositions(atlas, base));
  }
});

test("explicit theme narrowing ignores family boundaries and retains all ancestors", () => {
  const lens = { type: "collection", id: "pyro-alpha" } as const;
  const view = projectPacking(atlas, "bcc", new Set(["fluorite"]), lens, true);
  for (const id of lensMatches(atlas, lens))
    for (const ancestor of ancestors(atlas, id)) assert.ok(view.ids.includes(ancestor), ancestor);
  assert.ok(view.context.has("fcc"));
});

test("all primary arrows point downward and no cards share a position", () => {
  for (const anchor of ["all", ...PACKING_ROOTS, "pyrochlore", "perov-order-b", "rutile"]) {
    const view = projectPacking(atlas, anchor);
    const positions = packingPositions(atlas, view);
    assert.equal(new Set([...positions.values()].map((p) => `${p.x},${p.y}`)).size, positions.size);
    for (const link of view.links) assert.ok(positions.get(link.parent)!.y < positions.get(link.child)!.y, link.id);
  }
});

test("alternative relationships preserve their original direction and provenance", () => {
  const alternatives = alternativeRelations(atlas, new Set(atlas.nodes.keys()));
  const source = DATA.edges.find((e) => e.id === "okamoto-nias-cacl2-rutile")!;
  assert.equal(alternatives.find((e) => e.id === source.id), source);
  assert.equal(source.undirected, true);
  for (const link of atlas.parent.values()) if (link.strict)
    assert.ok(DATA.edges.some((e) => e.strict && !e.undirected && e.a === link.parent && e.b === link.child));
});

test("additional roots are explicit organizational links, never fictitious derivations", () => {
  assert.equal(rootOf(atlas, "yag"), "other-roots");
  for (const id of atlas.children.get("other-roots") ?? []) assert.equal(atlas.parent.get(id)?.kind, "organizes");
});

test("future unplaced records remain visible with a warning", () => {
  const record = { ...DATA.nodes[0], id: "future-record", name: "Future record" };
  const built = buildPackingAtlas({ ...DATA, nodes: [...DATA.nodes, record] });
  assert.deepEqual(built.unplaced, [record.id]);
  assert.equal(rootOf(built, record.id), "other-roots");
  assert.match(built.nodes.get(record.id)!.note, /主経路未整理/);
});

test("missing evidence and duplicate records fail loudly", () => {
  assert.throws(() => buildPackingAtlas({ ...DATA, nodes: [...DATA.nodes, DATA.nodes[0]] }), /Duplicate/);
  assert.throws(() => buildPackingAtlas({ ...DATA, edges: DATA.edges.filter((e) => e.id !== "e24") }), /Missing source relation/);
});

test("search finds both material records and the new shared models", () => {
  assert.ok(searchPacking(atlas, "La2Zr2O7").some((n) => n.id === "la2zr2o7"));
  assert.ok(searchPacking(atlas, "1:2").some((n) => n.id === "b-order12"));
  assert.ok(searchPacking(atlas, "hcp").some((n) => n.id === "hcp"));
});
