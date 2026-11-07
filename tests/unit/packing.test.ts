import assert from "node:assert/strict";
import { test } from "vite-plus/test";
import { DATA } from "../../src/data/atlas.ts";
import { PLACEMENTS, ROOT_NOTES } from "../../src/data/packing.ts";
import { ancestors, buildPackingTree, descendants, lensMembers, overlayRelations, packingPositions, packingView } from "../../src/lib/packing.ts";

const tree = buildPackingTree(DATA);

test("packing layer preserves every canonical structure, model and source relation", () => {
  const snapshot = JSON.stringify(DATA);
  buildPackingTree(DATA);
  assert.equal(JSON.stringify(DATA), snapshot);
  assert.equal(DATA.nodes.length, 220);
  assert.equal(DATA.edges.length, 283);
  for (const node of DATA.nodes) {
    assert.equal(tree.entries.get(node.id)?.structure, node);
    assert.ok(tree.roots.includes(ancestors(tree, node.id)[0]));
  }
});
test("only explicit basic packings and auxiliary entry are roots", () => {
  assert.deepEqual(tree.roots, ["bcc", "fcc", "hcp", "@aux"]);
  assert.match(ROOT_NOTES.hcp, /ブラベー格子ではなく/);
  assert.match(ROOT_NOTES.fcc, /全ての子の現在の充填を意味しません/);
});
test("pyrochlore compositions are realizations, not undirected analogies in the hierarchy", () => {
  for (const id of ["y2ti2o7", "la2zr2o7", "cd2re2o7"]) {
    assert.deepEqual(ancestors(tree, id), ["fcc", "fluorite", "defectfluorite", "pyrochlore", id]);
    assert.equal(tree.parent.get(id)?.kind, "example");
    assert.equal(tree.entries.get(id)?.role, "material");
  }
});
test("perovskite comes from the mixed ccp host", () => {
  assert.deepEqual(ancestors(tree, "perov"), ["fcc", "@mixed-ccp", "perov"]);
  assert.match(tree.entries.get("@mixed-ccp")!.description, /Xだけの最密充填ではない/);
});
test("1:1 and 1:2 ordering patterns are parallel branches", () => {
  assert.equal(tree.parent.get("doubleperov")?.parent, "@perov-order");
  assert.equal(tree.parent.get("@b12")?.parent, "@perov-order");
  assert.equal(tree.parent.get("bamgwo6")?.parent, "doubleperov");
  assert.equal(tree.parent.get("bast")?.parent, "@b12");
  assert.ok(!ancestors(tree, "bast").includes("bamgwo6"));
});
test("different BaTiO3 phases are material leaves, not parents of other materials", () => {
  for (const id of ["bt-cubic", "batio3", "bt-ortho", "bt-rhombo"]) {
    assert.equal(tree.entries.get(id)?.role, "material");
    assert.equal(tree.children.get(id)?.length, 0);
  }
});
test("RP thickness is a parallel family parameter, not generation count", () => {
  assert.equal(tree.parent.get("rp1")?.parent, "@rp");
  assert.equal(tree.parent.get("rp2")?.parent, "@rp");
  assert.equal(tree.parent.get("@rp3")?.parent, "@rp");
});
test("rutile uses the cited B2 block construction, never an hcp subgroup claim", () => {
  assert.deepEqual(ancestors(tree, "rutile"), ["bcc", "b2", "rutile"]);
  assert.ok(tree.parent.get("rutile")?.evidence.includes("okamoto-blocks-b2-rutile"));
  assert.match(tree.parent.get("rutile")!.label, /幾何/);
  assert.equal(tree.parent.get("pyrolusite")?.parent, "rutile");
  for (const id of ["ti4o7", "ti5o9"]) assert.equal(tree.parent.get(id)?.parent, "@magneli");
});
test("Cu3N returns to inverse ReO3 instead of the former one-node rutile family", () => {
  assert.equal(tree.parent.get("cu3n")?.parent, "reo3");
  assert.ok(ancestors(tree, "cu3n").includes("perov"));
});
test("unverified ancestry is explicit and searchable, not fabricated or dropped", () => {
  assert.deepEqual(tree.unassigned, ["alb2", "na3as", "moalb", "ti3sic2", "al2cu"]);
  for (const id of tree.unassigned) {
    assert.equal(tree.parent.get(id)?.parent, "@unassigned");
    assert.equal(tree.parent.get(id)?.kind, "topic");
  }
});
test("all hierarchy links point down; all material examples occupy the final band", () => {
  const view = packingView(tree, "@all");
  const positions = packingPositions(tree, view);
  for (const link of view.links) assert.ok(positions.get(link.child)!.rank > positions.get(link.parent)!.rank, link.id);
  const materialRanks = new Set(view.entries.filter((e) => e.role === "material").map((e) => positions.get(e.id)!.rank));
  assert.equal(materialRanks.size, 1);
});
test("every collection retains all matching structures and their ancestors", () => {
  for (const collection of DATA.collections) {
    const members = lensMembers(DATA, { kind: "collection", id: collection.id })!;
    const view = packingView(tree, "@all", members);
    const visible = new Set(view.entries.map((e) => e.id));
    for (const id of members) for (const ancestor of ancestors(tree, id)) assert.ok(visible.has(ancestor), `${collection.id}:${ancestor}`);
  }
});
test("source flows retain canonical direction and strictness flags", () => {
  for (const flow of DATA.flows) {
    const view = packingView(tree, "@all", lensMembers(DATA, { kind: "flow", id: flow.id }));
    const overlays = overlayRelations(DATA, view, { flow: flow.id });
    assert.equal(overlays.length, flow.edges.length);
    for (const edge of overlays) assert.equal(edge, DATA.edges.find((e) => e.id === edge.id));
  }
  assert.equal(DATA.edges.find((e) => e.id === "okamoto-nias-cacl2-rutile")?.undirected, true);
});
test("source and strict filters affect overlays only, not primary ranks", () => {
  const view = packingView(tree, "@all");
  const positions = packingPositions(tree, view);
  const edges = overlayRelations(DATA, view, { strict: true, source: "M06" });
  assert.ok(edges.length > 0);
  assert.ok(edges.every((e) => e.strict && e.refs.some((r) => r.s === "M06")));
  assert.deepEqual(packingPositions(tree, view), positions);
});
test("manual folds remove descendants only, and expansion restores every generation", () => {
  const full = packingView(tree, "fluorite");
  const folded = packingView(tree, "fluorite", null, new Set(["pyrochlore"]));
  assert.ok(folded.entries.some((e) => e.id === "pyrochlore"));
  assert.ok(!folded.entries.some((e) => e.id === "y2ti2o7"));
  assert.equal(folded.folds.get("pyrochlore"), descendants(tree, "pyrochlore").length - 1);
  assert.equal(packingView(tree, "fluorite").entries.length, full.entries.length);
});
test("nested folds do not create orphan fold markers", () => {
  const view = packingView(tree, "fluorite", null, new Set(["fluorite", "pyrochlore"]));
  assert.deepEqual([...view.folds.keys()], ["fluorite"]);
});
test("the initial overview is an explicit fold of roots, not truncated data", () => {
  const view = packingView(tree, "@all", null, new Set(tree.roots));
  assert.equal(view.entries.length, 4);
  assert.equal(view.folds.size, 4);
  assert.equal(packingView(tree, "@all").entries.length, tree.entries.size);
});
test("all documentary links refer to existing sources", () => {
  for (const link of tree.links) {
    if (link.kind !== "topic") assert.ok(link.refs.length, link.id);
    for (const ref of link.refs) assert.ok(DATA.sources[ref.s], ref.s);
  }
});
test("unknown or duplicate parents cannot silently enter the hierarchy", () => {
  assert.throws(() => buildPackingTree(DATA, [...PLACEMENTS, { parent: "missing", child: "fcc", kind: "derive", label: "bad" }]), /Unknown/);
  assert.throws(() => buildPackingTree(DATA, [...PLACEMENTS, { parent: "bcc", child: "pyrochlore", kind: "derive", label: "bad" }]), /Multiple primary/);
});
test("cyclic, root and material parent connections are rejected", () => {
  const cyclic = PLACEMENTS.filter((p) => p.child !== "fluorite");
  assert.throws(() => buildPackingTree(DATA, [...cyclic, { parent: "pyrochlore", child: "fluorite", kind: "derive", label: "bad" }]), /Cycle/);
  assert.throws(() => buildPackingTree(DATA, [...PLACEMENTS, { parent: "b2", child: "bcc", kind: "derive", label: "bad" }]), /root/);
  const materialParent = PLACEMENTS.filter((p) => p.child !== "pyrochlore");
  assert.throws(() => buildPackingTree(DATA, [...materialParent, { parent: "bamgwo6", child: "pyrochlore", kind: "derive", label: "bad" }]), /material/);
});
test("missing evidence is rejected", () => {
  const placements = PLACEMENTS.map((p, i) => i === 0 ? { ...p, evidence: ["not-a-relation"] } : p);
  assert.throws(() => buildPackingTree(DATA, placements), /Missing source relation/);
});
