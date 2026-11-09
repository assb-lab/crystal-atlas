import type { Atlas, AtlasEdge, Ref } from "../types.ts";
import { CONCEPTS, ROLES } from "../data/packing.ts";
import { TABLES, type Cell } from "./schema.ts";
import catalogData from "../data/literature-catalog.json" with { type: "json" };
import { assetId, validateCatalog, type LiteratureCatalog } from "./catalog.ts";
import { additionalExtractions } from "../data/additional-extractions.ts";
import extractionData from "../data/okamoto-extraction.json" with { type: "json" };
import { appendExtraction, type ExtractionBatch } from "./extraction.ts";
import decisionData from "../data/okamoto-decisions.json" with { type: "json" };
import { appendDecisions, type DecisionBatch } from "./decisions.ts";

import {
  latticeEntity,
  latticeReferences,
  latticeDescription,
  latticeReconsideration,
} from "../data/lattice-interpretation.ts";
import { appendHeldMentionResolution, type HeldMentionResolution } from "./reconsideration.ts";

import { fluoriteRoleReference, occupationReconsiderations } from "../data/okamoto-occupation.ts";
import { appendHeldVoidResolution, type HeldVoidResolution } from "./occupation.ts";

import { identityRegistry } from "../data/identity.ts";
import { appendIdentity, appendModelContexts } from "./identity.ts";

import { labelReconsiderations } from "../data/derivation.ts";
import {
  appendHeldLabelResolution,
  appendRecipe,
  appendOperationVocabulary,
  type HeldLabelResolution,
} from "./derivation.ts";

/** Explicit annotations of existing statements, not operations inferred from space-group names. */
const OPERATIONS: Record<string, { operation: string; target: string; parameters: object }> = {
  e1: {
    operation: "occupation",
    target: "octahedral_voids_of_anion_ccp",
    parameters: { fraction: 1 },
  },
  e6: { operation: "ordering", target: "fcc_4a_orbit", parameters: { ratio: [3, 1] } },
  e24: { operation: "ordering", target: "bcc_corner_and_body_center", parameters: {} },
  e56: { operation: "distortion", target: "octahedral_rotation", parameters: {} },
};
const DERIVATION_KINDS = new Set(["occupation", "ordering", "distortion", "stacking", "antitype"]);
export interface KnowledgeDataset {
  rows: Record<string, Cell[][]>;
}
const json = (value: unknown) => JSON.stringify(value);

/** Lossless, deterministic projection of the curated subset. No extraction coverage is invented. */
export function knowledgeDataset(
  data: Atlas,
  catalog: LiteratureCatalog = catalogData as LiteratureCatalog,
  extractions: ExtractionBatch[] = [extractionData as ExtractionBatch, ...additionalExtractions],
  reviews: DecisionBatch[] = extractions.some((e) => e.id === decisionData.extractionId)
    ? [decisionData as DecisionBatch]
    : [],
  reconsiderations: HeldMentionResolution[] = reviews.some((r) =>
    r.decisions.some((d) => d.id === latticeReconsideration.predecessorId),
  )
    ? [latticeReconsideration]
    : [],
  voidReconsiderations: HeldVoidResolution[] = reconsiderations.some(
    (r) => r.id === latticeReconsideration.id,
  )
    ? occupationReconsiderations
    : [],
  labelReviews: HeldLabelResolution[] = voidReconsiderations.length ? labelReconsiderations : [],
): KnowledgeDataset {
  validateCatalog(catalog, new Set(Object.keys(data.sources)));
  const rows: Record<string, Cell[][]> = Object.fromEntries(TABLES.map((t) => [t.name, []]));
  const add = (table: string, ...row: Cell[]) => rows[table]!.push(row);
  const spanIds = new Set<string>();
  const entityIds = new Set<string>();
  const entity = (id: string, title: string, kind: string, payload: unknown) => {
    if (entityIds.has(id)) throw new Error(`Duplicate knowledge entity ${id}`);
    entityIds.add(id);
    add("Entity", id, title, kind, json(payload));
  };
  function span(ref: Ref): string {
    if (!data.sources[ref.s]) throw new Error(`Unknown source ${ref.s}`);
    const id = `span:${json([ref.s, ref.p ?? null, ref.pdfPage ?? null, ref.sec, ref.url ?? null])}`;
    if (!spanIds.has(id)) {
      spanIds.add(id);
      add("SourceSpan", id, json(ref));
      add("InDocument", id, ref.s);
    }
    return id;
  }
  const evidence = (id: string, refs: Ref[]) => {
    const seen = new Set<string>();
    for (const ref of refs) {
      const sourceSpan = span(ref);
      if (!seen.has(sourceSpan)) add("HasEvidence", id, sourceSpan);
      seen.add(sourceSpan);
    }
  };
  function assertion(
    id: string,
    domain: string,
    operation: string,
    label: string,
    description: string,
    from: string,
    to: string,
    payload: object,
    refs: Ref[],
    basis = "legacy_curated",
  ) {
    if (!entityIds.has(from) || !entityIds.has(to))
      throw new Error(`Unknown assertion endpoint ${id}`);
    add(
      "Assertion",
      id,
      domain,
      operation,
      label,
      description,
      "imported_not_revalidated",
      basis,
      json(payload),
    );
    add("Subject", id, from);
    add("Object", id, to);
    evidence(id, refs);
  }
  for (const [id, source] of Object.entries(data.sources))
    add("Document", id, source.title, json(source));
  for (const n of data.nodes) {
    // Legacy cards can represent both a prototype and a phase: do not guess a formal identity.
    entity(
      n.id,
      n.name,
      ROLES[n.id] === "packing"
        ? "structural_motif"
        : ROLES[n.id] === "material"
          ? "legacy_material_or_phase"
          : "structure_type",
      n,
    );
    n.refs.forEach(span);
  }
  for (const concept of CONCEPTS) entity(concept.id, concept.title, "editorial_concept", concept);
  for (const [id, family] of Object.entries(data.families))
    entity(`family:${id}`, family.name, "editorial_family", { ...family, scheme: "legacy-atlas" });
  for (const collection of data.collections)
    entity(`collection:${collection.id}`, collection.title, "classification", collection);

  for (const n of data.nodes) {
    // Card references do not prove membership in the UI's historical family.
    assertion(
      `family:${n.id}`,
      "family",
      "member_of",
      "編集上のファミリー",
      "既存アトラスの分類。文献の分類体系としては再照合が必要です。",
      n.id,
      `family:${n.family}`,
      {},
      [],
      "editorial",
    );
  }
  for (const c of data.collections) {
    for (const id of c.ids)
      assertion(
        `collection:${c.id}:${id}`,
        "family",
        "member_of",
        c.title,
        c.desc,
        id,
        `collection:${c.id}`,
        {},
        c.refs,
      );
    if (c.parent)
      assertion(
        `inclusion:${c.id}`,
        "family",
        "included_in",
        "分類の包含",
        c.desc,
        `collection:${c.id}`,
        `collection:${c.parent}`,
        {},
        c.refs,
      );
  }

  function derive(edge: AtlasEdge, id: string) {
    const annotation = OPERATIONS[edge.id];
    const operation = annotation?.operation ?? edge.kind;
    assertion(id, "derivation", operation, edge.label, edge.desc, edge.a, edge.b, edge, edge.refs);
    add(
      "OperationStep",
      `step:${edge.id}`,
      operation,
      annotation?.target ?? null,
      json(annotation?.parameters ?? {}),
      json({ detailState: annotation ? "annotated" : "not_transcribed", sourceRelation: edge.id }),
    );
    add("HasStep", id, `step:${edge.id}`, 0);
  }
  for (const edge of data.edges) {
    const id = `relation:${edge.id}`;
    if (edge.kind === "symmetry" || edge.strict) {
      assertion(
        id,
        "symmetry",
        "group_subgroup",
        edge.label,
        edge.desc,
        edge.a,
        edge.b,
        {
          ...edge,
          verification: edge.strict ? "literature_confirmed" : "unverified",
          mappingState: "not_machine_verified",
          basisMatrix: null,
          originShift: null,
          wyckoffMapping: null,
        },
        edge.refs,
      );
      if (OPERATIONS[edge.id] || DERIVATION_KINDS.has(edge.kind)) {
        derive(edge, `derivation:${edge.id}`);
        add("ExplainsSymmetryOf", id, `derivation:${edge.id}`);
      }
    } else if (DERIVATION_KINDS.has(edge.kind) && !edge.undirected) derive(edge, id);
    else
      assertion(
        id,
        "comparison",
        edge.kind,
        edge.label,
        edge.desc,
        edge.a,
        edge.b,
        edge,
        edge.refs,
      );
  }
  for (const [id, model] of Object.entries(data.models)) {
    if (!entityIds.has(id)) throw new Error(`Orphan coordinate model ${id}`);
    add("StructureModel", `model:${id}`, json(model));
    add("Models", `model:${id}`, id);
  }
  for (const route of data.flows) {
    add("DerivationRoute", route.id, route.title, json(route));
    route.edges.forEach((id, ordinal) => add("RouteMember", route.id, `relation:${id}`, ordinal));
  }
  // This activity only inventories assets and creates pending ledger ranges.
  // It is never a PDF extraction or a scientific review run.
  const runId = "inventory:catalog-v1";
  add(
    "ProcessingRun",
    runId,
    json({ activity: "asset_inventory", probe: catalog.probe, catalogVersion: catalog.version }),
  );
  for (const asset of catalog.assets) {
    const id = assetId(asset.sha256);
    add("Asset", id, asset.sha256, json(asset));
    add("CataloguedBy", id, runId);
    for (const documentId of asset.mapping.documentIds)
      add(asset.mapping.state === "confirmed" ? "HasAsset" : "CandidateAsset", documentId, id);
    asset.coverage.forEach((range, ordinal) => {
      const reviewId = `coverage:${asset.sha256}:${ordinal}`;
      const status = Object.values(range.channels).every((s) => s === "not_started")
        ? "not_started"
        : "recorded";
      add(
        "CoverageReview",
        reviewId,
        status,
        json({
          ...range,
          coordinateSystem: "pdf_page_1_based",
          ledgerOnly: status === "not_started",
        }),
      );
      add("Reviews", reviewId, id);
    });
  }
  appendModelContexts(rows, data, identityRegistry);
  appendIdentity(rows, data, identityRegistry);
  for (const batch of extractions) appendExtraction(rows, data, catalog, batch);
  for (const review of reviews) {
    const extraction = extractions.find((e) => e.id === review.extractionId);
    if (!extraction) throw new Error("Review references an unknown extraction");
    appendDecisions(rows, extraction, review);
  }
  if (reconsiderations.length) {
    entity(latticeEntity.id, latticeEntity.title, latticeEntity.kind, latticeEntity);
    for (const { id, reference } of latticeReferences) {
      if (!data.sources[reference.s]) throw new Error(`Unknown definition source ${reference.s}`);
      add("SourceSpan", id, json(reference));
      add("InDocument", id, reference.s);
    }
    add(
      "Assertion",
      latticeDescription.id,
      "description",
      "has_bravais_lattice_type",
      latticeDescription.label,
      latticeDescription.description,
      "source_context_checked",
      "literature_context_interpretation",
      json({ ...latticeDescription, reviewer: "Codex", reviewedOn: "2026-11-09" }),
    );
    add("Subject", latticeDescription.id, "fcc");
    add("Object", latticeDescription.id, latticeEntity.id);
    for (const id of ["pilot:K:2-3:span:fcc-lattice", ...latticeReferences.map((r) => r.id)])
      add("HasEvidence", latticeDescription.id, id);
    for (const revision of reconsiderations) {
      const extraction = extractions.find((e) => e.id === revision.extractionId);
      if (!extraction) throw new Error("Revision references an unknown extraction");
      appendHeldMentionResolution(rows, extraction, revision);
    }
  }
  if (voidReconsiderations.length) {
    const { id, reference } = fluoriteRoleReference;
    if (!data.sources[reference.s]) throw new Error(`Unknown role source ${reference.s}`);
    add("SourceSpan", id, json(reference));
    add("InDocument", id, reference.s);
    for (const revision of voidReconsiderations) {
      const extraction = extractions.find((e) => e.id === revision.extractionId);
      if (!extraction) throw new Error("Revision references an unknown extraction");
      appendHeldVoidResolution(rows, extraction, revision);
    }
  }
  for (const revision of labelReviews) {
    const extraction = extractions.find((e) => e.id === revision.extractionId);
    if (!extraction) throw new Error("Revision references an unknown extraction");
    appendHeldLabelResolution(rows, extraction, revision);
  }
  if (labelReviews.length)
    appendRecipe(rows, "recipe:fcc-nacl-sc", "fcc → 岩塩型 → 単純立方（編集上の構築レシピ）", [
      "adopted:pilot:K:2-3:relation:fcc-nacl",
      "adopted:pilot:K:2-3:relation:nacl-sc",
    ]);
  appendOperationVocabulary(rows);
  return { rows };
}
