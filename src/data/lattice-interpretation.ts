import type { HeldMentionResolution } from "../knowledge/reconsideration.ts";
import type { Ref } from "../types.ts";

export const latticeReferences: { id: string; reference: Ref }[] = [
  {
    id: "definition:lattice:iucr",
    reference: { s: "IUCR_LATTICE", sec: "Definition", url: "https://dictionary.iucr.org/Lattice" },
  },
  {
    id: "definition:cF:ita16",
    reference: {
      s: "ITA16_SOUVIGNIER",
      sec: "§1.3.2.1; §1.3.2.4(iii) Face-centred cubic lattice cF",
      url: "https://it.iucr.org/Ac/ch1o3v0001/",
    },
  },
];
export const latticeEntity = {
  id: "bravais:cF",
  title: "cF · 面心立方ブラベー格子型",
  kind: "bravais_lattice_type",
  description: "三次元の立方・F心格子の型。原子の種類・占有・配置を含む構造モチーフとは区別する。",
  symbol: "cF",
  definitionSpanIds: latticeReferences.map((r) => r.id),
  dimension: 3,
  crystalFamily: "cubic",
  centring: "F",
  scope: "格子の型を表す。特定の計量を持つ格子、物質・相、原子配置モデル、空間群の指定ではない。",
};
export const latticeDescription = {
  id: "description:fcc:bravais-cF",
  label: "単原子fccモチーフの並進格子型はcF",
  description:
    "既存fccカードで扱う、単一種類の原子を同等のfcc格子点へ配置した理想モチーフについて、その並進格子型をcFと記述する。",
  scope:
    "単原子・同等サイトの理想fccモチーフに限定。多原子構造のccp部分配列から、結晶全体の並進格子を決めることはしない。",
  limitations: [
    "対象の記述上の対応であり、同一性・派生操作・分類所属・群–部分群関係を主張しない。",
    "具体的な格子定数・セル変換・座標の機械検証は今回実施していない。",
  ],
};
export const latticeReconsideration: HeldMentionResolution = {
  id: "decision:v2:pilot:K:2-3:mention:fcc-lattice",
  predecessorId: "decision:v1:pilot:K:2-3:mention:fcc-lattice",
  candidateId: "pilot:K:2-3:mention:fcc-lattice",
  extractionId: "extraction:K:pdf2-3:v1",
  assetHash: "89e53b92d39ab682ec8dd1b6931e580ccb0de19fe07524d91d51d47ea9688e27",
  reviewId: "curation:K:pdf2-3:lattice-v2",
  reviewer: "Codex",
  reviewedOn: "2026-11-09",
  reason:
    "K §2.1の格子と構造を区別する文脈、および面心立方格子を四組の単純立方格子で説明する箇所を再照合した。IUCrの格子の定義とcFの表記を用い、この登場記録は新設した格子型へ対応させる。元候補fccの原子配置モチーフとの同一性は採用しない。",
  evidenceSpanIds: ["pilot:K:2-3:span:fcc-lattice", ...latticeReferences.map((r) => r.id)],
  resolution: {
    kind: "entity",
    entityId: latticeEntity.id,
    scope:
      "KのPDF 3頁・印刷158頁の当該登場記録に限定した、格子型cFへの対応。特定の格子定数や物質・相を確定しない。",
  },
  limitations: [
    "初回の保留判断、原表記、旧fcc対応候補は履歴として保持する。",
    "他の登場記録・保留中の6関係、既存の採用4関係の解釈は更新しない。",
    "この文脈の照合は独立した結晶学専門家のレビューをまだ受けていない。",
  ],
};
