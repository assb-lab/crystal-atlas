import type { ExtractionBatch } from "./extraction.ts";
import type { Cell } from "./schema.ts";

/** Deliberately limited to resolving a previously held mention to a newly distinguished lattice type. */
export interface HeldMentionResolution {
  id: string;
  predecessorId: string;
  candidateId: string;
  extractionId: string;
  assetHash: string;
  reviewId: string;
  reviewer: string;
  reviewedOn: string;
  reason: string;
  evidenceSpanIds: string[];
  resolution: { kind: "entity"; entityId: string; scope: string };
  limitations: string[];
}
export function appendHeldMentionResolution(
  rows: Record<string, Cell[][]>,
  extraction: ExtractionBatch,
  revision: HeldMentionResolution,
): void {
  const ids = (table: string) => new Set(rows[table]!.map((r) => r[0]));
  const prior = rows.CandidateDecision!.find((r) => r[0] === revision.predecessorId);
  const mention = extraction.mentions.find((m) => m.id === revision.candidateId);
  const target = rows.Entity!.find((r) => r[0] === revision.resolution.entityId);
  const definitions: unknown = target ? JSON.parse(String(target[3])).definitionSpanIds : null;
  if (
    !prior ||
    prior[1] !== "mention" ||
    prior[2] !== revision.candidateId ||
    prior[3] !== "held" ||
    !mention ||
    extraction.id !== revision.extractionId ||
    extraction.assetHash !== revision.assetHash ||
    !ids("ProcessingRun").has(extraction.id) ||
    !ids("Mention").has(revision.candidateId) ||
    !rows.DecisionAboutMention!.some(([d, m]) => d === prior[0] && m === mention.id) ||
    ids("CandidateDecision").has(revision.id) ||
    !revision.id ||
    rows.SupersedesDecision!.some(([, old]) => old === revision.predecessorId) ||
    rows.RefersTo!.some(([m]) => m === mention.id)
  )
    throw new Error(
      "Revision needs a unique current held mention predecessor; cycles, forks and cross-candidate revisions are forbidden",
    );
  if (
    target?.[2] !== "bravais_lattice_type" ||
    revision.resolution.kind !== "entity" ||
    !revision.resolution.scope.trim() ||
    !revision.reason.trim() ||
    !revision.reviewer.trim() ||
    !/^\d{4}-\d{2}-\d{2}$/.test(revision.reviewedOn) ||
    !revision.reviewId ||
    ids("ProcessingRun").has(revision.reviewId) ||
    !revision.limitations.length ||
    !revision.evidenceSpanIds.includes(mention.spanId) ||
    new Set(revision.evidenceSpanIds).size !== revision.evidenceSpanIds.length ||
    revision.evidenceSpanIds.some((id) => !ids("SourceSpan").has(id)) ||
    !Array.isArray(definitions) ||
    !definitions.length ||
    definitions.some(
      (id: unknown) =>
        typeof id !== "string" ||
        !revision.evidenceSpanIds.includes(id) ||
        !rows.InDocument!.some(([s]) => s === id),
    )
  )
    throw new Error(
      "Lattice resolution requires a typed target, context, definition evidence and review scope",
    );
  const add = (table: string, ...r: Cell[]) => rows[table]!.push(r);
  const payload = {
    ...revision,
    candidateKind: "mention",
    outcome: "accepted",
    nextAction: null,
    method: "lattice_context_review",
  };
  add(
    "ProcessingRun",
    revision.reviewId,
    JSON.stringify({
      activity: "held_mention_reconsideration",
      ...revision,
      method: payload.method,
    }),
  );
  add(
    "CandidateDecision",
    revision.id,
    "mention",
    revision.candidateId,
    "accepted",
    revision.reason,
    JSON.stringify(payload),
  );
  add("SupersedesDecision", revision.id, revision.predecessorId);
  add("DecisionAboutMention", revision.id, revision.candidateId);
  add("DecisionByRun", revision.id, revision.reviewId);
  for (const span of revision.evidenceSpanIds) add("DecisionEvidence", revision.id, span);
  add("ResolvedEntity", revision.id, revision.resolution.entityId);
  add("RefersTo", revision.candidateId, revision.resolution.entityId);
}
