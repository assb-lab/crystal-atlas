/** Evidence availability and how a claim was produced are independent facts. */
export function missingEvidenceLabel(basis: string): string {
  return basis === "editorial"
    ? "この所属は編集上の整理です。文献による所属の再照合が必要です。"
    : "この関係の出典は未登録です。根拠の照合が必要です。";
}
export function stepProvenanceLabel(payload: string): string {
  const { detailState } = JSON.parse(payload) as { detailState?: string };
  return detailState === "annotated"
    ? "既存記述からの操作注釈です。文献の該当箇所との再照合は未実施です。"
    : "操作の対象・パラメータは詳細未転記です。";
}
