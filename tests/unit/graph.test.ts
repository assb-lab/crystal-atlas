import { expect, test } from "vite-plus/test";
import { DATA } from "../../src/data/atlas.ts";
import {
  bundleKey,
  bundleOfEdge,
  bundles,
  clipToRect,
  crossEdgesOf,
  FAMILY_IDS,
  isCross,
  tileRect,
  visibleGraph,
} from "../../src/lib/graph.ts";

test("bundle keys ignore pair order", () => {
  expect(bundleKey("fluorite", "fcc")).toBe(bundleKey("fcc", "fluorite"));
});

test("bundles partition exactly the cross-family relations", () => {
  const all = visibleGraph("all", false);
  const grouped = [...bundles(all.edges).values()].flat();
  expect(grouped).toHaveLength(DATA.edges.filter(isCross).length);
  expect(bundles(all.edges).get(bundleKey("fcc", "fluorite"))).toHaveLength(3);
});

test("overview tiles do not overlap and every bundle joins neighbouring tiles", () => {
  const rects = FAMILY_IDS.map(tileRect);
  for (let i = 0; i < rects.length; i++)
    for (let j = i + 1; j < rects.length; j++) {
      const a = rects[i]!;
      const b = rects[j]!;
      const overlap = a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
      expect(overlap, `${FAMILY_IDS[i]} / ${FAMILY_IDS[j]}`).toBe(false);
    }
  const cell = (id: string) => {
    const r = tileRect(id);
    return [Math.round(r.x / (r.w + 150)), Math.round(r.y / (r.h + 130))] as const;
  };
  for (const key of bundles(visibleGraph("all", false).edges).keys()) {
    const [a, b] = key.split("|") as [string, string];
    const [ac, ar] = cell(a);
    const [bc, br] = cell(b);
    expect(Math.max(Math.abs(ac - bc), Math.abs(ar - br)), key).toBe(1);
  }
});

test("bundle endpoints sit just outside their tiles", () => {
  const r = { x: 0, y: 0, w: 400, h: 340 };
  expect(clipToRect(r, 1000, 170, 10)).toEqual([410, 170]);
  expect(clipToRect(r, 200, -500, 10)).toEqual([200, -10]);
});

test("strict view keeps only structures that have a confirmed relation", () => {
  const strict = visibleGraph("fcc", true);
  expect(strict.edges.every((e) => e.strict)).toBe(true);
  const linked = new Set(strict.edges.flatMap((e) => [e.a, e.b]));
  expect(strict.nodes.every((n) => linked.has(n.id))).toBe(true);
});

test("cross-family helpers agree with each other", () => {
  const cross = crossEdgesOf("fcc", false);
  expect(cross.length).toBeGreaterThan(0);
  for (const e of cross) expect(bundleOfEdge(e.id)).not.toBeNull();
  const inner = DATA.edges.find((e) => !isCross(e))!;
  expect(bundleOfEdge(inner.id)).toBeNull();
});
