import type { Atlas, AtlasEdge, AtlasNode, Ref } from "../types.ts";
import { CONCEPTS, PACKING_ROOTS, PLACEMENTS, ROLES, type PackingRole, type Placement, type PlacementKind } from "../data/packing.ts";

export interface PackingEntry {
  id: string;
  title: string;
  description: string;
  role: PackingRole;
  structure?: AtlasNode;
  refs: Ref[];
}
export interface PackingLink {
  id: string;
  parent: string;
  child: string;
  kind: PlacementKind;
  label: string;
  refs: Ref[];
  evidence: string[];
}
export interface PackingTree {
  entries: Map<string, PackingEntry>;
  links: PackingLink[];
  parent: Map<string, PackingLink>;
  children: Map<string, string[]>;
  roots: string[];
  unassigned: string[];
}
export type Lens = { kind: "collection" | "flow"; id: string } | null;
export interface PackingView {
  entries: PackingEntry[];
  links: PackingLink[];
  /** Hidden descendants at explicit folds, not a truncation by generation. */
  folds: Map<string, number>;
  matched: Set<string>;
  context: Set<string>;
}
export interface PackingPoint { x: number; y: number; rank: number }
export const ROLE_LABELS: Record<PackingRole, string> = {
  packing: "基本配列", structure: "構造・代表模型", material: "具体物質・相", topic: "整理の枝",
};
export const LINK_LABELS: Record<PlacementKind, string> = {
  derive: "構造の記述・派生", example: "具体化", topic: "案内（構造変換ではない）",
};

export function uniqueRefs(refs: Ref[]): Ref[] {
  const seen = new Set<string>();
  return refs.filter((ref) => {
    const key = JSON.stringify(ref);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Only the explicit placements set parents. Never infer one from edge direction or old family. */
export function buildPackingTree(data: Atlas, placements: Placement[] = PLACEMENTS): PackingTree {
  const originals = new Map(data.nodes.map((n) => [n.id, n]));
  const relations = new Map(data.edges.map((e) => [e.id, e]));
  const entries = new Map<string, PackingEntry>();
  for (const n of data.nodes) {
    if (entries.has(n.id)) throw new Error(`Duplicate structure ${n.id}`);
    entries.set(n.id, { id: n.id, title: n.name, description: n.desc, role: ROLES[n.id] ?? "structure", structure: n, refs: n.refs });
  }
  for (const c of CONCEPTS) {
    if (entries.has(c.id)) throw new Error(`Duplicate concept ${c.id}`);
    entries.set(c.id, { ...c, role: "topic" });
  }
  const roots: string[] = [...PACKING_ROOTS];
  const rootSet = new Set(roots);
  const parent = new Map<string, PackingLink>();
  const children = new Map<string, string[]>([...entries.keys()].map((id) => [id, []]));
  const links: PackingLink[] = [];
  const add = (p: Placement) => {
    if (!entries.has(p.parent) || !entries.has(p.child)) throw new Error(`Unknown hierarchy endpoint ${p.parent} -> ${p.child}`);
    if (p.parent === p.child || rootSet.has(p.child)) throw new Error(`Invalid root/self parent ${p.child}`);
    if (parent.has(p.child)) throw new Error(`Multiple primary parents: ${p.child}`);
    if (entries.get(p.parent)!.role === "material") throw new Error(`A material cannot parent another structure: ${p.parent}`);
    const evidence = p.evidence ?? [];
    for (const id of evidence) if (!relations.has(id)) throw new Error(`Missing source relation ${id}`);
    const refs = uniqueRefs([
      ...(p.refs ?? []),
      ...evidence.flatMap((id) => relations.get(id)!.refs),
      ...(entries.get(p.child)?.refs ?? []),
    ]);
    for (const r of refs) if (!data.sources[r.s]) throw new Error(`Unknown source ${r.s}`);
    if (p.kind !== "topic" && !refs.length) throw new Error(`Unreferenced hierarchy relation ${p.child}`);
    const link: PackingLink = { ...p, id: `packing:${p.child}`, evidence, refs };
    links.push(link);
    parent.set(p.child, link);
    children.get(p.parent)!.push(p.child);
  };
  placements.forEach(add);
  const unassigned = data.nodes.filter((n) => !rootSet.has(n.id) && !parent.has(n.id)).map((n) => n.id);
  for (const child of unassigned) add({ parent: "@unassigned", child, kind: "topic", label: "親経路未検証（帰属を推測しない）" });
  // A visiting set rejects cycles instead of silently putting cyclic vertices in rank zero.
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (id: string) => {
    if (visiting.has(id)) throw new Error(`Cycle in packing hierarchy at ${id}`);
    if (visited.has(id)) return;
    visiting.add(id);
    for (const child of children.get(id) ?? []) visit(child);
    visiting.delete(id);
    visited.add(id);
  };
  for (const id of entries.keys()) visit(id);
  const tree = { entries, links, parent, children, roots, unassigned };
  for (const id of originals.keys()) {
    const path = ancestors(tree, id);
    if (!rootSet.has(path[0])) throw new Error(`Unrooted original structure ${id}`);
  }
  return tree;
}

/** Root-to-node path, including both ends. */
export function ancestors(tree: PackingTree, id: string): string[] {
  if (!tree.entries.has(id)) return [];
  const path = [id];
  const seen = new Set(path);
  let link = tree.parent.get(id);
  while (link) {
    if (seen.has(link.parent)) throw new Error(`Cycle at ${link.parent}`);
    path.push(link.parent);
    seen.add(link.parent);
    link = tree.parent.get(link.parent);
  }
  return path.reverse();
}
export function descendants(tree: PackingTree, id: string): string[] {
  if (!tree.entries.has(id)) return [];
  const result = [id];
  const seen = new Set(result);
  for (const key of result) for (const child of tree.children.get(key) ?? []) if (!seen.has(child)) {
    seen.add(child);
    result.push(child);
  }
  return result;
}
export function lensMembers(data: Atlas, lens: Lens): Set<string> | null {
  if (!lens) return null;
  if (lens.kind === "collection") {
    const collection = data.collections.find((c) => c.id === lens.id);
    return new Set(collection?.ids ?? []);
  }
  const flow = data.flows.find((f) => f.id === lens.id);
  const ids = new Set(flow?.edges ?? []);
  return new Set(data.edges.filter((e) => ids.has(e.id)).flatMap((e) => [e.a, e.b]));
}

/** Select one subtree or a cross-cutting index, always retaining the complete primary ancestry. */
export function packingView(tree: PackingTree, focus: string, members: Set<string> | null = null, collapsed: ReadonlySet<string> = new Set()): PackingView {
  const matched = members ?? new Set(focus === "@all" ? [...tree.entries.keys()] : descendants(tree, focus));
  const included = new Set<string>();
  for (const id of matched) for (const ancestor of ancestors(tree, id)) included.add(ancestor);
  const hidden = new Set<string>();
  const folds = new Map<string, number>();
  for (const id of collapsed) {
    if (!included.has(id)) continue;
    const below = descendants(tree, id).slice(1).filter((child) => included.has(child));
    below.forEach((child) => hidden.add(child));
    if (below.length) folds.set(id, below.length);
  }
  const visible = new Set([...included].filter((id) => !hidden.has(id)));
  for (const id of folds.keys()) if (!visible.has(id)) folds.delete(id);
  return {
    entries: [...tree.entries.values()].filter((e) => visible.has(e.id)),
    links: tree.links.filter((e) => visible.has(e.parent) && visible.has(e.child)),
    folds,
    matched,
    context: new Set([...visible].filter((id) => !matched.has(id))),
  };
}

/** Source relations are overlays only. Original a/b, undirected and strict flags are preserved. */
export function overlayRelations(data: Atlas, view: PackingView, options: { source?: string; flow?: string; strict?: boolean } = {}): AtlasEdge[] {
  const ids = new Set(view.entries.filter((e) => e.structure).map((e) => e.id));
  const flow = options.flow ? new Set(data.flows.find((f) => f.id === options.flow)?.edges ?? []) : null;
  return data.edges.filter((e) => ids.has(e.a) && ids.has(e.b)
    && (!options.strict || e.strict)
    && (!options.source || e.refs.some((r) => r.s === options.source))
    && (!flow || flow.has(e.id)));
}

/** Stable rank bands; examples form a bottom band, even when attached directly to a simple type. */
export function packingPositions(tree: PackingTree, view: PackingView): Map<string, PackingPoint> {
  const rank = new Map(view.entries.map((e) => [e.id, ancestors(tree, e.id).length - 1]));
  const structuralMax = Math.max(0, ...view.entries.filter((e) => e.role !== "material").map((e) => rank.get(e.id)!));
  for (const e of view.entries) if (e.role === "material") rank.set(e.id, structuralMax + 1);
  // DFS keeps sibling subtrees together rather than using stale per-family coordinates.
  const order = new Map<string, number>();
  const walk = (id: string) => {
    order.set(id, order.size);
    for (const child of tree.children.get(id) ?? []) walk(child);
  };
  tree.roots.forEach(walk);
  const rows = new Map<number, PackingEntry[]>();
  for (const entry of view.entries) {
    const r = rank.get(entry.id)!;
    if (!rows.has(r)) rows.set(r, []);
    rows.get(r)!.push(entry);
  }
  const positions = new Map<string, PackingPoint>();
  for (const [r, entries] of rows) {
    entries.sort((a, b) => order.get(a.id)! - order.get(b.id)!);
    entries.forEach((entry, i) => positions.set(entry.id, { x: (i - (entries.length - 1) / 2) * 286, y: r * 174, rank: r }));
  }
  return positions;
}
