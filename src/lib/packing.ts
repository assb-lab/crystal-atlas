import type { Atlas, AtlasEdge, AtlasNode, Ref } from "../types.ts";
import {
  PACKING_CONCEPTS, PACKING_PLACEMENTS, PACKING_ROOTS, PROTOTYPE_IDS, ROOT_CAPTIONS,
  type PackingRelation, type PackingRole,
} from "../data/packing-plan.ts";

export interface PackingNode {
  id: string;
  title: string;
  formula: string;
  role: PackingRole;
  note: string;
  refs: Ref[];
  structure?: AtlasNode;
}
export interface PackingLink {
  id: string;
  parent: string;
  child: string;
  kind: PackingRelation;
  label: string;
  refs: Ref[];
  evidence: string[];
  /** Only copied for an exact, same-direction, verified original relation. */
  strict: boolean;
}
export interface PackingAtlas {
  nodes: Map<string, PackingNode>;
  parent: Map<string, PackingLink>;
  children: Map<string, string[]>;
  roots: string[];
  depth: Map<string, number>;
  original: Atlas;
  /** Newly added source records are visible, but never assigned an invented derivation. */
  unplaced: string[];
}
export type PackingLens =
  | { type: "source"; id: string }
  | { type: "flow"; id: string }
  | { type: "collection"; id: string };
export const ROLE_LABELS: Record<PackingRole, string> = {
  packing: "基本配列", prototype: "構造型・共通模型", material: "具体組成・相", guide: "整理用の分岐",
};
export const RELATION_LABELS: Record<PackingRelation, string> = {
  derivation: "構造上の操作", instance: "具体例", organizes: "分類・比較の案内",
};

export function uniqueRefs(refs: Ref[]): Ref[] {
  return [...new Map(refs.map((r) => [JSON.stringify(r), r])).values()];
}

/** Validate once, fail loudly on stale IDs, duplicate parents, missing evidence or cycles. */
export function buildPackingAtlas(data: Atlas): PackingAtlas {
  const raw = new Map(data.nodes.map((n) => [n.id, n]));
  const evidence = new Map(data.edges.map((e) => [e.id, e]));
  const nodes = new Map<string, PackingNode>();
  for (const n of data.nodes) {
    if (nodes.has(n.id)) throw new Error(`Duplicate structure: ${n.id}`);
    nodes.set(n.id, {
      id: n.id, title: n.name, formula: n.formula,
      role: PACKING_ROOTS.includes(n.id) ? "packing" : PROTOTYPE_IDS.has(n.id) ? "prototype" : "material",
      note: ROOT_CAPTIONS[n.id] ?? n.note ?? "", refs: n.refs, structure: n,
    });
  }
  for (const c of PACKING_CONCEPTS) {
    if (nodes.has(c.id)) throw new Error(`Concept shadows a structure: ${c.id}`);
    for (const id of c.evidence) if (!raw.has(id)) throw new Error(`Missing concept evidence: ${id}`);
    nodes.set(c.id, {
      ...c, refs: uniqueRefs([...(c.refs ?? []), ...c.evidence.flatMap((id) => raw.get(id)!.refs)]),
    });
  }
  const children = new Map([...nodes.keys()].map((id) => [id, [] as string[]]));
  const parent = new Map<string, PackingLink>();
  const attach = (link: PackingLink) => {
    if (!nodes.has(link.parent) || !nodes.has(link.child)) throw new Error(`Unknown placement: ${link.id}`);
    if (PACKING_ROOTS.includes(link.child)) throw new Error(`A root cannot have a primary parent: ${link.child}`);
    if (parent.has(link.child)) throw new Error(`Duplicate primary parent: ${link.child}`);
    if (link.parent === link.child) throw new Error(`Self-parent: ${link.child}`);
    parent.set(link.child, link);
    children.get(link.parent)!.push(link.child);
  };
  for (const p of PACKING_PLACEMENTS) {
    const cited = (p.evidence ?? []).map((id) => {
      const e = evidence.get(id);
      if (!e) throw new Error(`Missing source relation: ${id}`);
      return e;
    });
    for (const child of p.children) {
      const target = nodes.get(child);
      if (!target) throw new Error(`Unknown child: ${child}`);
      const exact = cited.find((e) => e.a === p.parent && e.b === child);
      const matching = cited.filter((e) => e.a === child || e.b === child);
      const refs = uniqueRefs([
        ...(matching.length ? matching : cited).flatMap((e) => e.refs),
        ...target.refs, ...(nodes.get(p.parent)?.refs ?? []),
      ]);
      attach({
        id: `packing:${p.parent}:${child}`, parent: p.parent, child, kind: p.kind,
        label: exact && p.kind === "derivation" ? exact.label : p.label,
        refs, evidence: (matching.length ? matching : cited).map((e) => e.id),
        strict: p.kind === "derivation" && Boolean(exact?.strict) && !exact?.undirected,
      });
    }
  }
  const unplaced = [...raw.keys()].filter((id) => !PACKING_ROOTS.includes(id) && !parent.has(id));
  for (const id of unplaced) {
    const n = nodes.get(id)!;
    nodes.set(id, { ...n, note: `主経路未整理。既存の説明・関連は保持しています。${n.note}` });
    attach({ id: `packing:unplaced:${id}`, parent: "other-roots", child: id, kind: "organizes",
      label: "導出を要確認", refs: n.refs, evidence: [], strict: false });
  }
  // Walk parent chains independently: no topological-sort fallback that silently puts cycles at rank 0.
  const depth = new Map<string, number>();
  for (const id of nodes.keys()) {
    const seen = new Set<string>();
    let current = id, d = 0;
    while (parent.has(current)) {
      if (seen.has(current)) throw new Error(`Cycle in packing hierarchy at ${current}`);
      seen.add(current); current = parent.get(current)!.parent; d++;
    }
    if (!PACKING_ROOTS.includes(current)) throw new Error(`Unrooted concept: ${id}`);
    depth.set(id, d);
  }
  return { nodes, parent, children, roots: [...PACKING_ROOTS], depth, original: data, unplaced };
}

export function ancestors(atlas: PackingAtlas, id: string): string[] {
  if (!atlas.nodes.has(id)) return [];
  const path: string[] = [];
  let current: string | undefined = id;
  while (current) { path.unshift(current); current = atlas.parent.get(current)?.parent; }
  return path;
}
export function descendants(atlas: PackingAtlas, id: string): string[] {
  const queue = id === "all" ? [...atlas.roots] : atlas.nodes.has(id) ? [id] : [];
  for (const next of queue) queue.push(...(atlas.children.get(next) ?? []));
  return queue;
}
export function rootOf(atlas: PackingAtlas, id: string): string {
  return ancestors(atlas, id)[0] ?? "other-roots";
}
export function lensMatches(atlas: PackingAtlas, lens: PackingLens | null): Set<string> {
  if (!lens) return new Set();
  const d = atlas.original;
  if (lens.type === "collection") return new Set(d.collections.find((c) => c.id === lens.id)?.ids ?? []);
  if (lens.type === "flow") {
    const ids = new Set(d.flows.find((f) => f.id === lens.id)?.edges ?? []);
    return new Set(d.edges.filter((e) => ids.has(e.id)).flatMap((e) => [e.a, e.b]));
  }
  return new Set([...atlas.nodes.values()].filter((n) => n.refs.some((r) => r.s === lens.id)).map((n) => n.id));
}
export function lensTitle(atlas: PackingAtlas, lens: PackingLens | null): string {
  if (!lens) return "出典・テーマの強調なし";
  if (lens.type === "source") return atlas.original.sources[lens.id]?.short ?? lens.id;
  if (lens.type === "flow") return atlas.original.flows.find((f) => f.id === lens.id)?.title ?? lens.id;
  return atlas.original.collections.find((c) => c.id === lens.id)?.title ?? lens.id;
}

export interface PackingView {
  ids: string[];
  links: PackingLink[];
  context: Set<string>;
  highlighted: Set<string>;
  folded: Map<string, number>;
}
/** Themes change the highlight only. Narrowing, when explicitly requested, retains every ancestor. */
export function projectPacking(
  atlas: PackingAtlas, anchor = "all", collapsed: ReadonlySet<string> = new Set(),
  lens: PackingLens | null = null, lensOnly = false,
): PackingView {
  const highlighted = lensMatches(atlas, lens);
  const members = new Set(lensOnly && lens ? [...highlighted] : descendants(atlas, anchor));
  const included = new Set(members);
  for (const id of members) for (const p of ancestors(atlas, id)) included.add(p);
  const context = new Set([...included].filter((id) => !members.has(id)));
  const visible = new Set<string>();
  const folded = new Map<string, number>();
  // A contextual ancestor cannot hide the node the reader explicitly opened.
  const walk = (id: string) => {
    if (!included.has(id)) return;
    visible.add(id);
    const kids = atlas.children.get(id) ?? [];
    if (collapsed.has(id) && !context.has(id) && !(lensOnly && lens)) {
      const hidden = descendants(atlas, id).filter((child) => child !== id && included.has(child));
      if (hidden.length) folded.set(id, hidden.length);
    } else for (const child of kids) walk(child);
  };
  for (const root of atlas.roots) walk(root);
  return {
    ids: [...visible], context, highlighted, folded,
    links: [...atlas.parent.values()].filter((p) => visible.has(p.parent) && visible.has(p.child)),
  };
}

export interface PackingPoint { x: number; y: number }
export const PACKING_CARD = { width: 224, height: 100, column: 252, row: 166 };
/** Ordered-tree layout: parents are centred above their own subtrees; no row wrapping. */
export function packingPositions(atlas: PackingAtlas, view: PackingView): Map<string, PackingPoint> {
  const ids = new Set(view.ids);
  const width = new Map<string, number>();
  const children = (id: string) => (atlas.children.get(id) ?? []).filter((child) => ids.has(child));
  const measure = (id: string): number => {
    const w = Math.max(1, children(id).reduce((sum, child) => sum + measure(child), 0));
    width.set(id, w); return w;
  };
  const roots = atlas.roots.filter((r) => ids.has(r));
  roots.forEach(measure);
  const positions = new Map<string, PackingPoint>();
  const place = (id: string, left: number) => {
    positions.set(id, { x: (left + width.get(id)! / 2) * PACKING_CARD.column,
      y: (atlas.depth.get(id) ?? 0) * PACKING_CARD.row + 90 });
    let offset = left;
    for (const child of children(id)) { place(child, offset); offset += width.get(child)!; }
  };
  let offset = 0;
  for (const root of roots) { place(root, offset); offset += width.get(root)! + 1; }
  return positions;
}

/** Raw relationships are retained as a separate overlay, never as rank constraints. */
export function alternativeRelations(atlas: PackingAtlas, ids: ReadonlySet<string>): AtlasEdge[] {
  const primaryPairs = new Set([...atlas.parent.values()].map((p) => `${p.parent}\0${p.child}`));
  return atlas.original.edges.filter((e) => ids.has(e.a) && ids.has(e.b) &&
    !primaryPairs.has(`${e.a}\0${e.b}`));
}
export function searchPacking(atlas: PackingAtlas, query: string): PackingNode[] {
  const normal = (s: string) => s.normalize("NFKC").toLowerCase().replace(/[\s·₀-₉]/g, (c) =>
    "₀₁₂₃₄₅₆₇₈₉".includes(c) ? String("₀₁₂₃₄₅₆₇₈₉".indexOf(c)) : "");
  const q = normal(query);
  if (!q) return [];
  return [...atlas.nodes.values()].filter((n) => normal([
    n.id, n.title, n.formula, n.structure?.aliases ?? "", n.structure?.sg ?? "",
  ].join(" ")).includes(q));
}
