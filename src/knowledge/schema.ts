/** Versioned physical schema. Scientific relations are nodes so they can carry evidence. */
export const KNOWLEDGE_SCHEMA_VERSION = 3;
export const LADYBUG_VERSION = "0.22.3";
export type AtlasMode = "family" | "derivation" | "symmetry";
export type Cell = string | number | boolean | null;
export interface Table {
  name: string;
  columns: [string, string][];
  endpoints?: [string, string];
}
const columns = (names: string[]): [string, string][] => names.map((n) => [n, "STRING"]);
const node = (name: string, names: string[]): Table => ({ name, columns: columns(names) });
const rel = (name: string, from: string, to: string, extra: [string, string][] = []): Table => ({
  name,
  columns: extra,
  endpoints: [from, to],
});
export const TABLES: Table[] = [
  node("Entity", ["id", "title", "kind", "payload"]),
  node("Assertion", [
    "id",
    "domain",
    "operation",
    "label",
    "description",
    "status",
    "basis",
    "payload",
  ]),
  node("OperationStep", ["id", "operation", "target", "parameters", "payload"]),
  node("Document", ["id", "title", "payload"]),
  node("SourceSpan", ["id", "payload"]),
  node("StructureModel", ["id", "payload"]),
  node("DerivationRoute", ["id", "title", "payload"]),
  // Asset inventory and pending coverage are distinct from extracted Mentions and completed reviews.
  node("Asset", ["id", "sha256", "payload"]),
  node("Mention", ["id", "rawName", "status", "payload"]),
  node("RelationCandidate", ["id", "domain", "operation", "status", "payload"]),
  node("CoverageReview", ["id", "status", "payload"]),
  node("ProcessingRun", ["id", "payload"]),
  rel("Subject", "Assertion", "Entity"),
  rel("Object", "Assertion", "Entity"),
  rel("HasEvidence", "Assertion", "SourceSpan"),
  rel("InDocument", "SourceSpan", "Document"),
  rel("HasStep", "Assertion", "OperationStep", [["ordinal", "INT64"]]),
  rel("ExplainsSymmetryOf", "Assertion", "Assertion"),
  rel("Models", "StructureModel", "Entity"),
  rel("RouteMember", "DerivationRoute", "Assertion", [["ordinal", "INT64"]]),
  rel("HasAsset", "Document", "Asset"),
  rel("CandidateAsset", "Document", "Asset"),
  rel("CataloguedBy", "Asset", "ProcessingRun"),
  rel("LocatedIn", "SourceSpan", "Asset"),
  rel("ContainsMention", "SourceSpan", "Mention"),
  rel("RefersTo", "Mention", "Entity"),
  rel("CandidateRefersTo", "Mention", "Entity", [["note", "STRING"]]),
  rel("CandidateSubject", "RelationCandidate", "Mention"),
  rel("CandidateObject", "RelationCandidate", "Mention"),
  rel("CandidateEvidence", "RelationCandidate", "SourceSpan"),
  rel("CandidateMatches", "RelationCandidate", "Assertion", [["note", "STRING"]]),
  rel("MentionByRun", "Mention", "ProcessingRun"),
  rel("CandidateByRun", "RelationCandidate", "ProcessingRun"),
  rel("Reviews", "CoverageReview", "Asset"),
  rel("ByRun", "CoverageReview", "ProcessingRun"),
];
export function tableDDL(table: Table): string {
  const properties = table.columns.map(([name, type]) => `${name} ${type}`);
  return table.endpoints
    ? `CREATE REL TABLE ${table.name}(FROM ${table.endpoints[0]} TO ${table.endpoints[1]}${properties.length ? `, ${properties.join(", ")}` : ""})`
    : `CREATE NODE TABLE ${table.name}(${properties.join(", ")}, PRIMARY KEY(id))`;
}
export interface KnowledgeManifest {
  schemaVersion: number;
  engineVersion: string;
  storageVersion: string;
  datasetVersion: string;
  datasetHash: string;
  databaseHash: string;
  buildHash: string;
  datasetFileHash: string;
  schemaHash: string;
  bytes: number;
  counts: Record<string, number>;
  coverage: "legacy-curated-subset";
}
export interface KnowledgeDistributionManifest extends KnowledgeManifest {
  files: { database: string; module: string; worker: string };
}
