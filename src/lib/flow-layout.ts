/** Derivation layout: parents above children, every generation kept unless a branch is folded. */
import type { AtlasEdge, AtlasNode } from "../types.ts";

/** The layout needs only identity, the reference x (ordering within a rank), and direction. */
export type LayoutNode = Pick<AtlasNode, "id" | "x">;
export type LayoutEdge = Pick<AtlasEdge, "a" | "b" | "undirected">;

export interface Point {
  x: number;
  y: number;
}

export interface FoldGroup {
  /** Position key in the layout, `group:<parent>`. */
  id: string;
  /** The folded structure. */
  key: string;
  parent: string;
  /** Descendants hidden only through this fold. */
  count: number;
}

export interface DerivationView<
  N extends LayoutNode = AtlasNode,
  E extends LayoutEdge = AtlasEdge,
> {
  nodes: N[];
  edges: E[];
  groups: FoldGroup[];
  positions: Map<string, Point>;
}

export const COLUMN = 270;
export const ROW = 180;

/** Rank the arrows by derivation depth. Comparisons without arrows do not set a rank. */
export function derivationPositions(nodes: LayoutNode[], edges: LayoutEdge[]): Map<string, Point> {
  const indegree = new Map(nodes.map((node) => [node.id, 0]));
  const children = new Map<string, string[]>(
    nodes.map((node): [string, string[]] => [node.id, []]),
  );
  for (const edge of edges) {
    if (edge.undirected) continue;
    children.get(edge.a)!.push(edge.b);
    indegree.set(edge.b, indegree.get(edge.b)! + 1);
  }
  const ranks = new Map(nodes.map((node) => [node.id, 0]));
  const queue = nodes.filter((node) => indegree.get(node.id) === 0).map((node) => node.id);
  for (const id of queue) {
    for (const child of children.get(id)!) {
      ranks.set(child, Math.max(ranks.get(child)!, ranks.get(id)! + 1));
      indegree.set(child, indegree.get(child)! - 1);
      if (indegree.get(child) === 0) queue.push(child);
    }
  }
  const rows = new Map<number, LayoutNode[]>();
  for (const node of nodes) {
    const rank = ranks.get(node.id)!;
    if (!rows.has(rank)) rows.set(rank, []);
    rows.get(rank)!.push(node);
  }
  const positions = new Map<string, Point>();
  let top = 0;
  for (const [, row] of [...rows].sort(([a], [b]) => a - b)) {
    row.sort((a, b) => a.x - b.x);
    row.forEach((node, i) =>
      positions.set(node.id, { x: (i - (row.length - 1) / 2) * COLUMN, y: top }),
    );
    top += ROW;
  }
  return positions;
}

function walk(starts: string[], links: Map<string, string[]>, stops = new Set<string>()) {
  const seen = new Set(starts);
  const queue = [...starts];
  for (const id of queue) {
    if (stops.has(id)) continue;
    for (const next of links.get(id) ?? [])
      if (!seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
  }
  return seen;
}

/**
 * Retain every generation. With an anchor, keep its ancestors, descendants and direct comparisons.
 * Only explicitly folded branches hide descendants; a shared descendant stays while another
 * unfolded parent still reaches it.
 */
export function derivationGraph<N extends LayoutNode, E extends LayoutEdge>(
  nodes: N[],
  edges: E[],
  anchor: string | null = null,
  collapsed: ReadonlySet<string> = new Set(),
): DerivationView<N, E> {
  const ids = new Set(nodes.map((node) => node.id));
  const directed = edges.filter((edge) => !edge.undirected);
  const children = new Map<string, string[]>(
    nodes.map((node): [string, string[]] => [node.id, []]),
  );
  const parents = new Map<string, string[]>(nodes.map((node): [string, string[]] => [node.id, []]));
  for (const edge of directed) {
    children.get(edge.a)!.push(edge.b);
    parents.get(edge.b)!.push(edge.a);
  }
  let included = ids;
  if (anchor !== null) {
    if (!ids.has(anchor)) return { nodes: [], edges: [], groups: [], positions: new Map() };
    included = new Set([...walk([anchor], children), ...walk([anchor], parents)]);
    // Direct comparisons provide context but never stand in for a derivation.
    for (const edge of edges.filter((e) => e.undirected)) {
      if (edge.a === anchor) included.add(edge.b);
      if (edge.b === anchor) included.add(edge.a);
    }
  }
  const scopedNodes = nodes.filter((node) => included.has(node.id));
  const scopedEdges = edges.filter((edge) => included.has(edge.a) && included.has(edge.b));
  const scopedChildren = new Map<string, string[]>(
    scopedNodes.map((node): [string, string[]] => [node.id, []]),
  );
  const childIds = new Set<string>();
  for (const edge of scopedEdges.filter((e) => !e.undirected)) {
    scopedChildren.get(edge.a)!.push(edge.b);
    childIds.add(edge.b);
  }
  const roots = scopedNodes.filter((node) => !childIds.has(node.id)).map((node) => node.id);
  const visible = collapsed.size ? walk(roots, scopedChildren, new Set(collapsed)) : included;
  const groups: FoldGroup[] = [];
  for (const id of collapsed) {
    if (!visible.has(id) || !included.has(id)) continue;
    const hidden = [...walk([id], scopedChildren)].filter((child) => !visible.has(child));
    if (hidden.length)
      groups.push({ id: `group:${id}`, key: id, parent: id, count: hidden.length });
  }
  const positions = derivationPositions(scopedNodes, scopedEdges);
  const shownNodes = scopedNodes.filter((node) => visible.has(node.id));
  const shownEdges = scopedEdges.filter((edge) => visible.has(edge.a) && visible.has(edge.b));
  if (!groups.length) return { nodes: shownNodes, edges: shownEdges, groups, positions };
  // Keep original generation heights while closing the horizontal gaps of folded branches.
  const rows = new Map<number, (Point & { id: string })[]>();
  const marks = [
    ...shownNodes.map((node) => ({ id: node.id, ...positions.get(node.id)! })),
    ...groups.map((group) => ({
      id: group.id,
      x: positions.get(group.parent)!.x,
      y: positions.get(group.parent)!.y + ROW,
    })),
  ];
  for (const mark of marks) {
    if (!rows.has(mark.y)) rows.set(mark.y, []);
    rows.get(mark.y)!.push(mark);
  }
  const compact = new Map<string, Point>();
  for (const [y, row] of rows) {
    row.sort((a, b) => a.x - b.x);
    row.forEach((mark, i) => compact.set(mark.id, { x: (i - (row.length - 1) / 2) * COLUMN, y }));
  }
  return { nodes: shownNodes, edges: shownEdges, groups, positions: compact };
}

export interface Curve {
  d: string;
  /** Midpoint for a label. */
  mx: number;
  my: number;
}

/** Cubic connectors retain smooth tangents, including routes around intermediate ranks. */
export function relationshipCurve(
  p: Point,
  q: Point,
  positions: Map<string, Point>,
  lane = 0,
  horizontal = false,
): Curve {
  const dx = q.x - p.x;
  const dy = q.y - p.y;
  let sx: number,
    sy: number,
    ex: number,
    ey: number,
    c1x: number,
    c1y: number,
    c2x: number,
    c2y: number;
  if (horizontal && Math.abs(dx) > 240) {
    const sign = Math.sign(dx);
    sx = p.x + sign * 110;
    sy = p.y;
    ex = q.x - sign * 110;
    ey = q.y;
    c1x = sx + sign * Math.abs(ex - sx) * 0.55;
    c1y = sy;
    c2x = ex - sign * Math.abs(ex - sx) * 0.55;
    c2y = ey;
  } else if (Math.abs(dy) > 230 && !horizontal) {
    // Long derivations leave the stack and travel down the side, clear of intermediate ranks.
    const sign = Math.sign(dy);
    const points = [...positions.values()];
    const sideSign = p.x + q.x < 0 ? -1 : 1;
    const side =
      sideSign < 0
        ? Math.min(...points.map((point) => point.x)) - 160 - lane * 12
        : Math.max(...points.map((point) => point.x)) + 160 + lane * 12;
    sy = p.y + sign * 43;
    ey = q.y - sign * 43;
    const enter = sy + sign * 65;
    const leave = ey - sign * 65;
    const middle = (sy + ey) / 2;
    return {
      d: `M${p.x},${sy} C${p.x},${enter} ${side},${sy} ${side},${enter} C${side},${middle} ${side},${middle} ${side},${leave} C${side},${ey} ${q.x},${leave} ${q.x},${ey}`,
      mx: side,
      my: middle,
    };
  } else if (Math.abs(dy) < 72) {
    sx = p.x;
    sy = p.y - 43;
    ex = q.x;
    ey = q.y - 43;
    c1x = sx;
    c2x = ex;
    c1y = c2y = Math.min(sy, ey) - 85 - lane * 12;
  } else {
    const sign = Math.sign(dy);
    sx = p.x;
    sy = p.y + sign * 43;
    ex = q.x;
    ey = q.y - sign * 43;
    const bend = Math.max(40, Math.abs(ey - sy) * 0.5);
    c1x = sx;
    c1y = sy + sign * bend;
    c2x = ex;
    c2y = ey - sign * bend;
  }
  return {
    d: `M${sx},${sy} C${c1x},${c1y} ${c2x},${c2y} ${ex},${ey}`,
    mx: (sx + 3 * c1x + 3 * c2x + ex) / 8,
    my: (sy + 3 * c1y + 3 * c2y + ey) / 8,
  };
}
