import type { Atlas, AtlasEdge, Ref } from "../types.ts";
import { CONCEPTS, ROLES } from "../data/packing.ts";
import { TABLES, type Cell } from "./schema.ts";
import catalogData from "../data/literature-catalog.json" with { type: "json" };
import { assetId, validateCatalog, type LiteratureCatalog } from "./catalog.ts";
import extractionData from "../data/okamoto-extraction.json" with { type: "json" };
import { appendExtraction, type ExtractionBatch } from "./extraction.ts";

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
  extractions: ExtractionBatch[] = [extractionData as ExtractionBatch],
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
  for (const batch of extractions) appendExtraction(rows, data, catalog, batch);
  return { rows };
}
