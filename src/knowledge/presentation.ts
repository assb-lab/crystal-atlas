/** Evidence availability and how a claim was produced are independent facts. */
export function missingEvidenceLabel(basis: string): string {
  return basis === "editorial"
    ? "この所属は編集上の整理です。文献による所属の再照合が必要です。"
    : "この関係の出典は未登録です。根拠の照合が必要です。";
}
export function stepProvenanceLabel(payload: string): string {
  const { detailState, adoptionRound } = JSON.parse(payload) as {
    detailState?: string;
    adoptionRound?: string;
  };
  if (adoptionRound === "held_relation_resolution")
    return "保留後に対象と占有条件を文献の選択箇所で再照合した記録です。座標・セル変換・サイト対応の数値検証は未実施です。";
  if (detailState === "source_context_checked")
    return "文献の選択箇所と操作の説明を照合した初回採用記録です。セル変換・サイト対応の数値検証は未実施です。";
  return detailState === "annotated"
    ? "既存記述からの操作注釈です。文献の該当箇所との再照合は未実施です。"
    : "操作の対象・パラメータは詳細未転記です。";
}
export function assertionProvenanceLabel(
  status: string,
  basis: string,
  adoptionRound?: string,
): string {
  if (
    status === "source_checked_not_machine_verified" &&
    adoptionRound === "held_relation_resolution"
  )
    return "文献の文脈を再照合し、対象と占有条件を明示した構築説明として採用。座標・群対応の機械検証は未実施です。";
  if (status === "source_checked_not_machine_verified")
    return basis === "editorial_comparison"
      ? "文献の配位記述を根拠とする編集上の比較として採用。"
      : "文献の文脈を照合し、構造構築の説明として初回採用。座標・群対応の機械検証は未実施です。";
  return "既存収録データから移行した記述です。移行後の再照合は未実施です。";
}

export const operationLabels: Record<string, string> = {
  interpenetration: "貫入",
  species_identification: "同種原子によるサイト占有",
  void_occupation: "空隙占有",
  coordination_comparison: "配位の比較",
};
export const parameterLabels: Record<string, string> = {
  shiftInSourceCell: "原文の単位胞に対する相対移動",
  representativeShift: "代表的な軸方向の相対移動",
  species: "部分格子の原子種",
  voidKind: "空隙の種類",
  occupiedOrientationClasses: "占有する空隙の向き",
  occupation: "占有の範囲",
};
export function parameterValue(value: unknown): string {
  if (Array.isArray(value)) return `(${value.map(String).join(", ")})`;
  const labels: Record<string, string> = {
    same: "同種",
    different: "異種",
    tetrahedral: "四面体",
    octahedral: "八面体",
    both: "両方",
    one_of_two: "2種類のうち一方",
    all: "すべて",
  };
  return typeof value === "string" ? (labels[value] ?? value) : (JSON.stringify(value) ?? "未転記");
}

export const entityKindLabel = (kind: string) =>
  ({
    bravais_lattice_type: "ブラベー格子型",
    structural_motif: "構造モチーフ",
    structure_type: "構造型",
    legacy_material_or_phase: "物質・相（未分離）",
    family: "ファミリー",
  })[kind] ?? kind;
