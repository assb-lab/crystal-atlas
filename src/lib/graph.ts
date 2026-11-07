/** Pure graph queries and map geometry. No DOM access, so everything here is unit-testable. */
import { DATA } from "../data/atlas.ts";
import type { AtlasEdge, AtlasNode } from "../types.ts";

export const N = new Map(DATA.nodes.map((n) => [n.id, n]));
export const E = new Map(DATA.edges.map((e) => [e.id, e]));
export const FAMILY_IDS = Object.keys(DATA.families);

export function node(id: string): AtlasNode {
  const n = N.get(id);
  if (!n) throw new Error(`Unknown structure ${id}`);
  return n;
}

export function edge(id: string): AtlasEdge {
  const e = E.get(id);
  if (!e) throw new Error(`Unknown relation ${id}`);
  return e;
}

export function family(id: string) {
  const f = DATA.families[id];
  if (!f) throw new Error(`Unknown family ${id}`);
  return f;
}

/** Pseudo family id for the overview of all families. */
export const ALL = "all";

export interface Visible {
  nodes: AtlasNode[];
  edges: AtlasEdge[];
}

/** Structures and relations shown for a family ("all" = every family) and the strict filter. */
export function visibleGraph(familyId: string, strict: boolean): Visible {
  let nodes = DATA.nodes.filter((n) => familyId === ALL || n.family === familyId);
  const ids = new Set(nodes.map((n) => n.id));
  const edges = DATA.edges.filter((e) => ids.has(e.a) && ids.has(e.b) && (!strict || e.strict));
  if (strict) {
    const linked = new Set(edges.flatMap((e) => [e.a, e.b]));
    nodes = nodes.filter((n) => linked.has(n.id));
  }
  return { nodes, edges };
}

export const isCross = (e: AtlasEdge) => node(e.a).family !== node(e.b).family;

/** Relations from a structure to structures in other families. */
export function crossEdgesOf(id: string, strict: boolean): AtlasEdge[] {
  return DATA.edges.filter(
    (e) => (e.a === id || e.b === id) && isCross(e) && (!strict || e.strict),
  );
}

export function relationsOf(id: string, strict: boolean): AtlasEdge[] {
  return DATA.edges.filter((e) => (e.a === id || e.b === id) && (!strict || e.strict));
}

export const hasStrictRelation = (id: string) =>
  DATA.edges.some((e) => e.strict && (e.a === id || e.b === id));

/* ---------- Family view geometry ---------- */

export const CARD = { w: 220, h: 86 };

/** Curved connector between two cards; (mx, my) is the curve midpoint for labels. */
export function edgePath(a: AtlasNode, b: AtlasNode) {
  const { w, h } = CARD;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  let sx: number,
    sy: number,
    ex: number,
    ey: number,
    c1x: number,
    c1y: number,
    c2x: number,
    c2y: number;
  if (Math.abs(dy) < 72) {
    const s = Math.sign(dx) || 1;
    sx = a.x + (s * w) / 2;
    sy = a.y;
    ex = b.x - (s * w) / 2;
    ey = b.y;
    const bend = Math.max(28, Math.abs(dx) * 0.18);
    c1x = sx + s * bend;
    c2x = ex - s * bend;
    c1y = sy;
    c2y = ey;
  } else {
    const s = Math.sign(dy);
    sx = a.x;
    sy = a.y + (s * h) / 2;
    ex = b.x;
    ey = b.y - (s * h) / 2;
    const k = Math.max(35, Math.abs(ey - sy) * 0.5);
    c1x = sx;
    c1y = sy + s * k;
    c2x = ex;
    c2y = ey - s * k;
  }
  return {
    d: `M${sx},${sy} C${c1x},${c1y} ${c2x},${c2y} ${ex},${ey}`,
    mx: (sx + 3 * c1x + 3 * c2x + ex) / 8,
    my: (sy + 3 * c1y + 3 * c2y + ey) / 8,
  };
}

export interface Bounds {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/** Card bounds of a family view, padded for the edges' curves. */
export function nodeBounds(nodes: AtlasNode[]): Bounds | null {
  if (!nodes.length) return null;
  return {
    x1: Math.min(...nodes.map((n) => n.x)) - 140,
    x2: Math.max(...nodes.map((n) => n.x)) + 140,
    y1: Math.min(...nodes.map((n) => n.y)) - 90,
    y2: Math.max(...nodes.map((n) => n.y)) + 105,
  };
}

/* ---------- Overview geometry ---------- */

/**
 * One tile per family. fcc touches five families and hcp three, so both sit in the middle
 * column; every cross-family bundle then joins neighbouring tiles and no two bundles cross.
 */
export const OVERVIEW = {
  w: 400,
  h: 340,
  gx: 150,
  gy: 130,
  cols: 3,
  order: ["fluorite", "fcc", "bcc", "perov", "hcp", "rutile"],
};

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const tileOrder = [
  ...OVERVIEW.order.filter((f) => DATA.families[f]),
  ...FAMILY_IDS.filter((f) => !OVERVIEW.order.includes(f)),
];

export function tileRect(id: string): Rect {
  const i = tileOrder.indexOf(id);
  const c = i % OVERVIEW.cols;
  const r = Math.floor(i / OVERVIEW.cols);
  return {
    x: c * (OVERVIEW.w + OVERVIEW.gx),
    y: r * (OVERVIEW.h + OVERVIEW.gy),
    w: OVERVIEW.w,
    h: OVERVIEW.h,
  };
}

export function overviewBounds(): Bounds {
  const rs = FAMILY_IDS.map(tileRect);
  return {
    x1: Math.min(...rs.map((r) => r.x)),
    y1: Math.min(...rs.map((r) => r.y)),
    x2: Math.max(...rs.map((r) => r.x + r.w)),
    y2: Math.max(...rs.map((r) => r.y + r.h)),
  };
}

/** Point where the ray from the rect centre towards (tx, ty) leaves the rect (plus padding). */
export function clipToRect(r: Rect, tx: number, ty: number, pad = 10): [number, number] {
  const cx = r.x + r.w / 2;
  const cy = r.y + r.h / 2;
  const dx = tx - cx;
  const dy = ty - cy;
  const t = Math.min(
    dx ? (r.w / 2 + pad) / Math.abs(dx) : Infinity,
    dy ? (r.h / 2 + pad) / Math.abs(dy) : Infinity,
  );
  return [cx + dx * t, cy + dy * t];
}

/** Order-independent key for a family pair, e.g. "fcc|fluorite". */
export function bundleKey(a: string, b: string) {
  return FAMILY_IDS.indexOf(a) <= FAMILY_IDS.indexOf(b) ? `${a}|${b}` : `${b}|${a}`;
}

export function splitBundleKey(key: string): [string, string] {
  const [a = "", b = ""] = key.split("|");
  return [a, b];
}

/** Cross-family relations grouped per family pair. */
export function bundles(edges: AtlasEdge[]): Map<string, AtlasEdge[]> {
  const m = new Map<string, AtlasEdge[]>();
  for (const e of edges) {
    if (!isCross(e)) continue;
    const k = bundleKey(node(e.a).family, node(e.b).family);
    m.set(k, [...(m.get(k) ?? []), e]);
  }
  return m;
}

/** Bundle containing a relation, if it crosses families. */
export function bundleOfEdge(id: string | null): string | null {
  if (!id) return null;
  const e = edge(id);
  return isCross(e) ? bundleKey(node(e.a).family, node(e.b).family) : null;
}

export function fitText(text: string, max: number) {
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}

/** Arrow glyph for a relation as seen from `from`. */
export function arrowFrom(e: AtlasEdge, from: string) {
  return e.undirected ? "↔" : e.a === from ? "→" : "←";
}
