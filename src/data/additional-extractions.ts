import autoK4 from "./K4-auto-extraction.json" with { type: "json" };
import type { ExtractionBatch } from "../knowledge/extraction.ts";
const K = "manual:K:4:";
const M = "manual:M13:21:";
const kRefs = [
  { key: "void-o", sec: "図3(a)・八面体空隙", surface: "figure" },
  { key: "void-t", sec: "図3(b)・二種類の四面体空隙", surface: "figure" },
  { key: "4a", sec: "図4(a)", surface: "figure" },
  { key: "4b", sec: "図4(b)", surface: "figure" },
  { key: "4c", sec: "図4(c)", surface: "figure" },
  { key: "5a", sec: "図5(a)", surface: "figure" },
  { key: "5b", sec: "図5(b)", surface: "figure" },
  { key: "5c", sec: "図5(c)・名称に不明の注記", surface: "figure" },
  { key: "hex-op", sec: "§2.1・六方配置の貫入を説明する段落", surface: "body" },
] as const;
export const additionalExtractions: ExtractionBatch[] = [
  {
    id: "extraction:K:pdf4:v1",
    sourceId: "K",
    assetHash: "89e53b92d39ab682ec8dd1b6931e580ccb0de19fe07524d91d51d47ea9688e27",
    operator: "Codex",
    reviewedOn: "2026-11-09",
    pdfFrom: 4,
    pdfTo: 4,
    pageAnchors: [{ pdfPage: 4, printedPage: 159 }],
    scope:
      "PDF 4頁の図3–5と§2.1から選択した登場記録・構築説明。採否は未実施。全ての繰り返し表記の網羅ではない。",
    limitations: [
      "候補段階で確定リンク・Assertionを作らない。",
      "図5(c)は六方晶ダイヤモンドという図中表記と名称不明というキャプション注記を併記し、同定を保留。",
      "hcpと呼ぶ説明にはa/c未指定の注意がある。球の最密充填比を補わない。",
      "~3/8は近似表記のまま保持。群対応・座標の検証は未実施。",
    ],
    spans: kRefs.map((r) => ({
      id: K + "span:" + r.key,
      ref: { s: "K", p: 159, pdfPage: 4, sec: r.sec },
      surface: r.surface,
    })),
    mentions: [
      ["4a", "単純六方構造", "simple-hex"],
      ["4b", "WC構造", "wc"],
      ["4c", "六方最密充填構造", "hcp"],
      ["5a", "六方最密充填構造", "hcp"],
      ["5b", "ウルツ鉱構造", "wurtzite"],
      ["5c", "六方晶ダイヤモンド", "lonsdaleite"],
    ].map(([key, rawName, entityId]) => ({
      id: K + "mention:" + key,
      rawName: rawName!,
      spanId: K + "span:" + key,
      identityNote:
        key === "5c"
          ? "図中の名称とキャプションの不明注記が併存するため、既存理想2H模型との同一性を確定しない。"
          : "図の理想配置への対応候補。物質・相・測定条件の同一性は未確認。",
      candidates: [{ entityId: entityId!, note: "原表記・図の対応候補。未採用。" }],
    })),
    relations: [
      {
        id: K + "relation:hex-wc",
        domain: "derivation",
        operation: "interpenetration",
        basis: "source_paraphrase",
        subjectMention: K + "mention:4a",
        objectMention: K + "mention:4b",
        evidenceSpanIds: [K + "span:4a", K + "span:4b", K + "span:hex-op"],
        description: "二組の異種原子の単純六方配置を原文の相対移動で重ねてWC型とする説明。",
        parameters: { shiftInSourceCell: ["1/3", "2/3", "1/2"], species: "different" },
        symmetryNote: "空間群の記述は保持するが群–部分群の厳密な対応は未検証。",
        existingAssertions: [],
      },
      {
        id: K + "relation:hex-hcp",
        domain: "derivation",
        operation: "interpenetration",
        basis: "source_paraphrase",
        subjectMention: K + "mention:4a",
        objectMention: K + "mention:4c",
        evidenceSpanIds: [K + "span:4a", K + "span:4c", K + "span:hex-op"],
        description:
          "同種原子の二組を貫入してhcpと呼ぶ説明。原文はa/cが未指定のため必ずしも球の最密充填でないと注記する。",
        parameters: {
          shiftInSourceCell: ["1/3", "2/3", "1/2"],
          species: "same",
          axialRatio: "not_specified",
        },
        symmetryNote: null,
        existingAssertions: [],
      },
      {
        id: K + "relation:hcp-wurtzite",
        domain: "derivation",
        operation: "interpenetration",
        basis: "source_paraphrase",
        subjectMention: K + "mention:5a",
        objectMention: K + "mention:5b",
        evidenceSpanIds: [K + "span:5a", K + "span:5b", K + "span:hex-op"],
        description: "異なる二組の六方配置を、原文の近似した相対移動で重ねる構築説明。",
        parameters: {
          shiftInSourceCell: ["0", "0", "~3/8"],
          approximate: true,
          species: "different",
        },
        symmetryNote: "本文は反転中心の変化に言及するが正式な群対応は未検証。",
        existingAssertions: [],
      },
    ],
  },
  {
    id: "extraction:M13:pdf21:v1",
    sourceId: "M13",
    assetHash: "2ad1dbc5bc7e41f7cc4c7bbd61136d6ead30f76c4001f543e22fba0bfc2c84e9",
    operator: "Codex",
    reviewedOn: "2026-11-09",
    pdfFrom: 21,
    pdfTo: 21,
    pageAnchors: [{ pdfPage: 21, printedPage: 4 }],
    scope: "§1.2・Fig.1.1のdiamondとzinc blendeの選択例。全頁の語の全出現を抽出したものではない。",
    limitations: [
      "この段階では登場記録と対称性の候補のみ。対応・群演算・セルの数値検証は未実施。",
      "図の原点・設定を他の座標モデルへ自動適用しない。",
    ],
    spans: [
      {
        id: M + "span:diamond",
        ref: { s: "M13", p: 4, pdfPage: 21, sec: "Fig.1.1・上位のdiamond" },
        surface: "figure",
      },
      {
        id: M + "span:zns",
        ref: { s: "M13", p: 4, pdfPage: 21, sec: "Fig.1.1・下位のzinc blende" },
        surface: "figure",
      },
      {
        id: M + "span:tree",
        ref: { s: "M13", p: 4, pdfPage: 21, sec: "§1.2・Fig.1.1・t2とWyckoff位置の分裂" },
        surface: "figure",
      },
    ],
    mentions: [
      {
        id: M + "mention:diamond",
        rawName: "diamond",
        spanId: M + "span:diamond",
        identityNote: "理想配置・構造型への候補。実試料・特定模型の同一性を示さない。",
        candidates: [{ entityId: "diamond", note: "構造型の対応候補。" }],
      },
      {
        id: M + "mention:zns",
        rawName: "zinc blende",
        spanId: M + "span:zns",
        identityNote: "zinc blende／sphaleriteという本文の構造型の例。",
        candidates: [{ entityId: "zns", note: "構造型の対応候補。" }],
      },
    ],
    relations: [
      {
        id: M + "relation:diamond-zns",
        domain: "symmetry",
        operation: "group_subgroup",
        basis: "source_paraphrase",
        subjectMention: M + "mention:diamond",
        objectMention: M + "mention:zns",
        evidenceSpanIds: [M + "span:tree"],
        description: "Fig.1.1がdiamondからzinc blendeへのt2と8aから4a+4cへの分裂を示す。",
        parameters: {
          index: 2,
          subgroupKind: "t",
          wyckoffSource: "8a",
          wyckoffTargets: ["4a", "4c"],
        },
        symmetryNote: "設定・図の座標はこの抽出段階では照合候補。正式な数値検証は未実施。",
        existingAssertions: [
          {
            assertionId: "relation:e8",
            note: "同じ型の組の既存関係だが、図の設定・セル対応・数値検証の状態を別に照合する。",
          },
        ],
      },
    ],
  },
  autoK4 as ExtractionBatch,
];
