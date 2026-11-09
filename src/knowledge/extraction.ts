import type { Atlas, Ref } from "../types.ts";
import { assetId, type LiteratureCatalog } from "./catalog.ts";
import type { Cell } from "./schema.ts";

export interface ExtractionBatch {
  id: string;
  sourceId: string;
  assetHash: string;
  reviewedOn: string;
  operator: string;
  pdfFrom: number;
  pdfTo: number;
  pageAnchors: { pdfPage: number; printedPage: number }[];
  scope: string;
  limitations: string[];
  spans: { id: string; ref: Ref & { pdfPage: number; p: number }; surface: "body" | "figure" }[];
  mentions: {
    id: string;
    rawName: string;
    spanId: string;
    identityNote: string;
    candidates: { entityId: string; note: string }[];
  }[];
  relations: {
    id: string;
    domain: "derivation" | "comparison";
    operation: string;
    basis: "source_paraphrase" | "editorial_comparison";
    subjectMention: string;
    objectMention: string;
    evidenceSpanIds: string[];
    description: string;
    parameters: Record<string, unknown>;
    symmetryNote: string | null;
    existingAssertions: { assertionId: string; note: string }[];
  }[];
}
export function appendExtraction(
  rows: Record<string, Cell[][]>,
  data: Atlas,
  catalog: LiteratureCatalog,
  batch: ExtractionBatch,
): void {
  const add = (table: string, ...row: Cell[]) => rows[table]!.push(row);
  const unique = (ids: string[], label: string) => {
    if (new Set(ids).size !== ids.length || ids.some((id) => !id))
      throw new Error(`Duplicate/empty ${label}`);
    return new Set(ids);
  };
  const asset = catalog.assets.find((a) => a.sha256 === batch.assetHash);
  if (
    !asset ||
    asset.mapping.state !== "confirmed" ||
    !asset.mapping.documentIds.includes(batch.sourceId) ||
    !data.sources[batch.sourceId]
  )
    throw new Error("Extraction source/asset is not confirmed");
  if (
    !Number.isSafeInteger(batch.pdfFrom) ||
    !Number.isSafeInteger(batch.pdfTo) ||
    batch.pdfFrom < 1 ||
    batch.pdfTo < batch.pdfFrom ||
    asset.pageCount === null ||
    batch.pdfTo > asset.pageCount ||
    !batch.scope.trim() ||
    !batch.operator.trim() ||
    !/^\d{4}-\d{2}-\d{2}$/.test(batch.reviewedOn)
  )
    throw new Error("Invalid extraction scope");
  const existing = (table: string) => new Set(rows[table]!.map((row) => row[0]));
  if (existing("ProcessingRun").has(batch.id)) throw new Error("Duplicate extraction run");
  const spans = unique(
    batch.spans.map((s) => s.id),
    "extraction span",
  );
  const mentions = unique(
    batch.mentions.map((m) => m.id),
    "mention",
  );
  unique(
    batch.relations.map((r) => r.id),
    "relation candidate",
  );
  const entities = existing("Entity");
  const assertions = existing("Assertion");
  const anchors = new Map(batch.pageAnchors.map((a) => [a.pdfPage, a.printedPage]));
  if (
    anchors.size !== batch.pageAnchors.length ||
    anchors.size !== batch.pdfTo - batch.pdfFrom + 1 ||
    batch.pageAnchors.some(
      (a) =>
        !Number.isSafeInteger(a.pdfPage) ||
        a.pdfPage < batch.pdfFrom ||
        a.pdfPage > batch.pdfTo ||
        !Number.isSafeInteger(a.printedPage) ||
        a.printedPage < 1,
    )
  )
    throw new Error("Invalid page anchors");
  for (const span of batch.spans) {
    if (
      existing("SourceSpan").has(span.id) ||
      span.ref.s !== batch.sourceId ||
      !Number.isSafeInteger(span.ref.pdfPage) ||
      span.ref.pdfPage < batch.pdfFrom ||
      span.ref.pdfPage > batch.pdfTo ||
      !Number.isSafeInteger(span.ref.p) ||
      span.ref.p < 1 ||
      anchors.get(span.ref.pdfPage) !== span.ref.p ||
      !span.ref.sec.trim() ||
      !["body", "figure"].includes(span.surface)
    )
      throw new Error("Invalid extraction locator");
  }
  for (const mention of batch.mentions) {
    if (!spans.has(mention.spanId) || !mention.rawName.trim() || !mention.identityNote.trim())
      throw new Error("Invalid mention locator/name");
    unique(
      mention.candidates.map((c) => c.entityId),
      "entity candidate",
    );
    for (const candidate of mention.candidates)
      if (!entities.has(candidate.entityId) || !candidate.note.trim())
        throw new Error("Unknown entity candidate");
  }
  for (const relation of batch.relations) {
    if (
      !mentions.has(relation.subjectMention) ||
      !mentions.has(relation.objectMention) ||
      !relation.evidenceSpanIds.length ||
      relation.evidenceSpanIds.some((id) => !spans.has(id)) ||
      !relation.description.trim() ||
      !relation.operation.trim()
    )
      throw new Error("Invalid relation candidate evidence/endpoint");
    if (
      !["derivation", "comparison"].includes(relation.domain) ||
      !["source_paraphrase", "editorial_comparison"].includes(relation.basis) ||
      (relation.basis === "editorial_comparison" && relation.domain !== "comparison")
    )
      throw new Error("Invalid candidate semantics");
    unique(relation.evidenceSpanIds, "candidate evidence");
    unique(
      relation.existingAssertions.map((a) => a.assertionId),
      "assertion match",
    );
    for (const match of relation.existingAssertions)
      if (!assertions.has(match.assertionId) || !match.note.trim())
        throw new Error("Unknown assertion match");
  }
  const coverage = asset.coverage.find((r) => r.from === batch.pdfFrom && r.to === batch.pdfTo);
  if (
    !coverage ||
    coverage.channels.body !== "in_progress" ||
    coverage.channels.figures !== "in_progress"
  )
    throw new Error("Candidate extraction needs an in-progress scoped ledger");
  add(
    "ProcessingRun",
    batch.id,
    JSON.stringify({
      activity: "manual_candidate_extraction",
      sourceId: batch.sourceId,
      assetHash: batch.assetHash,
      pdfFrom: batch.pdfFrom,
      pdfTo: batch.pdfTo,
      pageAnchors: batch.pageAnchors,
      reviewedOn: batch.reviewedOn,
      operator: batch.operator,
      scope: batch.scope,
      limitations: batch.limitations,
    }),
  );
  for (const span of batch.spans) {
    add(
      "SourceSpan",
      span.id,
      JSON.stringify({ ...span.ref, surface: span.surface, extractionRun: batch.id }),
    );
    add("InDocument", span.id, batch.sourceId);
    add("LocatedIn", span.id, assetId(batch.assetHash));
  }
  for (const mention of batch.mentions) {
    add("Mention", mention.id, mention.rawName, "candidate_unresolved", JSON.stringify(mention));
    add("ContainsMention", mention.spanId, mention.id);
    add("MentionByRun", mention.id, batch.id);
    for (const candidate of mention.candidates)
      add("CandidateRefersTo", mention.id, candidate.entityId, candidate.note);
  }
  for (const relation of batch.relations) {
    add(
      "RelationCandidate",
      relation.id,
      relation.domain,
      relation.operation,
      "candidate_unresolved",
      JSON.stringify({
        ...relation,
        basisMatrix: null,
        originShift: null,
        wyckoffMapping: null,
        symmetryVerification: "not_verified",
      }),
    );
    add("CandidateSubject", relation.id, relation.subjectMention);
    add("CandidateObject", relation.id, relation.objectMention);
    add("CandidateByRun", relation.id, batch.id);
    for (const id of relation.evidenceSpanIds) add("CandidateEvidence", relation.id, id);
    for (const match of relation.existingAssertions)
      add("CandidateMatches", relation.id, match.assertionId, match.note);
  }
  const ordinal = asset.coverage.indexOf(coverage);
  add("ByRun", `coverage:${asset.sha256}:${ordinal}`, batch.id);
}
