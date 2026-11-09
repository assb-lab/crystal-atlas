import type { Atlas, Ref } from "../types.ts";
import type { Cell } from "./schema.ts";

export interface IdentityEntity {
  id: string;
  title: string;
  kind: "chemical_substance" | "material_phase" | "structural_prototype";
  description: string;
  formula?: string;
  substanceId?: string;
  conditions?: {
    temperatureK: number | null;
    pressurePa: number | null;
    composition: string;
    sample: string | null;
    state: "not_transcribed" | "reported";
  };
  prototypeLabel?: string;
}
export interface IdentityRegistry {
  id: string;
  reviewer: string;
  reviewedOn: string;
  entities: IdentityEntity[];
  claims: {
    id: string;
    subjectId: string;
    objectId: string;
    operation: "phase_of" | "has_structure_type" | "prototype_of_type";
    label: string;
    scope: string;
    references: Ref[];
  }[];
  illustrations: { modelId: string; prototypeId: string; note: string }[];
}
/** Identity is explicit; formula/name similarity never creates a merge. */
export function appendIdentity(
  rows: Record<string, Cell[][]>,
  data: Atlas,
  registry: IdentityRegistry,
): void {
  if (!registry.id || !registry.reviewer.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(registry.reviewedOn))
    throw new Error("Identity registry requires review metadata");
  const kinds = new Map(rows.Entity!.map(([id, , kind]) => [String(id), String(kind)]));
  for (const e of registry.entities) {
    if (!e.id || !e.title || !e.description || kinds.has(e.id))
      throw new Error("Invalid/duplicate identity entity");
    if (!["chemical_substance", "material_phase", "structural_prototype"].includes(e.kind))
      throw new Error("Unknown identity kind");
    kinds.set(e.id, e.kind);
  }
  for (const e of registry.entities) {
    if (e.kind === "chemical_substance" && !e.formula)
      throw new Error("Substance requires composition definition");
    if (e.kind === "structural_prototype" && !e.prototypeLabel)
      throw new Error("Prototype requires explicit reference identity");
    if (
      e.kind === "material_phase" &&
      (!e.conditions ||
        kinds.get(e.substanceId ?? "") !== "chemical_substance" ||
        !registry.claims.some(
          (c) => c.subjectId === e.id && c.objectId === e.substanceId && c.operation === "phase_of",
        ))
    )
      throw new Error("Phase needs a substance, explicit condition state and source claim");
    if (
      e.conditions &&
      ((e.conditions.temperatureK !== null &&
        (!Number.isFinite(e.conditions.temperatureK) || e.conditions.temperatureK < 0)) ||
        (e.conditions.pressurePa !== null &&
          (!Number.isFinite(e.conditions.pressurePa) || e.conditions.pressurePa < 0)) ||
        !["reported", "not_transcribed"].includes(e.conditions.state))
    )
      throw new Error("Invalid phase conditions");
  }
  const ids = new Set(rows.Assertion!.map(([id]) => id));
  for (const c of registry.claims) {
    const allowed = {
      phase_of: ["material_phase", "chemical_substance"],
      has_structure_type: ["material_phase", "structure_type"],
      prototype_of_type: ["structural_prototype", "structure_type"],
    }[c.operation];
    if (
      !allowed ||
      kinds.get(c.subjectId) !== allowed[0] ||
      kinds.get(c.objectId) !== allowed[1] ||
      !c.id ||
      ids.has(c.id) ||
      !c.label ||
      !c.scope ||
      !c.references.length ||
      c.references.some((r) => !data.sources[r.s] || !r.sec)
    )
      throw new Error("Identity claim requires typed endpoints and source evidence");
    ids.add(c.id);
  }
  for (const i of registry.illustrations)
    if (
      !rows.StructureModel!.some(([id]) => id === i.modelId) ||
      kinds.get(i.prototypeId) !== "structural_prototype" ||
      !i.note
    )
      throw new Error("Invalid prototype illustration");
  const add = (table: string, ...row: Cell[]) => rows[table]!.push(row);
  for (const e of registry.entities) add("Entity", e.id, e.title, e.kind, JSON.stringify(e));
  for (const c of registry.claims) {
    add(
      "Assertion",
      c.id,
      "description",
      c.operation,
      c.label,
      c.scope,
      "source_context_checked",
      "literature_context_interpretation",
      JSON.stringify({
        scope: c.scope,
        reviewer: registry.reviewer,
        reviewedOn: registry.reviewedOn,
        limitations: [
          "記載する多形・プロトタイプの識別。測定条件・安定性・座標の数値検証は未実施。",
        ],
      }),
    );
    add("Subject", c.id, c.subjectId);
    add("Object", c.id, c.objectId);
    c.references.forEach((ref, i) => {
      const id = `span:${c.id}:${i}`;
      add("SourceSpan", id, JSON.stringify(ref));
      add("InDocument", id, ref.s);
      add("HasEvidence", c.id, id);
    });
  }
  for (const illustration of registry.illustrations)
    add("IllustratesPrototype", illustration.modelId, illustration.prototypeId, illustration.note);
}

/** Preserve source records, including unknown settings/conditions; do not reclassify them as refinements. */
export function appendModelContexts(
  rows: Record<string, Cell[][]>,
  data: Atlas,
  registry: IdentityRegistry,
): void {
  for (const [id, model] of Object.entries(data.models)) {
    const context = {
      source: model.source,
      modelKind: model.kind,
      verification: "legacy_not_revalidated",
      cell: {
        parameters: model.parameters,
        spaceGroupNumber: model.spaceGroup,
        coordinates: "fractional",
        lengthUnit: model.kind === "schematic" ? "relative" : "angstrom",
        angleUnit: "degree",
        setting: null,
        origin: null,
        settingState: "not_transcribed",
      },
      conditions: { temperatureK: null, pressurePa: null, state: "not_transcribed" },
      refinementState: "not_established",
      relaxationState: "not_transcribed",
      occupancy: model.groups.map((g) => ({
        wyckoff: g.wyckoff,
        occupants: g.occupants,
        positions: g.positions.length,
      })),
      note: model.note ?? null,
      sourceWarnings: registry.illustrations
        .filter((i) => i.modelId === `model:${id}`)
        .map((i) => i.note),
    };
    const contextId = `context:model:${id}`;
    rows.ModelContext!.push([contextId, model.kind, JSON.stringify(context)]);
    rows.ContextFor!.push([contextId, `model:${id}`]);
  }
}
