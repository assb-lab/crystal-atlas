import type { HeldLabelResolution } from "../knowledge/derivation.ts";

const prefix = "pilot:K:2-3:";
const cases = [
  {
    suffix: "cscl-bcc",
    labels: ["Cs", "Cl"],
    span: "sc-operation",
    scope: "図1(b,c)と本文。二つの原子ラベルを区別しない理想配置をbccモチーフとして読む。",
  },
  {
    suffix: "nacl-sc",
    labels: ["Na", "Cl"],
    span: "fcc-operation",
    scope: "図2(b,c)と本文。二つの原子ラベルを区別しない理想配置を単純立方モチーフとして読む。",
  },
  {
    suffix: "zns-diamond",
    labels: ["Zn", "S"],
    span: "tetrahedral-operation",
    scope:
      "図2(d,e)と本文。二つの原子ラベルを区別しない理想配置をダイヤモンド型として読む。Xを実際の炭素と同一視しない。",
  },
];
export const labelReconsiderations: HeldLabelResolution[] = cases.map((c) => {
  const candidateId = prefix + "relation:" + c.suffix;
  const specId = "label-map:" + candidateId;
  return {
    id: "decision:v2:" + candidateId,
    predecessorId: "decision:v1:" + candidateId,
    candidateId,
    extractionId: "extraction:K:pdf2-3:v1",
    assetHash: "89e53b92d39ab682ec8dd1b6931e580ccb0de19fe07524d91d51d47ea9688e27",
    reviewId: "curation:K:pdf2-3:label-v2:" + c.suffix,
    reviewer: "Codex",
    reviewedOn: "2026-11-09",
    reason:
      "同種原子が占有するという本文を再照合し、原子種の区別を消した理想配置へのラベル写像として採用する。実際の元素置換・合成や、到達セルの変換の検証とは区別する。",
    evidenceSpanIds: [prefix + "span:" + c.span],
    limitations: [
      "実際の原子の変換・化学反応・相転移を意味しない。",
      "原子位置集合を読む模型上の操作であり、最小セル・原点・Wyckoff対応は未検証。",
      "逆向きの色分けや既存対称性説明と同じAssertionへ統合しない。専門家の独立レビューは未実施。",
    ],
    resolution: {
      kind: "assertion",
      label: `${c.labels.join("/")}の区別を外して理想配置を読む`,
      description: c.scope,
      target: specId,
      scope: c.scope,
      notes: ["Xは共通の抽象ラベルで、特定の元素を指定しない。"],
    },
    labelMap: {
      id: specId,
      inputLabels: c.labels,
      outputLabel: "X",
      geometryPolicy: "retain_ideal_position_set",
      cellPolicy: "minimal_cell_not_verified",
      scope: c.scope,
    },
  };
});
export const operationVocabulary = [
  {
    id: "interpenetration",
    title: "貫入・重ね合わせ",
    meaning: "部分配置を相対移動して重ねる構築説明。",
    fields: ["部分配置", "原子種の役割", "相対移動と参照セル"],
    examples: ["relation:okamoto-lattices-fcc-nacl"],
  },
  {
    id: "site_occupation",
    title: "空隙・サイトの占有",
    meaning: "指定した骨格・サイト集合を、指定した種で占有する。",
    fields: ["骨格と原子種", "サイト／空隙の集合", "占有条件と配置"],
    examples: ["relation:e1", "relation:e4"],
  },
  {
    id: "vacancy",
    title: "欠損・除去",
    meaning: "指定した原子／サイト集合を除き、残す配置を記述する。",
    fields: ["除く集合と分母", "規則配置", "骨格・変位の扱い"],
    examples: ["relation:e38"],
  },
  {
    id: "ordering",
    title: "規則化",
    meaning: "同じ親サイト集合のラベル／占有を規則的に区別する。",
    fields: ["親サイト", "ラベル・比率", "超胞・配置"],
    examples: ["derivation:e6"],
  },
  {
    id: "substitution",
    title: "元素・ラベルの置換",
    meaning: "指定するサイト・役割に別のラベルを割り当てる記述。実反応とは別。",
    fields: ["元と先の役割", "対象サイト", "幾何を保つ条件"],
    examples: ["relation:related-rbcaf3"],
  },
  {
    id: "species_identification",
    title: "ラベルの同一視",
    meaning: "異なるラベルを共通の抽象ラベルへ写し、理想配置を読み直す。",
    fields: ["入力ラベル", "共通ラベル", "配置と到達セルの扱い"],
    examples: ["relation:okamoto-lattices-simple-cubic-bcc"],
  },
  {
    id: "stacking",
    title: "積層の変更",
    meaning: "層・ブロックの種類、順序、相対移動を記述する。",
    fields: ["層／ブロック", "順序・周期", "相対配置"],
    examples: ["relation:e49"],
  },
  {
    id: "distortion",
    title: "歪み・変位",
    meaning: "セルまたは原子配置の変位を、対象と基準を明示して記述する。",
    fields: ["基準セル／配置", "動く対象", "変位・歪みの状態"],
    examples: ["derivation:e56"],
  },
  {
    id: "block_substitution",
    title: "分子・ブロックへの置換",
    meaning: "点／サイトを分子・多面体・ブロックとして置き換える構築説明。",
    fields: ["置換するサイト", "ブロックと向き", "接続とセルの扱い"],
    examples: ["relation:related-cab6", "relation:okamoto-blocks-nacl-cac2"],
  },
];
