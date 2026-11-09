import type { Cell } from "./schema.ts";
export type Point = [number, number, number];
type Op = { r: number[][]; t: Point };
const mod = (x: number) => ((x % 4) + 4) % 4;
const pointKey = (p: number[]) => p.join(",");
const opKey = (o: Op) => `${o.r.flat().join(",")};${pointKey(o.t)}`;
const identity = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];
const apply = (o: Op, p: Point): Point =>
  o.r.map((row, i) => mod(row.reduce((sum, x, j) => sum + x * p[j]!, o.t[i]!))) as Point;
function compose(a: Op, b: Op): Op {
  return {
    r: a.r.map((row) => [0, 1, 2].map((j) => row.reduce((s, x, k) => s + x * b.r[k]![j]!, 0))),
    t: apply(a, b.t),
  };
}
export interface IdealSymmetryInput {
  points: Point[];
  labels: string[];
  basis: number[][];
  origin: Point;
  index: number;
  subgroupKind: "t" | "k" | "i" | "unknown";
  split: number[];
}
/** Exact cubic signed-permutation isometries, modulo integer translations of the declared cell.
 * This validates one declared ideal point set, not arbitrary space-group settings or measurements.
 */
export function verifyIdealCubicSplit(input: IdealSymmetryInput) {
  if (JSON.stringify(input.basis) !== JSON.stringify(identity) || input.origin.some((x) => x !== 0))
    throw new Error("Validator requires the declared common cubic cell and zero origin shift");
  if (
    input.points.length !== 8 ||
    input.labels.length !== 8 ||
    input.points.some(
      (p) => p.length !== 3 || p.some((x) => !Number.isInteger(x) || x < 0 || x >= 4),
    ) ||
    new Set(input.points.map(pointKey)).size !== 8
  )
    throw new Error("Invalid quarter-coordinate model");
  const lookup = new Map(input.points.map((p, i) => [pointKey(p), i]));
  const rotations: number[][][] = [];
  for (const p of [
    [0, 1, 2],
    [0, 2, 1],
    [1, 0, 2],
    [1, 2, 0],
    [2, 0, 1],
    [2, 1, 0],
  ])
    for (const a of [-1, 1])
      for (const b of [-1, 1])
        for (const c of [-1, 1])
          rotations.push(p.map((j, i) => [0, 1, 2].map((k) => (j === k ? [a, b, c][i]! : 0))));
  const parent: Op[] = [];
  const subgroup: Op[] = [];
  for (const r of rotations)
    for (let x = 0; x < 4; x++)
      for (let y = 0; y < 4; y++)
        for (let z = 0; z < 4; z++) {
          const o: Op = { r, t: [x, y, z] };
          const targets = input.points.map((p) => lookup.get(pointKey(apply(o, p))));
          if (targets.some((i) => i === undefined)) continue;
          parent.push(o);
          if (targets.every((j, i) => input.labels[j!] === input.labels[i])) subgroup.push(o);
        }
  const parentKeys = new Set(parent.map(opKey));
  const subgroupKeys = new Set(subgroup.map(opKey));
  function group(ops: Op[], keys: Set<string>) {
    if (!keys.has(opKey({ r: identity, t: [0, 0, 0] }))) throw new Error("Missing identity");
    for (const a of ops)
      for (const b of ops)
        if (!keys.has(opKey(compose(a, b)))) throw new Error("Group closure failed");
    // Finite, closed, contains identity and consists of invertible affine maps: every inverse is in it.
  }
  group(parent, parentKeys);
  group(subgroup, subgroupKeys);
  if (subgroup.some((o) => !parentKeys.has(opKey(o)))) throw new Error("Not a subgroup");
  const translations = (ops: Op[]) =>
    ops
      .filter((o) => JSON.stringify(o.r) === JSON.stringify(identity))
      .map((o) => pointKey(o.t))
      .sort();
  const sameTranslations =
    JSON.stringify(translations(parent)) === JSON.stringify(translations(subgroup));
  const orbits: Point[][] = [];
  const seen = new Set<string>();
  for (const p of input.points)
    if (!seen.has(pointKey(p))) {
      const orbit = new Map(
        subgroup.map((o) => {
          const q = apply(o, p);
          return [pointKey(q), q];
        }),
      );
      orbits.push([...orbit.values()].sort((a, b) => pointKey(a).localeCompare(pointKey(b))));
      for (const k of orbit.keys()) seen.add(k);
    }
  const sizes = orbits.map((o) => o.length).sort((a, b) => a - b);
  if (
    parent.length !== 192 ||
    subgroup.length !== 96 ||
    parent.length / subgroup.length !== input.index ||
    input.subgroupKind !== "t" ||
    !sameTranslations ||
    JSON.stringify(sizes) !== JSON.stringify([...input.split].sort((a, b) => a - b))
  )
    throw new Error("Declared index, kind, split or ideal model is inconsistent");
  return {
    state: "verified_declared_ideal_model",
    method: "exact_quarter_coordinates_signed_permutation_affine_groups_v1",
    parentOperations: parent.length,
    subgroupOperations: subgroup.length,
    index: parent.length / subgroup.length,
    translationCosets: translations(parent).length,
    subgroupKind: "t",
    orbits,
    checks: [
      "affine_group_closure",
      "subgroup_inclusion",
      "same_translation_lattice",
      "orbit_split_4_plus_4",
    ],
    limitations: [
      "演算は宣言した立方セルの整数並進を法とした有限商で比較。",
      "空間群番号の独立同定・全設定の検証・実試料精度の検証ではない。",
      "既存の原子座標モデルや実相転移へ結果を転用しない。",
    ],
  };
}
export interface SymmetryMapping {
  id: string;
  assertionId: string;
  parent: { symbol: string; number: number | null; setting: string | null };
  child: { symbol: string; number: number | null; setting: string | null };
  subgroupKind: "t" | "k" | "i" | "unknown";
  index: number | null;
  basis: number[][] | null;
  origin: Point | null;
  convention: string;
  wyckoff: { from: string; to: string[] } | null;
  literatureState: "page_image_checked" | "legacy_not_rechecked";
  transcriptionState: "transcribed_with_explicit_interpretation" | "not_transcribed";
  interpretation: string;
  model?: IdealSymmetryInput;
}
export function appendSymmetryMapping(rows: Record<string, Cell[][]>, mapping: SymmetryMapping) {
  const assertion = rows.Assertion!.find((r) => r[0] === mapping.assertionId);
  const evidence = rows.HasEvidence!.filter((r) => r[0] === mapping.assertionId).map((r) => r[1]!);
  if (
    !assertion ||
    assertion[1] !== "symmetry" ||
    !mapping.id ||
    !evidence.length ||
    rows.SymmetryMapping!.some((r) => r[0] === mapping.id)
  )
    throw new Error("Invalid symmetry mapping assertion/evidence");
  if (mapping.index !== null && (!Number.isInteger(mapping.index) || mapping.index < 2))
    throw new Error("Invalid subgroup index");
  if (
    (mapping.basis === null) !== (mapping.origin === null) ||
    !mapping.convention ||
    !mapping.interpretation
  )
    throw new Error("Incomplete setting provenance");
  let validation: ReturnType<typeof verifyIdealCubicSplit> | null = null;
  if (mapping.model) {
    if (
      mapping.literatureState !== "page_image_checked" ||
      mapping.transcriptionState !== "transcribed_with_explicit_interpretation" ||
      mapping.index !== mapping.model.index ||
      mapping.subgroupKind !== mapping.model.subgroupKind ||
      JSON.stringify(mapping.basis) !== JSON.stringify(mapping.model.basis) ||
      JSON.stringify(mapping.origin) !== JSON.stringify(mapping.model.origin) ||
      mapping.wyckoff?.from !== "8a" ||
      JSON.stringify(mapping.wyckoff.to) !== JSON.stringify(["4a", "4c"])
    )
      throw new Error("Model and transcription disagree");
    validation = verifyIdealCubicSplit(mapping.model);
  }
  const add = (t: string, ...v: Cell[]) => rows[t]!.push(v);
  add("SymmetryMapping", mapping.id, JSON.stringify(mapping));
  add("MappingFor", mapping.id, mapping.assertionId);
  for (const span of evidence) add("MappingEvidence", mapping.id, span);
  if (mapping.model && validation) {
    const mid = `declared:${mapping.id}`;
    const vid = `validation:${mapping.id}`;
    add(
      "DeclaredSymmetryModel",
      mid,
      JSON.stringify({
        ...mapping.model,
        coordinateUnit: "quarter_of_common_cubic_cell",
        metric: "ideal cubic, relative length only",
        sourceInterpretation: mapping.interpretation,
      }),
    );
    add("MappingModel", mapping.id, mid);
    add(
      "SymmetryValidation",
      vid,
      JSON.stringify({ ...validation, reviewedOn: "2026-11-09", validatorVersion: 1 }),
    );
    add("Validates", vid, mapping.id);
  }
}
