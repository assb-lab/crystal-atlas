/** Shapes of the curated atlas dataset. See docs/DATA_MODEL.md for field meanings. */

/** Page reference: source id, printed page, section label. */
export interface Ref {
  s: string;
  p: number;
  sec: string;
}

export interface Source {
  short: string;
  title: string;
  author: string;
  year: string;
  edition: string;
  /** Public PDF; otherwise the reader can associate a local copy. */
  url?: string;
  filename?: string;
  /** PDF page = printed page + offset. */
  offset: number;
  coverage: string;
}

export interface Family {
  name: string;
  short: string;
  color: string;
  subtitle: string;
  /** Legacy v1.0 layout offset; kept for data compatibility. */
  x: number;
  y: number;
}

export type KindId =
  | "symmetry"
  | "occupation"
  | "ordering"
  | "distortion"
  | "stacking"
  | "analogy"
  | "antitype";

export interface Kind {
  name: string;
  color: string;
  dash: string;
  meaning: string;
}

export interface AtlasNode {
  id: string;
  name: string;
  formula: string;
  family: string;
  sg: string;
  desc: string;
  packing: string;
  coord: string;
  link: string;
  refs: Ref[];
  /** Card centre within its family map. */
  x: number;
  y: number;
  /** Idealized model id for the rotating viewer. */
  model?: string;
  aliases: string;
  note?: string;
  /** Occupancy of all tetrahedral / octahedral holes. */
  occ?: number[];
  host?: string;
}

export interface AtlasEdge {
  id: string;
  a: string;
  b: string;
  kind: KindId;
  label: string;
  desc: string;
  refs: Ref[];
  /** Literature-confirmed group–subgroup relation. */
  strict?: boolean;
  undirected?: boolean;
  index?: string;
  basis?: string;
  split?: string;
  warning?: string;
}

export interface Atlas {
  version: string;
  date: string;
  sources: Record<string, Source>;
  families: Record<string, Family>;
  nodes: AtlasNode[];
  edges: AtlasEdge[];
}

export interface Route {
  title: string;
  desc: string;
  ids: string[];
}

export interface LabPreset {
  id: string;
  label: string;
  formula: string;
  /** Elements on sublattices A–D; null is a vacant sublattice. */
  els: (string | null)[];
  desc: string;
}

export interface OccPreset {
  name: string;
  t: number;
  o: number;
  title: string;
  desc: string;
  refs: Ref[];
}
