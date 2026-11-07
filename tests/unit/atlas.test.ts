import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { expect, test } from "vite-plus/test";
import { DATA } from "../../src/data/atlas.ts";
import { KINDS, LABPRESETS, OCCPRESETS, ROUTES } from "../../src/data/presets.ts";
import { frac, normalize, shortestPath } from "../../src/lib/format.ts";
import { expanded, fourFCC, modelFor } from "../../src/lib/viewer.ts";

const ids = new Set(DATA.nodes.map((n) => n.id));

test("the v1.0 dataset was preserved byte-for-byte after JSON serialization", async () => {
  const expected = (
    await readFile(new URL("./original-data.sha256", import.meta.url), "utf8")
  ).trim();
  expect(createHash("sha256").update(JSON.stringify(DATA)).digest("hex")).toBe(expected);
});

test("the initial atlas has 56 structures, 62 relations, 13 strict relations", () => {
  expect(DATA.nodes).toHaveLength(56);
  expect(DATA.edges).toHaveLength(62);
  expect(DATA.edges.filter((e) => e.strict)).toHaveLength(13);
  expect(Object.keys(DATA.sources)).toHaveLength(5);
  expect(Object.keys(DATA.families)).toHaveLength(6);
});

test("structure and relationship IDs are unique", () => {
  expect(ids.size).toBe(DATA.nodes.length);
  expect(new Set(DATA.edges.map((e) => e.id)).size).toBe(DATA.edges.length);
});

test("structures reference known families and have valid graph positions", () => {
  for (const n of DATA.nodes) {
    expect(DATA.families[n.family], n.id).toBeTruthy();
    for (const field of ["name", "formula", "sg", "desc", "packing", "coord", "link"] as const) {
      expect(n[field].length, `${n.id}.${field}`).toBeGreaterThan(0);
    }
    expect(Number.isFinite(n.x) && Number.isFinite(n.y), n.id).toBe(true);
    if (n.occ) {
      expect(n.occ).toHaveLength(2);
      expect(
        n.occ.every((x) => Number.isFinite(x) && x >= 0 && x <= 1),
        n.id,
      ).toBe(true);
      expect(n.host, n.id).toBeTruthy();
    }
  }
});

test("every relationship has existing endpoints and a recognized category", () => {
  for (const e of DATA.edges) {
    expect(ids.has(e.a) && ids.has(e.b), e.id).toBe(true);
    expect(e.a).not.toBe(e.b);
    expect(KINDS[e.kind], e.id).toBeTruthy();
    if (e.strict) {
      expect(e.kind).toBe("symmetry");
      for (const field of ["index", "basis", "split"] as const)
        expect(e[field], `${e.id}.${field}`).toBeTruthy();
    }
  }
});

test("all source references resolve, with positive one-based PDF page numbers", () => {
  for (const item of [...DATA.nodes, ...DATA.edges, ...Object.values(OCCPRESETS)]) {
    expect(item.refs.length).toBeGreaterThan(0);
    for (const ref of item.refs) {
      const source = DATA.sources[ref.s];
      expect(source, ref.s).toBeTruthy();
      expect(Number.isInteger(ref.p)).toBe(true);
      expect(ref.p + source!.offset).toBeGreaterThan(0);
      expect(ref.sec).toBeTruthy();
    }
  }
});

test("learning routes and lab presets reference existing structures", () => {
  for (const route of ROUTES) for (const id of route.ids) expect(ids.has(id), id).toBe(true);
  for (const p of LABPRESETS) {
    expect(ids.has(p.id), p.id).toBe(true);
    expect(p.els).toHaveLength(4);
  }
});

test("search normalizes subscripts, full-width characters, and separators", () => {
  expect(normalize("Ｌ２₁")).toBe("l21");
  expect(normalize("Fm−3m")).toBe(normalize("Fm-3m"));
  expect(normalize("Li₂O")).toBe(normalize("Li2O"));
});

test("fraction formatting and occupancy arithmetic preserve textbook fractions", () => {
  expect(frac(1 / 8)).toBe("1/8");
  expect(frac(2 / 3)).toBe("2/3");
  expect(frac(0.4)).toBe("0.4");
  expect(2 * OCCPRESETS.spinel!.t + OCCPRESETS.spinel!.o).toBe(0.75);
  expect(2 * OCCPRESETS.fluorite!.t + OCCPRESETS.fluorite!.o).toBe(2);
});

test("path search is explicitly undirected and honors the strict filter", () => {
  const edges = [
    { a: "a", b: "b", strict: true },
    { a: "b", b: "c" },
  ];
  expect(shortestPath(edges, "c", "a")).toEqual(["c", "b", "a"]);
  expect(shortestPath(edges, "a", "c", true)).toBeNull();
  expect(shortestPath(edges, "b", "a", true)).toEqual(["b", "a"]);
  expect(shortestPath(edges, "a", "a")).toEqual(["a"]);
  expect(shortestPath(edges, "a", "unconnected")).toBeNull();
});

test("all displayed ideal models have finite cell vectors and atom positions", () => {
  for (const n of DATA.nodes.filter((n) => n.model)) {
    const model = modelFor(n.model!);
    expect(model.atoms.length, n.id).toBeGreaterThan(0);
    expect(model.cell).toHaveLength(3);
    for (const vec of model.cell) expect(vec.every(Number.isFinite), n.id).toBe(true);
    for (const atom of model.atoms)
      expect(
        atom.f.every((x) => Number.isFinite(x) && x >= 0 && x <= 1),
        n.id,
      ).toBe(true);
  }
});

test("four-fcc models retain atom counts after periodic wrapping", () => {
  for (const preset of LABPRESETS) {
    const periodic = new Set(fourFCC(preset).atoms.map((a) => a.f.map((x) => x % 1).join(",")));
    expect(periodic.size, preset.id).toBe(preset.els.filter(Boolean).length * 4);
    const all = new Set(fourFCC(preset, true).atoms.map((a) => a.f.map((x) => x % 1).join(",")));
    expect(all.size, preset.id).toBe(16);
  }
});

test("boundary expansion deduplicates and creates eight corners from an origin", () => {
  const atom = { f: [0, 0, 0] as [number, number, number], el: "X", site: 0 };
  expect(expanded([atom, atom])).toHaveLength(8);
});
