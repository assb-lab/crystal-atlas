import type { ExtractionBatch } from "./extraction.ts";
import type { Cell } from "./schema.ts";

export interface CandidateDecision {
  id: string;
  candidateKind: "mention" | "relation";
  candidateId: string;
  outcome: "accepted" | "held" | "rejected";
  reason: string;
  evidenceSpanIds: string[];
  nextAction: string | null;
  resolution:
    | { kind: "entity"; entityId: string; scope: string }
    | {
        kind: "assertion";
        label: string;
        description: string;
        target: string | null;
        scope: string;
        notes: string[];
      }
    | null;
}
export interface DecisionBatch {
  id: string;
  extractionId: string;
  assetHash: string;
  reviewer: string;
  reviewedOn: string;
  method: "document_context_review";
  scope: string;
  limitations: string[];
  decisions: CandidateDecision[];
}
export const adoptedAssertionId = (candidateId: string) => `adopted:${candidateId}`;

/** First-round decisions are appended to the immutable extraction, never inferred from test results. */
export function appendDecisions(
  rows: Record<string, Cell[][]>,
  extraction: ExtractionBatch,
  review: DecisionBatch,
): void {
  const add = (table: string, ...row: Cell[]) => rows[table]!.push(row);
  const ids = (table: string) => new Set(rows[table]!.map((r) => r[0]));
  if (
    review.extractionId !== extraction.id ||
    review.assetHash !== extraction.assetHash ||
    !ids("ProcessingRun").has(extraction.id) ||
    ids("ProcessingRun").has(review.id) ||
    !review.id ||
    !review.reviewer.trim() ||
    !review.scope.trim() ||
    !/^\d{4}-\d{2}-\d{2}$/.test(review.reviewedOn) ||
    review.method !== "document_context_review"
  )
    throw new Error("Invalid decision activity/source");
  const mentions = new Map(extraction.mentions.map((m) => [m.id, m]));
  const relations = new Map(extraction.relations.map((r) => [r.id, r]));
  const decisions = new Map(review.decisions.map((d) => [d.candidateId, d]));
  if (
    decisions.size !== review.decisions.length ||
    decisions.size !== mentions.size + relations.size ||
    new Set(review.decisions.map((d) => d.id)).size !== review.decisions.length
  )
    throw new Error("First decision batch must cover each candidate exactly once");
  const priorCandidates = new Set(rows.CandidateDecision!.map((r) => r[2]));
  const knownDecisions = ids("CandidateDecision");
  const entities = new Map(rows.Entity!.map((r) => [r[0], r]));
  for (const d of review.decisions) {
    const candidate =
      d.candidateKind === "mention"
        ? mentions.get(d.candidateId)
        : d.candidateKind === "relation"
          ? relations.get(d.candidateId)
          : null;
    const allowedSpans =
      d.candidateKind === "mention"
        ? [mentions.get(d.candidateId)?.spanId]
        : (relations.get(d.candidateId)?.evidenceSpanIds ?? []);
    if (
      !candidate ||
      !d.id ||
      knownDecisions.has(d.id) ||
      priorCandidates.has(d.candidateId) ||
      !d.reason.trim() ||
      !["accepted", "held", "rejected"].includes(d.outcome) ||
      !d.evidenceSpanIds.length ||
      new Set(d.evidenceSpanIds).size !== d.evidenceSpanIds.length ||
      d.evidenceSpanIds.some((id) => !allowedSpans.includes(id))
    )
      throw new Error("Invalid candidate decision/evidence");
    if (d.outcome !== "accepted") {
      if (d.resolution !== null || (d.outcome === "held" && !d.nextAction?.trim()))
        throw new Error(
          "Unaccepted decision cannot produce a resolution; held decisions need a next action",
        );
      continue;
    }
    if (!d.resolution?.scope.trim())
      throw new Error("Accepted decision needs an explicit resolution scope");
    if (d.candidateKind === "mention") {
      if (
        d.resolution.kind !== "entity" ||
        !mentions
          .get(d.candidateId)!
          .candidates.some(
            (c) => c.entityId === (d.resolution as { entityId?: string })?.entityId,
          ) ||
        !["structural_motif", "structure_type"].includes(
          String(entities.get(d.resolution.entityId)?.[2]),
        )
      )
        throw new Error("Accepted mention needs a reviewed motif/type candidate");
    } else {
      const relation = relations.get(d.candidateId)!;
      if (
        d.resolution.kind !== "assertion" ||
        !d.resolution.label.trim() ||
        !d.resolution.description.trim() ||
        (relation.domain === "derivation" && !d.resolution.target?.trim()) ||
        ids("Assertion").has(adoptedAssertionId(relation.id))
      )
        throw new Error("Invalid adopted assertion resolution");
      for (const endpoint of [relation.subjectMention, relation.objectMention]) {
        const endpointDecision = decisions.get(endpoint);
        if (
          endpointDecision?.outcome !== "accepted" ||
          endpointDecision.candidateKind !== "mention" ||
          endpointDecision.resolution?.kind !== "entity"
        )
          throw new Error("Adopted relation requires both mention endpoints accepted");
      }
    }
  }
  const activity = {
    activity: "candidate_context_review",
    extractionId: extraction.id,
    assetHash: review.assetHash,
    reviewer: review.reviewer,
    reviewedOn: review.reviewedOn,
    method: review.method,
    scope: review.scope,
    limitations: review.limitations,
  };
  add("ProcessingRun", review.id, JSON.stringify(activity));
  for (const d of review.decisions) {
    add(
      "CandidateDecision",
      d.id,
      d.candidateKind,
      d.candidateId,
      d.outcome,
      d.reason,
      JSON.stringify({
        ...d,
        reviewId: review.id,
        reviewer: review.reviewer,
        reviewedOn: review.reviewedOn,
        method: review.method,
        limitations: review.limitations,
      }),
    );
    add(
      d.candidateKind === "mention" ? "DecisionAboutMention" : "DecisionAboutRelation",
      d.id,
      d.candidateId,
    );
    add("DecisionByRun", d.id, review.id);
    for (const id of d.evidenceSpanIds) add("DecisionEvidence", d.id, id);
    if (d.outcome !== "accepted" || !d.resolution) continue;
    if (d.resolution.kind === "entity") {
      add("RefersTo", d.candidateId, d.resolution.entityId);
      add("ResolvedEntity", d.id, d.resolution.entityId);
      continue;
    }
    const r = relations.get(d.candidateId)!;
    const subject = decisions.get(r.subjectMention)!.resolution as { entityId: string };
    const object = decisions.get(r.objectMention)!.resolution as { entityId: string };
    const id = adoptedAssertionId(r.id);
    const payload = {
      sourceCandidateId: r.id,
      decisionId: d.id,
      reviewId: review.id,
      reviewer: review.reviewer,
      reviewedOn: review.reviewedOn,
      scope: d.resolution.scope,
      limitations: [...review.limitations, ...d.resolution.notes],
      undirected: r.domain === "comparison",
      parameters: r.parameters,
      symmetryNote: r.symmetryNote,
      basisMatrix: null,
      originShift: null,
      wyckoffMapping: null,
      symmetryVerification: "not_verified",
    };
    add(
      "Assertion",
      id,
      r.domain,
      r.operation,
      d.resolution.label,
      d.resolution.description,
      "source_checked_not_machine_verified",
      r.basis === "editorial_comparison" ? "editorial_comparison" : "literature_source_checked",
      JSON.stringify(payload),
    );
    add("Subject", id, subject.entityId);
    add("Object", id, object.entityId);
    for (const spanId of d.evidenceSpanIds) add("HasEvidence", id, spanId);
    add("AdoptedAssertion", d.id, id);
    if (r.domain === "derivation") {
      const stepId = `step:${id}`;
      add(
        "OperationStep",
        stepId,
        r.operation,
        d.resolution.target,
        JSON.stringify(r.parameters),
        JSON.stringify({
          detailState: "source_context_checked",
          decisionId: d.id,
          notes: d.resolution.notes,
        }),
      );
      add("HasStep", id, stepId, 0);
    }
  }
}
