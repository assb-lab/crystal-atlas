import type { CandidateDecision } from "./decisions.ts";
import { adoptedAssertionId } from "./decisions.ts";
import type { ExtractionBatch } from "./extraction.ts";
import { validateHeldRevision, type HeldRevision } from "./reconsideration.ts";
import type { Cell } from "./schema.ts";

/** A source-scoped ideal construction, not a set of refined atom positions. */
export interface OccupationSpec {
  id: string;
  hostMotifId: string;
  hostSpecies: string;
  guestSpecies: string;
  voidKind: "octahedral" | "tetrahedral";
  selection: "all" | "one_of_two" | "both";
  roleBasis: "source_figure_interpretation" | "prototype_cross_check";
  roleEvidenceSpanIds: string[];
  roleNote: string;
  condition: string;
  cellScope: string;
}
export interface HeldVoidResolution extends HeldRevision {
  resolution: Extract<NonNullable<CandidateDecision["resolution"]>, { kind: "assertion" }>;
  occupation: OccupationSpec;
}
function acceptedEndpoint(rows: Record<string, Cell[][]>, mentionId: string): string {
  const superseded = new Set(rows.SupersedesDecision!.map(([, id]) => id));
  const current = rows.CandidateDecision!.filter(
    (r) => r[1] === "mention" && r[2] === mentionId && !superseded.has(r[0]),
  );
  const resolved = rows.ResolvedEntity!.filter(([d]) => d === current[0]?.[0]);
  if (current.length !== 1 || current[0]?.[3] !== "accepted" || resolved.length !== 1)
    throw new Error("Void adoption requires both endpoints currently accepted");
  return String(resolved[0]![1]);
}
export function appendHeldVoidResolution(
  rows: Record<string, Cell[][]>,
  extraction: ExtractionBatch,
  revision: HeldVoidResolution,
): void {
  validateHeldRevision(rows, extraction, revision, "relation");
  const r = extraction.relations.find((r) => r.id === revision.candidateId)!;
  const spec = revision.occupation;
  const id = adoptedAssertionId(r.id);
  const stepId = `step:${id}`;
  const subject = acceptedEndpoint(rows, r.subjectMention);
  const object = acceptedEndpoint(rows, r.objectMention);
  const host = rows.Entity!.find(([id]) => id === spec.hostMotifId);
  const expectedSelection = r.parameters.occupation ?? r.parameters.occupiedOrientationClasses;
  if (
    r.domain !== "derivation" ||
    r.operation !== "void_occupation" ||
    r.basis !== "source_paraphrase" ||
    host?.[2] !== "structural_motif" ||
    subject !== spec.hostMotifId ||
    !rows.Entity!.some(([id, , kind]) => id === object && kind === "structure_type") ||
    !["octahedral", "tetrahedral"].includes(spec.voidKind) ||
    r.parameters.voidKind !== spec.voidKind ||
    !["all", "one_of_two", "both"].includes(spec.selection) ||
    expectedSelection !== spec.selection ||
    (spec.voidKind === "octahedral" && spec.selection !== "all") ||
    (spec.voidKind === "tetrahedral" && spec.selection === "all") ||
    !spec.id ||
    rows.OccupationSpec!.some(([id]) => id === spec.id) ||
    rows.Assertion!.some(([known]) => known === id) ||
    rows.OperationStep!.some(([known]) => known === stepId) ||
    !/^[A-Z][a-z]?$/.test(spec.hostSpecies) ||
    !/^[A-Z][a-z]?$/.test(spec.guestSpecies) ||
    spec.hostSpecies === spec.guestSpecies ||
    !["source_figure_interpretation", "prototype_cross_check"].includes(spec.roleBasis) ||
    !spec.roleNote.trim() ||
    !spec.cellScope.trim() ||
    !spec.condition.trim() ||
    !spec.roleEvidenceSpanIds.length ||
    new Set(spec.roleEvidenceSpanIds).size !== spec.roleEvidenceSpanIds.length ||
    spec.roleEvidenceSpanIds.some((span) => !revision.evidenceSpanIds.includes(span)) ||
    r.evidenceSpanIds.some((span) => !revision.evidenceSpanIds.includes(span)) ||
    (spec.roleBasis === "source_figure_interpretation" &&
      spec.roleEvidenceSpanIds.some((span) => !extraction.spans.some((s) => s.id === span))) ||
    (spec.roleBasis === "prototype_cross_check" &&
      !spec.roleEvidenceSpanIds.some((span) =>
        rows.InDocument!.some(([s, doc]) => s === span && doc === "AF_FLUORITE"),
      )) ||
    revision.resolution.kind !== "assertion" ||
    revision.resolution.target !== spec.id ||
    !revision.resolution.label.trim() ||
    !revision.resolution.description.trim() ||
    !revision.resolution.scope.trim()
  )
    throw new Error(
      "Invalid void operation: target, selection, role provenance and source scope must match the candidate",
    );
  const add = (table: string, ...r: Cell[]) => rows[table]!.push(r);
  const method = "void_occupation_context_review";
  const decision = {
    ...revision,
    candidateKind: "relation",
    outcome: "accepted",
    nextAction: null,
    method,
  };
  add(
    "ProcessingRun",
    revision.reviewId,
    JSON.stringify({
      activity: "held_void_relation_reconsideration",
      extractionId: extraction.id,
      assetHash: revision.assetHash,
      reviewer: revision.reviewer,
      reviewedOn: revision.reviewedOn,
      scope: revision.resolution.scope,
      limitations: revision.limitations,
      method,
    }),
  );
  add(
    "CandidateDecision",
    revision.id,
    "relation",
    r.id,
    "accepted",
    revision.reason,
    JSON.stringify(decision),
  );
  add("DecisionAboutRelation", revision.id, r.id);
  add("DecisionByRun", revision.id, revision.reviewId);
  add("SupersedesDecision", revision.id, revision.predecessorId);
  for (const span of revision.evidenceSpanIds) add("DecisionEvidence", revision.id, span);
  add(
    "Assertion",
    id,
    "derivation",
    "void_occupation",
    revision.resolution.label,
    revision.resolution.description,
    "source_checked_not_machine_verified",
    "literature_source_checked",
    JSON.stringify({
      sourceCandidateId: r.id,
      decisionId: revision.id,
      reviewId: revision.reviewId,
      reviewer: revision.reviewer,
      reviewedOn: revision.reviewedOn,
      scope: revision.resolution.scope,
      limitations: [...revision.limitations, ...revision.resolution.notes],
      parameters: r.parameters,
      undirected: false,
      adoptionRound: "held_relation_resolution",
      symmetryNote: null,
      basisMatrix: null,
      originShift: null,
      wyckoffMapping: null,
      symmetryVerification: "not_verified",
    }),
  );
  add("Subject", id, subject);
  add("Object", id, object);
  add("AdoptedAssertion", revision.id, id);
  for (const span of revision.evidenceSpanIds) add("HasEvidence", id, span);
  add(
    "OperationStep",
    stepId,
    "void_occupation",
    spec.id,
    JSON.stringify(r.parameters),
    JSON.stringify({
      detailState: "source_context_checked",
      decisionId: revision.id,
      adoptionRound: "held_relation_resolution",
      notes: revision.resolution.notes,
    }),
  );
  add("HasStep", id, stepId, 0);
  add(
    "OccupationSpec",
    spec.id,
    spec.hostSpecies,
    spec.guestSpecies,
    spec.voidKind,
    spec.selection,
    JSON.stringify(spec),
  );
  add("HasOccupationSpec", stepId, spec.id);
  add("HostMotif", spec.id, spec.hostMotifId);
}
