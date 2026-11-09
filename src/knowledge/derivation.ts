import type { CandidateDecision } from "./decisions.ts";
import { adoptedAssertionId } from "./decisions.ts";
import type { ExtractionBatch } from "./extraction.ts";
import {
  validateHeldRevision,
  resolvedCurrentMention,
  type HeldRevision,
} from "./reconsideration.ts";
import type { Cell } from "./schema.ts";
import { operationVocabulary } from "../data/derivation.ts";
export interface LabelMapSpec {
  id: string;
  inputLabels: string[];
  outputLabel: "X";
  geometryPolicy: "retain_ideal_position_set";
  cellPolicy: "minimal_cell_not_verified";
  scope: string;
}
export interface HeldLabelResolution extends HeldRevision {
  resolution: Extract<NonNullable<CandidateDecision["resolution"]>, { kind: "assertion" }>;
  labelMap: LabelMapSpec;
}
export function appendHeldLabelResolution(
  rows: Record<string, Cell[][]>,
  extraction: ExtractionBatch,
  revision: HeldLabelResolution,
): void {
  validateHeldRevision(rows, extraction, revision, "relation");
  const r = extraction.relations.find((r) => r.id === revision.candidateId)!;
  const subject = resolvedCurrentMention(rows, r.subjectMention);
  const object = resolvedCurrentMention(rows, r.objectMention);
  const id = adoptedAssertionId(r.id);
  const stepId = `step:${id}`;
  const spec = revision.labelMap;
  if (
    r.domain !== "derivation" ||
    r.operation !== "species_identification" ||
    r.parameters.species !== "same" ||
    !spec.id ||
    rows.LabelMapSpec!.some(([id]) => id === spec.id) ||
    rows.Assertion!.some(([a]) => a === id) ||
    spec.inputLabels.length !== 2 ||
    new Set(spec.inputLabels).size !== 2 ||
    spec.inputLabels.some((l) => !l.trim()) ||
    spec.outputLabel !== "X" ||
    spec.geometryPolicy !== "retain_ideal_position_set" ||
    spec.cellPolicy !== "minimal_cell_not_verified" ||
    !spec.scope.trim() ||
    revision.evidenceSpanIds.some((s) => !r.evidenceSpanIds.includes(s)) ||
    revision.resolution.kind !== "assertion" ||
    revision.resolution.target !== spec.id ||
    !revision.resolution.label.trim() ||
    !revision.resolution.scope.trim()
  )
    throw new Error(
      "Label identification needs source-scoped symbolic labels and explicit geometry/cell limits",
    );
  const add = (table: string, ...row: Cell[]) => rows[table]!.push(row);
  const method = "symbolic_label_context_review";
  const payload = {
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
      activity: method,
      extractionId: extraction.id,
      reviewer: revision.reviewer,
      reviewedOn: revision.reviewedOn,
      scope: revision.resolution.scope,
      assetHash: revision.assetHash,
    }),
  );
  add(
    "CandidateDecision",
    revision.id,
    "relation",
    r.id,
    "accepted",
    revision.reason,
    JSON.stringify(payload),
  );
  add("DecisionAboutRelation", revision.id, r.id);
  add("DecisionByRun", revision.id, revision.reviewId);
  add("SupersedesDecision", revision.id, revision.predecessorId);
  for (const span of revision.evidenceSpanIds) add("DecisionEvidence", revision.id, span);
  add(
    "Assertion",
    id,
    "derivation",
    "species_identification",
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
      adoptionRound: "held_label_resolution",
      parameters: r.parameters,
      symmetryNote: r.symmetryNote,
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
    "species_identification",
    spec.id,
    JSON.stringify({ inputLabels: spec.inputLabels, outputLabel: spec.outputLabel }),
    JSON.stringify({
      detailState: "source_context_checked",
      adoptionRound: "held_label_resolution",
      decisionId: revision.id,
    }),
  );
  add("HasStep", id, stepId, 0);
  add("LabelMapSpec", spec.id, JSON.stringify(spec));
  add("HasLabelMap", stepId, spec.id);
}
/** An explicitly editorial composition of individually sourced explanations. */
export function appendRecipe(
  rows: Record<string, Cell[][]>,
  id: string,
  title: string,
  members: string[],
): void {
  const assertions = members.map((id) => rows.Assertion!.find((a) => a[0] === id));
  const subjects = members.map((id) => rows.Subject!.find(([a]) => a === id)?.[1]);
  const objects = members.map((id) => rows.Object!.find(([a]) => a === id)?.[1]);
  if (
    !members.length ||
    new Set(members).size !== members.length ||
    assertions.some(
      (a) => !a || a[1] !== "derivation" || a[5] !== "source_checked_not_machine_verified",
    ) ||
    subjects.some((s) => !s) ||
    objects.some((o) => !o) ||
    subjects.slice(1).some((s, i) => s !== objects[i]) ||
    rows.Assertion!.some(([a]) => a === id)
  )
    throw new Error("Recipe requires a connected, ordered sequence of sourced derivations");
  const sourceSteps = members.map((member) => {
    const links = rows.HasStep!.filter(([a]) => a === member);
    if (links.length !== 1)
      throw new Error("Recipe components require exactly one explicit operation step");
    const step = rows.OperationStep!.find(([s]) => s === links[0]![1]);
    if (!step) throw new Error("Recipe component has no operation step");
    return step;
  });
  const add = (table: string, ...r: Cell[]) => rows[table]!.push(r);
  const scope =
    "個々の説明を接続した編集上の構築レシピ。文献全体がこの手順を一連の過程として提示したとは主張しない。セル対応・実行可能性・合成・相転移は未検証。";
  add(
    "Assertion",
    id,
    "derivation",
    "composite_recipe",
    title,
    scope,
    "editorial_composition_not_verified",
    "editorial_composition",
    JSON.stringify({ scope, limitations: [scope], members, undirected: false }),
  );
  add("Subject", id, subjects[0]!);
  add("Object", id, objects.at(-1)!);
  const routeId = `route:${id}`;
  add(
    "DerivationRoute",
    routeId,
    title,
    JSON.stringify({ title, desc: scope, basis: "editorial_composition", refs: [] }),
  );
  add("RecipeForRoute", id, routeId);
  members.forEach((member, ordinal) => {
    add("RouteMember", routeId, member, ordinal);
    const step = sourceSteps[ordinal]!;
    const stepId = `step:${id}:${ordinal}`;
    add(
      "OperationStep",
      stepId,
      step[1]!,
      step[2]!,
      step[3]!,
      JSON.stringify({ detailState: "editorial_composition", sourceAssertionId: member, scope }),
    );
    add("HasStep", id, stepId, ordinal);
    add("ComposesAssertion", stepId, member);
    for (const table of ["HasLabelMap", "HasOccupationSpec"]) {
      for (const [source, target] of rows[table]!.filter(([s]) => s === step[0])) {
        if (source) add(table, stepId, target!);
      }
    }
  });
  const spans = [
    ...new Set(
      members.flatMap((m) => rows.HasEvidence!.filter(([a]) => a === m).map(([, s]) => s)),
    ),
  ];
  for (const span of spans) add("HasEvidence", id, span!);
}
export function appendOperationVocabulary(rows: Record<string, Cell[][]>): void {
  for (const op of operationVocabulary) {
    rows.OperationDefinition!.push([
      `operation:${op.id}`,
      op.title,
      JSON.stringify({
        ...op,
        basis: "editorial_vocabulary",
        limitations: [
          "語彙を整理する編集上の定義。参照例を新たな採用・検証済み操作へ昇格させない。",
        ],
      }),
    ]);
    for (const example of op.examples)
      if (rows.Assertion!.some(([id]) => id === example))
        rows.VocabularyExample!.push([example, `operation:${op.id}`]);
  }
}
