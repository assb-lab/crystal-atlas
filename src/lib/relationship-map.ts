/** Layout helpers for the displayed relationship graph. No scientific relation is inferred. */
export interface MapNode {
  id: string;
  title: string;
  subtitle?: string;
}
export interface MapEdge {
  id: string;
  subjectId: string;
  objectId: string;
}
export function connectedSystems(edges: MapEdge[]) {
  const adjacency = new Map<string, Set<string>>();
  for (const e of edges)
    for (const [a, b] of [
      [e.subjectId, e.objectId],
      [e.objectId, e.subjectId],
    ]) {
      if (!adjacency.has(a!)) adjacency.set(a!, new Set());
      adjacency.get(a!)!.add(b!);
    }
  const seen = new Set<string>();
  const systems: { id: string; nodeIds: string[]; edges: MapEdge[] }[] = [];
  for (const id of adjacency.keys())
    if (!seen.has(id)) {
      const queue = [id];
      seen.add(id);
      for (let i = 0; i < queue.length; i++)
        for (const next of adjacency.get(queue[i]!) ?? [])
          if (!seen.has(next)) {
            seen.add(next);
            queue.push(next);
          }
      const members = new Set(queue);
      const subset = edges.filter((e) => members.has(e.subjectId));
      const roots = queue.filter((n) => !subset.some((e) => e.objectId === n));
      systems.push({ id: roots[0] ?? id, nodeIds: queue, edges: subset });
    }
  return systems;
}
/** Fold outgoing branches; a child reachable through another open parent stays visible. */
export function visibleRelationships<E extends MapEdge>(edges: E[], collapsed: Set<string>) {
  const ids = [...new Set(edges.flatMap((e) => [e.subjectId, e.objectId]))];
  const roots = ids.filter((id) => !edges.some((e) => e.objectId === id));
  const visible = new Set<string>();
  const shown = new Set<string>();
  const visit = (start: string) => {
    const queue = [start];
    for (let i = 0; i < queue.length; i++) {
      const id = queue[i]!;
      if (visible.has(id)) continue;
      visible.add(id);
      if (collapsed.has(id)) continue;
      for (const e of edges.filter((e) => e.subjectId === id)) {
        shown.add(e.id);
        queue.push(e.objectId);
      }
    }
  };
  roots.forEach(visit);
  // Components consisting solely of cycles still need an entry; don't re-add folded descendants.
  for (const system of connectedSystems(edges))
    if (!system.nodeIds.some((id) => visible.has(id))) visit(system.nodeIds[0]!);
  return {
    nodeIds: ids.filter((id) => visible.has(id)),
    edges: edges.filter((e) => shown.has(e.id)),
  };
}
/** Parent above child. Parallel source assertions keep distinct edge lanes. */
export function relationshipLayout(nodes: MapNode[], edges: MapEdge[]) {
  const ids = new Set(nodes.map((n) => n.id));
  const pending = new Map(nodes.map((n) => [n.id, 0]));
  const rank = new Map(nodes.map((n) => [n.id, 0]));
  for (const e of edges)
    if (ids.has(e.subjectId) && ids.has(e.objectId))
      pending.set(e.objectId, pending.get(e.objectId)! + 1);
  const queue = nodes.filter((n) => pending.get(n.id) === 0).map((n) => n.id);
  const visited = new Set<string>();
  for (let i = 0; i < queue.length; i++) {
    const id = queue[i]!;
    if (visited.has(id)) continue;
    visited.add(id);
    for (const e of edges.filter((e) => e.subjectId === id && ids.has(e.objectId))) {
      rank.set(e.objectId, Math.max(rank.get(e.objectId)!, rank.get(id)! + 1));
      pending.set(e.objectId, pending.get(e.objectId)! - 1);
      if (pending.get(e.objectId) === 0) queue.push(e.objectId);
    }
  }
  const levels = new Map<number, MapNode[]>();
  for (const n of nodes) {
    const r = rank.get(n.id)!;
    if (!levels.has(r)) levels.set(r, []);
    levels.get(r)!.push(n);
  }
  const bands = new Map<number, number>();
  for (const e of edges) {
    const band = (rank.get(e.subjectId) ?? 0) + (rank.get(e.objectId) ?? 0);
    bands.set(band, (bands.get(band) ?? 0) + 1);
  }
  const width = Math.max(
    500,
    ...[...bands.values()].map((count) => count * 130 + 40),
    ...[...levels.values()].map((level) => level.length * 260 + 40),
  );
  const height = Math.max(370, levels.size * 210 + 70);
  const placed = nodes.map((n) => {
    const level = levels.get(rank.get(n.id)!)!;
    return {
      ...n,
      x: width / 2 + (level.indexOf(n) - (level.length - 1) / 2) * 260 - 110,
      y: 40 + rank.get(n.id)! * 210,
    };
  });
  return { nodes: placed, width, height, cyclic: visited.size !== nodes.length };
}

/** Glazer signs and space-group minus signs carry meaning; do not drop them during search. */
export const classificationSearchKey = (text: string) =>
  text.normalize("NFKD").replaceAll("−", "-").replace(/\s/g, "").toLowerCase();
