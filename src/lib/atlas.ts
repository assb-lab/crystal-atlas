/** Pure queries over the dataset. No DOM access, so everything here is unit-testable. */
import { DATA } from "../data/atlas.ts";
import type { AtlasEdge, AtlasNode, Collection, Flow } from "../types.ts";
import { normalize } from "./format.ts";

export const N = new Map(DATA.nodes.map((n) => [n.id, n]));
export const E = new Map(DATA.edges.map((e) => [e.id, e]));
export const ALL = "all";

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

export function familyOf(id: string) {
  const f = DATA.families[id];
  if (!f) throw new Error(`Unknown family ${id}`);
  return f;
}

export const findCollection = (id: string | null): Collection | undefined =>
  id ? DATA.collections.find((c) => c.id === id) : undefined;

export const findFlow = (id: string | null): Flow | undefined =>
  id ? DATA.flows.find((f) => f.id === id) : undefined;

/** What the map shows: a source flow, a classification, or a family ("all" = every family). */
export interface Scope {
  family: string;
  flow: string | null;
  collection: string | null;
  strict: boolean;
}

export interface Graph {
  nodes: AtlasNode[];
  edges: AtlasEdge[];
}

/** Structures and relations in scope; the strict filter keeps confirmed group–subgroup relations. */
export function scopeGraph({ family, flow, collection, strict }: Scope): Graph {
  const f = findFlow(flow);
  if (f) {
    // Source flows show arrows in the direction the figure describes.
    const edges = f.edges
      .map((id) => ({ ...edge(id), undirected: false }))
      .filter((e) => !strict || e.strict);
    const ids = new Set(edges.flatMap((e) => [e.a, e.b]));
    return { nodes: [...ids].map(node), edges };
  }
  const c = findCollection(collection);
  const nodes = c
    ? c.ids.map(node)
    : DATA.nodes.filter((n) => family === ALL || n.family === family);
  const ids = new Set(nodes.map((n) => n.id));
  const edges = DATA.edges.filter((e) => ids.has(e.a) && ids.has(e.b) && (!strict || e.strict));
  const linked = new Set(edges.flatMap((e) => [e.a, e.b]));
  return { nodes: strict ? nodes.filter((n) => linked.has(n.id)) : nodes, edges };
}

export const hasStrictRelation = (id: string) =>
  DATA.edges.some((e) => e.strict && (e.a === id || e.b === id));

export const relationsOf = (id: string, strict: boolean) =>
  DATA.edges.filter((e) => (e.a === id || e.b === id) && (!strict || e.strict));

/** Relations from a structure to structures in other families. */
export const crossFamilyCount = (id: string, strict: boolean) =>
  relationsOf(id, strict).filter((e) => node(e.a).family !== node(e.b).family).length;

/** Structures with a unit cell: a coordinate model or a built-in idealized model. */
export const hasModel = (n: AtlasNode) => Boolean(n.model) || Object.hasOwn(DATA.models, n.id);

/** Search over names, formulas, aliases, symmetry, descriptions and classification labels. */
export function searchMatches(value: string): AtlasNode[] {
  const query = normalize(value);
  if (!query) return DATA.nodes;
  const priority = (n: AtlasNode) => {
    if ([n.formula, n.name, n.aliases].some((v) => normalize(v) === query)) return 2;
    return Number(normalize(n.name).includes(query));
  };
  return DATA.nodes
    .filter((n) =>
      normalize(
        [
          n.id,
          n.name,
          n.formula,
          n.aliases,
          n.sg,
          n.desc,
          ...(DATA.structureLabels[n.id] ?? []).map((l) => l.value),
        ].join(" "),
      ).includes(query),
    )
    .sort((a, b) => priority(b) - priority(a));
}

/** Arrow glyph for a relation as seen from `from`. */
export const arrowFrom = (e: AtlasEdge, from: string) =>
  e.undirected ? "↔" : e.a === from ? "→" : "←";
