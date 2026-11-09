import type { DecisionBatch } from "../knowledge/decisions.ts";
import type { SymmetryMapping, Point } from "../knowledge/symmetry.ts";
const prefix = "manual:M13:21:";
const relation = prefix + "relation:diamond-zns";
const limitations = [
  "Fig.1.1の理想的な構造型と設定に限定。実際のCからZnSへの反応・相転移を意味しない。",
  "図の転記・同じセルという本文の解釈と、理想模型の代数検証を区別する。",
  "専門家による独立レビューと空間群番号の独立同定は未実施。",
];
export const mullerReview: DecisionBatch = {
  id: "curation:M13:pdf21:v1",
  extractionId: "extraction:M13:pdf21:v1",
  assetHash: "2ad1dbc5bc7e41f7cc4c7bbd61136d6ead30f76c4001f543e22fba0bfc2c84e9",
  reviewer: "Codex",
  reviewedOn: "2026-11-09",
  method: "document_context_review",
  scope: "§1.2・Fig.1.1の二つの構造型とt2説明の限定照合。",
  limitations,
  decisions: [
    ...["diamond", "zns"].map((key) => ({
      id: `decision:M13:${key}`,
      candidateKind: "mention" as const,
      candidateId: prefix + "mention:" + key,
      outcome: "accepted" as const,
      reason: "本文とFig.1.1で構造型の対応を確認。実試料の同一性ではない。",
      evidenceSpanIds: [prefix + "span:" + key],
      nextAction: null,
      resolution: { kind: "entity" as const, entityId: key, scope: "図が示す理想的な構造型の例" },
    })),
    {
      id: "decision:M13:diamond-zns",
      candidateKind: "relation",
      candidateId: relation,
      outcome: "accepted",
      reason: "Fig.1.1の下向きt2、C8aからS4a+Zn4cへの分裂、座標を全頁画像で確認。",
      evidenceSpanIds: [prefix + "span:tree"],
      nextAction: null,
      resolution: {
        kind: "assertion",
        label: "Müller Fig.1.1 · diamond → zinc blende",
        description: "理想位置集合を二つの原子種で区別したときの群–部分群と軌道分裂。",
        target: null,
        scope: "共通の図の立方セルと原点での限定対応。",
        notes: limitations,
      },
    },
  ],
};
const f: Point[] = [
  [0, 0, 0],
  [0, 2, 2],
  [2, 0, 2],
  [2, 2, 0],
];
export const diamondMapping: SymmetryMapping = {
  id: "mapping:M13:fig1.1",
  assertionId: "adopted:" + relation,
  parent: { symbol: "Fd−3m", number: 227, setting: "図の通常立方セル、C8a=(0,0,0)を原点に採用" },
  child: {
    symbol: "F−43m",
    number: 216,
    setting: "図の同じ立方軸、S4a=(0,0,0)、Zn4c=(1/4,1/4,1/4)",
  },
  subgroupKind: "t",
  index: 2,
  basis: [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ],
  origin: [0, 0, 0],
  convention: "(a_child,b_child,c_child)=(a_parent,b_parent,c_parent) P; x_parent=P x_child+p",
  wyckoff: { from: "8a", to: ["4a", "4c"] },
  literatureState: "page_image_checked",
  transcriptionState: "transcribed_with_explicit_interpretation",
  interpretation:
    "t2・8a→4a+4c・代表座標は図の転記。P=I,p=0は本文の同じ立方セルと図の共有する原点を採用した明示的解釈。別の原点選択にある8a=(1/8,1/8,1/8)へ適用しない。空間群番号は既存型の標準記号との対応。",
  model: {
    points: [...f, ...f.map((p) => p.map((x) => x + 1) as Point)],
    labels: ["S", "S", "S", "S", "Zn", "Zn", "Zn", "Zn"],
    basis: [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ],
    origin: [0, 0, 0],
    index: 2,
    subgroupKind: "t",
    split: [4, 4],
  },
};
