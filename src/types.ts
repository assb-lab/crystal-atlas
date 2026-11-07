/** Shapes of the curated atlas dataset. See docs/DATA_MODEL.md for field meanings. */

/**
 * Citation. Printed sources give `p` (printed page) and optionally `pdfPage`;
 * web sources omit `p` and link to `url` or the source's `article`.
 */
export interface Ref {
  s: string;
  sec: string;
  p?: number;
  pdfPage?: number;
  url?: string;
}

export interface Source {
  short: string;
  title: string;
  /** Formal bibliographic citation shown in the guide. */
  citation?: string;
  author?: string;
  year?: string;
  edition?: string;
  coverage: string;
  /** Public PDF. */
  url?: string;
  /** Web page for references without a printed page. */
  article?: string;
  /** Local PDF the reader can associate. */
  filename?: string;
  /** PDF page = printed page + offset, unless a ref gives pdfPage. */
  offset?: number;
}

export interface Family {
  name: string;
  short: string;
  color: string;
  subtitle: string;
  /** Legacy layout offsets; the map layout is computed from derivation ranks. */
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
  /** Reference layout; x orders cards within a derivation rank. */
  x: number;
  y: number;
  /** Built-in idealized model id (coordinate models are looked up by structure id). */
  model?: string;
  aliases?: string;
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
  /** Comparison without a derivation direction. */
  undirected?: boolean;
  index?: string;
  basis?: string;
  split?: string;
  warning?: string;
}

export interface ClassificationTable {
  title: string;
  headings: string[];
  rows: { cells: string[]; ids: string[] }[];
}

export interface Collection {
  id: string;
  group: string;
  title: string;
  desc: string;
  ids: string[];
  refs: Ref[];
  parent?: string;
  short?: string;
  table?: ClassificationTable;
}

export interface StructureLabel {
  key: string;
  value: string;
  refs: Ref[];
  detail?: string;
}

/** A source figure's derivation sequence, as relation ids. */
export interface Flow {
  id: string;
  title: string;
  desc: string;
  edges: string[];
  refs: Ref[];
}

export type ModelKind = "prototype" | "literature" | "computed" | "average" | "schematic";

export interface SiteGroup {
  wyckoff: string;
  /** Element (or label) → occupancy; the remainder up to 1 is vacancy. */
  occupants: Record<string, number>;
  /** Fractional coordinates of the orbit, each in [0, 1). */
  positions: number[][];
}

export interface CoordinateModel {
  kind: ModelKind;
  source: { label: string; url?: string };
  spaceGroup: number;
  /** [a, b, c, α, β, γ] in Å and degrees (relative lengths for schematic cells). */
  parameters: number[];
  groups: SiteGroup[];
  note?: string;
}

export interface Atlas {
  version: string;
  date: string;
  sources: Record<string, Source>;
  families: Record<string, Family>;
  nodes: AtlasNode[];
  edges: AtlasEdge[];
  collections: Collection[];
  structureLabels: Record<string, StructureLabel[]>;
  flows: Flow[];
  models: Record<string, CoordinateModel>;
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
