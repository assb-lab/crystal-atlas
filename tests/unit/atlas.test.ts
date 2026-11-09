import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "vite-plus/test";
import { DATA } from "../../src/data/atlas.ts";
import { KINDS, LABPRESETS, OCCPRESETS, ROUTES } from "../../src/data/presets.ts";
import {
  derivationGraph,
  derivationPositions,
  relationshipCurve,
} from "../../src/lib/flow-layout.ts";
import { frac, normalize, shortestPath, sourcePdfPage } from "../../src/lib/format.ts";
import {
  directionAngles,
  expanded,
  fourFCC,
  modelFor,
  type ViewDirection,
} from "../../src/lib/viewer.ts";

/** Asserts presence and narrows the type (the data is typed with optional lookups). */
function must<T>(value: T | null | undefined, message?: string): T {
  assert.ok(value !== null && value !== undefined, message);
  return value;
}
type V3 = [number, number, number];

const ids = new Set(DATA.nodes.map((n) => n.id));

test("the serialized dataset matches the curated snapshot", async () => {
  const expected = (await readFile(new URL("./dataset.sha256", import.meta.url), "utf8")).trim();
  assert.equal(createHash("sha256").update(JSON.stringify(DATA)).digest("hex"), expected);
});

test("the atlas has 220 structures, 283 relations, 14 strict relations", () => {
  assert.equal(DATA.nodes.length, 220);
  assert.equal(DATA.edges.length, 283);
  assert.equal(DATA.edges.filter((e) => e.strict).length, 14);
  assert.equal(Object.keys(DATA.sources).length, 32);
  assert.equal(Object.keys(DATA.families).length, 20);
});

test("structure and relationship IDs are unique", () => {
  assert.equal(ids.size, DATA.nodes.length);
  assert.equal(new Set(DATA.edges.map((e) => e.id)).size, DATA.edges.length);
});

test("directed derivations flow downward in every family and source diagram", () => {
  const cases = ["all", ...Object.keys(DATA.families)].map((family) => {
    const nodes = DATA.nodes.filter((n) => family === "all" || n.family === family);
    const present = new Set(nodes.map((n) => n.id));
    return { nodes, edges: DATA.edges.filter((e) => present.has(e.a) && present.has(e.b)) };
  });
  for (const flow of DATA.flows) {
    assert.ok(flow.refs.length, flow.id);
    const edges = flow.edges.map((id) => {
      const edge = DATA.edges.find((e) => e.id === id);
      assert.ok(edge, id);
      assert.ok(
        edge.refs.some((ref) => ref.s === "K"),
        id,
      );
      return { ...edge, undirected: false };
    });
    const present = new Set(edges.flatMap((e) => [e.a, e.b]));
    cases.push({ nodes: DATA.nodes.filter((n) => present.has(n.id)), edges });
  }
  for (const { nodes, edges } of cases) {
    const positions = derivationPositions(nodes, edges);
    assert.equal(positions.size, nodes.length);
    for (const edge of edges.filter((e) => !e.undirected)) {
      assert.ok(must(positions.get(edge.a)).y < must(positions.get(edge.b)).y, edge.id);
    }
  }
});

test("real and reciprocal viewing directions project to a point in oblique cells", () => {
  const cell: V3[] = [
    [3, 0, 0],
    [1.2, 4, 0],
    [0.7, -0.8, 5],
  ];
  const cross = ([a, b, c]: V3, [d, e, f]: V3): V3 => [b * f - c * e, c * d - a * f, a * e - b * d];
  for (const axis of [0, 1, 2]) {
    for (const reciprocal of [false, true]) {
      const vector: V3 = reciprocal
        ? cross(cell[(axis + 1) % 3]!, cell[(axis + 2) % 3]!)
        : cell[axis]!;
      for (const sign of ["", "-"]) {
        const { x, y } = directionAngles(
          cell,
          ("abc"[axis]! + (reciprocal ? "*" : "") + sign) as ViewDirection,
        );
        const px = vector[0] * Math.cos(y) + vector[2] * Math.sin(y);
        const depth = -vector[0] * Math.sin(y) + vector[2] * Math.cos(y);
        const py = vector[1] * Math.cos(x) - depth * Math.sin(x);
        assert.ok(Math.abs(px) < 1e-10 && Math.abs(py) < 1e-10);
        assert.ok((vector[1] * Math.sin(x) + depth * Math.cos(x)) * (sign ? -1 : 1) < 0);
      }
    }
  }
  assert.notDeepEqual(directionAngles(cell, "a"), directionAngles(cell, "a*"));
});

test("structures reference known families and have valid graph positions", () => {
  for (const n of DATA.nodes) {
    assert.ok(DATA.families[n.family], n.id);
    for (const field of ["name", "formula", "sg", "desc", "packing", "coord", "link"] as const) {
      assert.equal(typeof n[field], "string", `${n.id}.${field}`);
      assert.ok(n[field].length, `${n.id}.${field}`);
    }
    assert.ok(Number.isFinite(n.x) && Number.isFinite(n.y), n.id);
    if (n.occ) {
      assert.equal(n.occ.length, 2);
      assert.ok(
        n.occ.every((x) => Number.isFinite(x) && x >= 0 && x <= 1),
        n.id,
      );
      assert.ok(n.host, n.id);
    }
  }
});

test("every relationship has existing endpoints and a recognized category", () => {
  for (const e of DATA.edges) {
    assert.ok(ids.has(e.a) && ids.has(e.b), e.id);
    assert.notEqual(e.a, e.b);
    assert.ok(KINDS[e.kind], e.id);
    if (e.strict) {
      assert.equal(e.kind, "symmetry");
      for (const field of ["index", "basis", "split"] as const)
        assert.ok(e[field], `${e.id}.${field}`);
    }
  }
});

test("source references resolve to valid PDF pages or linked articles", () => {
  for (const item of [...DATA.nodes, ...DATA.edges, ...Object.values(OCCPRESETS)]) {
    assert.ok(item.refs.length);
    for (const ref of item.refs) {
      const source = must(DATA.sources[ref.s], ref.s);
      if (ref.p === undefined) {
        assert.match(ref.url ?? source.article ?? "", /^https:\/\//);
      } else {
        assert.ok(Number.isInteger(ref.p));
        const pdfPage = sourcePdfPage(source, ref);
        assert.ok(Number.isInteger(pdfPage) && pdfPage > 0);
      }
      assert.ok(ref.sec);
    }
  }
});

test("Galasso book references use bibliographic citations and resolve both PDF page offsets", () => {
  const firstRef = (id: string) => must(must(DATA.nodes.find((n) => n.id === id)).refs[0]);
  const [G, GI] = [must(DATA.sources.G), must(DATA.sources.GI)];
  assert.equal(sourcePdfPage(G, firstRef("bast")), 17);
  assert.equal(sourcePdfPage(G, firstRef("kmgf3")), 196);
  assert.equal(sourcePdfPage(GI, firstRef("scheelite")), 111);
  for (const source of [G, GI])
    assert.match(source.citation ?? "", /F\. S\. Galasso, .*Pergamon Press/);
});

test("learning routes and lab presets reference existing structures", () => {
  for (const route of ROUTES) for (const id of route.ids) assert.ok(ids.has(id), id);
  for (const p of LABPRESETS) {
    assert.ok(ids.has(p.id), p.id);
    assert.equal(p.els.length, 4);
  }
});

test("search normalizes subscripts, full-width characters, and separators", () => {
  assert.equal(normalize("Ｌ２₁"), "l21");
  assert.equal(normalize("Fm−3m"), normalize("Fm-3m"));
  assert.equal(normalize("Li₂O"), normalize("Li2O"));
});

test("fraction formatting and occupancy arithmetic preserve textbook fractions", () => {
  assert.equal(frac(1 / 8), "1/8");
  assert.equal(frac(2 / 3), "2/3");
  assert.equal(2 * OCCPRESETS.spinel!.t + OCCPRESETS.spinel!.o, 0.75);
  assert.equal(2 * OCCPRESETS.fluorite!.t + OCCPRESETS.fluorite!.o, 2);
});

test("path search is explicitly undirected and honors the strict filter", () => {
  const edges = [
    { a: "a", b: "b", strict: true },
    { a: "b", b: "c" },
  ];
  assert.deepEqual(shortestPath(edges, "c", "a"), ["c", "b", "a"]);
  assert.equal(shortestPath(edges, "a", "c", true), null);
  assert.deepEqual(shortestPath(edges, "b", "a", true), ["b", "a"]);
  assert.deepEqual(shortestPath(edges, "a", "a"), ["a"]);
  assert.equal(shortestPath(edges, "a", "unconnected"), null);
});

test("all structures render nonempty unit cells with finite coordinates", () => {
  for (const n of DATA.nodes) {
    const model = modelFor(n.model ?? n.id);
    assert.ok(model.atoms.length, n.id);
    assert.equal(model.cell.length, 3);
    for (const vec of model.cell) assert.ok(vec.every(Number.isFinite), n.id);
    for (const atom of model.atoms) {
      assert.ok(
        atom.f.every((x) => Number.isFinite(x) && x >= 0 && x <= 1),
        n.id,
      );
    }
  }
});

test("coordinate models preserve Wyckoff multiplicities and occupancy", () => {
  for (const [id, model] of Object.entries(DATA.models)) {
    assert.ok(ids.has(id), id);
    assert.ok(model.source.label, id);
    assert.ok(model.spaceGroup >= 1 && model.spaceGroup <= 230, id);
    assert.ok(
      model.parameters.every((x) => Number.isFinite(x) && x > 0),
      id,
    );
    const positions = new Set();
    for (const { wyckoff, occupants, positions: orbit } of model.groups) {
      assert.equal(orbit.length, Number.parseInt(wyckoff), id);
      const fractions = Object.values(occupants);
      assert.ok(fractions.length && fractions.every((value) => value > 0), id);
      assert.ok(fractions.reduce((sum, value) => sum + value, 0) <= 1 + 1e-8, id);
      for (const site of orbit) {
        assert.ok(
          site.length === 3 && site.every((x) => Number.isFinite(x) && x >= 0 && x < 1),
          id,
        );
        assert.ok(!positions.has(site.join(",")), id);
        positions.add(site.join(","));
      }
    }
  }
  const oxygen = must(DATA.models.defectfluorite!.groups.find((group) => group.occupants.O));
  assert.equal(oxygen.positions.length * must(oxygen.occupants.O), 7);
  assert.deepEqual(
    must(DATA.models.inverse.groups.find((group) => group.wyckoff === "16c")).occupants,
    {
      Mg: 0.5,
      Al: 0.5,
    },
  );
});

test("averaged cells keep mixed and partial occupancies with their provenance", () => {
  const li2mno3 = must(DATA.models.li2mno3);
  assert.equal(li2mno3.kind, "average");
  assert.deepEqual(must(li2mno3.groups.find((g) => g.wyckoff === "2b")).occupants, {
    Li: 0.854,
    Mn: 0.146,
  });
  const p2 = must(DATA.models["nacoo2-p2"]);
  assert.equal(p2.kind, "average");
  assert.deepEqual(must(p2.groups.find((g) => g.wyckoff === "6h")).occupants, { Na: 0.146 });
  for (const model of Object.values(DATA.models))
    assert.ok(model.source.label, model.spaceGroup.toString());
});

test("every structure is tied in by a structural relation, a classification or a source flow", () => {
  const structural = new Set(
    DATA.edges.filter((e) => e.kind !== "analogy").flatMap((e) => [e.a, e.b]),
  );
  const classified = new Set(DATA.collections.flatMap((c) => c.ids));
  const flowEdges = new Set(DATA.flows.flatMap((f) => f.edges));
  const inFlow = new Set(DATA.edges.filter((e) => flowEdges.has(e.id)).flatMap((e) => [e.a, e.b]));
  for (const n of DATA.nodes)
    assert.ok(
      structural.has(n.id) || classified.has(n.id) || inFlow.has(n.id),
      `${n.id} is linked only by comparisons`,
    );
  // Families grouped by application or mineral class rather than structure are not part of the atlas.
  for (const id of ["ion-ox", "ion-sulf", "ion-hal", "phosphates", "silicates", "zeolite"])
    assert.equal(DATA.families[id], undefined, id);
  for (const id of Object.keys(DATA.families))
    assert.ok(
      DATA.nodes.some((n) => n.family === id),
      `${id} has no structures`,
    );
});

test("four-fcc models retain atom counts after periodic wrapping", () => {
  for (const preset of LABPRESETS) {
    const model = fourFCC(preset);
    const periodic = new Set(model.atoms.map((a) => a.f.map((x) => x % 1).join(",")));
    assert.equal(periodic.size, preset.els.filter(Boolean).length * 4, preset.id);
    const withVacancies = fourFCC(preset, true);
    const all = new Set(withVacancies.atoms.map((a) => a.f.map((x) => x % 1).join(",")));
    assert.equal(all.size, 16, preset.id);
  }
});

test("boundary expansion deduplicates and creates eight corners from an origin", () => {
  const atom = { f: [0, 0, 0], el: "X", site: 0 };
  assert.equal(expanded([atom, atom]).length, 8);
});

test("classification membership, hierarchy, tables, labels and references resolve", () => {
  const collectionIds = new Set(DATA.collections.map((c) => c.id));
  assert.equal(collectionIds.size, DATA.collections.length);
  for (const item of [...DATA.collections, ...Object.values(DATA.structureLabels).flat()]) {
    assert.ok(item.refs.length);
    for (const ref of item.refs) assert.ok(DATA.sources[ref.s], ref.s);
  }
  for (const c of DATA.collections) {
    assert.ok(c.ids.length, c.id);
    assert.equal(c.ids.length, new Set(c.ids).size, c.id);
    if (c.parent) assert.ok(collectionIds.has(c.parent), c.id);
    for (const id of c.ids) assert.ok(ids.has(id), c.id + ": " + id);
    for (const row of c.table?.rows ?? []) {
      assert.equal(row.cells.length, must(c.table).headings.length, c.id);
      for (const id of row.ids) assert.ok(c.ids.includes(id), c.id + ": " + id);
    }
  }
  for (const id of Object.keys(DATA.structureLabels)) assert.ok(ids.has(id), id);
});

test("overview keeps a wide generation on one rank without folding siblings into descendants", () => {
  const nodes = ["root", "a", "b", "c", "d", "e", "grandchild"].map((id, x) => ({ id, x }));
  const edges = ["a", "b", "c", "d", "e"].map((b) => ({ a: "root", b }));
  edges.push({ a: "e", b: "grandchild" });
  const positions = derivationPositions(nodes, edges);
  assert.equal(new Set(["a", "b", "c", "d", "e"].map((id) => must(positions.get(id)).y)).size, 1);
  assert.ok(must(positions.get("grandchild")).y > must(positions.get("a")).y);
  assert.equal(new Set([...positions.values()].map((p) => `${p.x},${p.y}`)).size, nodes.length);
  for (const collection of DATA.collections) {
    const members = DATA.nodes.filter((n) => collection.ids.includes(n.id));
    const relations = DATA.edges.filter(
      (e) => collection.ids.includes(e.a) && collection.ids.includes(e.b),
    );
    const layout = derivationPositions(members, relations);
    for (const e of relations.filter((e) => !e.undirected))
      assert.ok(must(layout.get(e.a)).y < must(layout.get(e.b)).y, e.id);
  }
});

test("the default tree includes every structure and relation without a generation limit", () => {
  const tree = derivationGraph(DATA.nodes, DATA.edges);
  assert.equal(tree.nodes.length, DATA.nodes.length);
  assert.equal(tree.edges.length, DATA.edges.length);
  assert.equal(tree.groups.length, 0);
  for (const edge of tree.edges.filter((edge) => !edge.undirected)) {
    assert.ok(must(tree.positions.get(edge.a)).y < must(tree.positions.get(edge.b)).y, edge.id);
  }
  const lineage = derivationGraph(DATA.nodes, DATA.edges, "perov");
  for (const id of ["perov", "camntio6-ht", "camntio6"])
    assert.ok(
      lineage.nodes.some((node) => node.id === id),
      id,
    );
  assert.ok(lineage.edges.some((edge) => edge.a === "camntio6-ht" && edge.b === "camntio6"));
});

test("lineages retain all ancestors and descendants, and folds preserve shared descendants", () => {
  const nodes = ["root", "child", "grandchild", "greatgrandchild", "leaf", "sibling", "other"].map(
    (id, x) => ({ id, x }),
  );
  const edges = [
    ["root", "child"],
    ["child", "grandchild"],
    ["grandchild", "greatgrandchild"],
    ["greatgrandchild", "leaf"],
    ["root", "sibling"],
  ].map(([a, b], i) => ({ id: String(i), a, b }));
  const lineage = derivationGraph(nodes, edges, "grandchild");
  assert.deepEqual(
    new Set(lineage.nodes.map((n) => n.id)),
    new Set(["root", "child", "grandchild", "greatgrandchild", "leaf"]),
  );
  const folded = derivationGraph(nodes, edges, null, new Set(["child"]));
  assert.deepEqual(
    new Set(folded.nodes.map((n) => n.id)),
    new Set(["root", "child", "sibling", "other"]),
  );
  assert.equal(folded.groups[0].count, 3);
  const restored = derivationGraph(nodes, edges);
  assert.equal(restored.nodes.length, nodes.length);
  const shared = derivationGraph(
    nodes,
    [...edges, { id: "shared", a: "other", b: "grandchild" }],
    null,
    new Set(["child"]),
  );
  for (const id of ["grandchild", "greatgrandchild", "leaf"])
    assert.ok(
      shared.nodes.some((n) => n.id === id),
      id,
    );
  assert.equal(shared.groups.length, 0);
});

test("manual folds preserve direction and non-overlapping generation positions across the catalog", () => {
  for (const parent of DATA.nodes) {
    const tree = derivationGraph(DATA.nodes, DATA.edges, null, new Set([parent.id]));
    const shown = new Set(tree.nodes.map((node) => node.id));
    assert.ok(shown.has(parent.id));
    for (const edge of tree.edges) {
      assert.ok(shown.has(edge.a) && shown.has(edge.b));
      if (!edge.undirected)
        assert.ok(must(tree.positions.get(edge.a)).y < must(tree.positions.get(edge.b)).y, edge.id);
    }
    const points = [...tree.positions.values()];
    for (let i = 0; i < points.length; i++)
      for (let j = i + 1; j < points.length; j++) {
        assert.ok(
          Math.abs(points[i].x - points[j].x) >= 220 || Math.abs(points[i].y - points[j].y) >= 86,
          parent.id,
        );
      }
  }
});

test("connector routes are finite cubic curves including long and same-rank relations", () => {
  const positions = derivationPositions(DATA.nodes, DATA.edges);
  for (const [i, edge] of DATA.edges.entries()) {
    const curve = relationshipCurve(
      must(positions.get(edge.a)),
      must(positions.get(edge.b)),
      positions,
      i % 9,
    );
    assert.match(curve.d, /^M.*C/);
    assert.doesNotMatch(curve.d, /[HV]|NaN|Infinity/);
    assert.ok(Number.isFinite(curve.mx) && Number.isFinite(curve.my));
  }
});

test("Glazer, Delmas, honeycomb, pyrochlore and all Galasso chapters are represented", () => {
  const collections = new Map(DATA.collections.map((c) => [c.id, c]));
  const byId = {
    get: (id: string) => must(collections.get(id), id),
    has: (id: string) => collections.has(id),
  };
  assert.equal(must(byId.get("glazer").table).rows.length, 15);
  assert.ok(byId.get("perov-a-order").ids.includes("ccto"));
  assert.ok(byId.get("perov-a-order").ids.includes("camntio6"));
  const stacking = must(byId.get("delmas").table).rows;
  for (const type of ["O1", "O2", "O3", "O4", "P2", "P3", "OP4", "T#2"]) {
    assert.ok(must(stacking.find((row) => row.cells[0] === type)).ids.length, type);
  }
  for (const type of ["O6", "OPP9"])
    assert.equal(must(stacking.find((row) => row.cells[0] === type)).ids.length, 0);
  for (const id of ["li2mno3", "na2iro3", "na2co2teo6", "na3co2sbo6"])
    assert.ok(byId.get("honeycomb").ids.includes(id));
  for (const id of ["y2ti2o7", "la2zr2o7", "cd2re2o7", "kos2o6", "rbos2o6"])
    assert.ok(byId.get("pyrochlores").ids.includes(id));
  for (let chapter = 2; chapter <= 11; chapter++) assert.ok(byId.has("galasso-" + chapter));
});

test("new diffraction models retain partial occupancies and CaMnTi2O6 stoichiometry", () => {
  const totals = (id: string) => {
    const total: Record<string, number> = {};
    for (const g of DATA.models[id].groups)
      for (const [element, occ] of Object.entries(g.occupants))
        total[element] = (total[element] ?? 0) + occ * g.positions.length;
    return total;
  };
  for (const id of ["camntio6", "camntio6-ht"])
    assert.deepEqual(totals(id), { Ca: 4, Mn: 4, Ti: 8, O: 24 });
  assert.equal(DATA.models["camntio6"].spaceGroup, 105);
  assert.equal(DATA.models["camntio6-ht"].spaceGroup, 137);
  assert.equal(
    must(DATA.models["camntio6-ht"].groups.find((g) => g.wyckoff === "4c")).occupants.Mn,
    0.5,
  );
  const op4 = totals("linacoo2-op4");
  assert.equal(op4.Li, 1.48);
  assert.equal(op4.Na, 1.24);
  assert.ok(Math.abs(totals("nacoo2-p2").Na - 1.218) < 1e-12);
  for (const id of ["li2mno3", "y2ti2o7", "na2co2teo6"])
    assert.equal(DATA.models[id].kind, "average");
  assert.equal(DATA.models["coo2-o1"].kind, "schematic");
});
