import type { HeldVoidResolution } from "../knowledge/occupation.ts";

const prefix = "pilot:K:2-3:";
export const fluoriteRoleReference = {
  id: "occupation:K:fluorite:aflow-roles",
  reference: {
    s: "AF_FLUORITE",
    sec: "Face-centered Cubic primitive vectors; Basis vectors (Ca/F roles)",
    url: "https://aflow.org/p/AB2_cF12_225_a_c-001/",
  },
};
const scope =
  "選択した理想fcc骨格と空隙の幾何学的な構築説明。実試料・相・合成・相転移、原子半径を用いた安定性の主張を含まない。";
const limitations = [
  "原子座標・占有率・空隙の向き・Wyckoff対応・セル変換を数値検証した記録ではない。",
  "貫入による別の説明や、骨格と占有種を交換した既存関係は置換・統合しない。",
  "独立した結晶学専門家によるレビューは未実施。",
];
const cases = [
  {
    suffix: "nacl",
    name: "岩塩型",
    host: "Na",
    guest: "Cl",
    voidKind: "octahedral",
    selection: "all",
    roleBasis: "source_figure_interpretation",
    roleEvidenceSpanIds: [prefix + "span:fcc-operation", prefix + "span:2b"],
    roleNote:
      "図2(b)と本文のNa/Cl部分配列を用い、Na側を骨格に選んだ解釈。Cl骨格→Na占有の既存e1とは役割を区別する。",
    condition: "Naの理想fcc骨格の全八面体空隙をClで占有する。",
  },
  {
    suffix: "zns",
    name: "閃亜鉛鉱型",
    host: "Zn",
    guest: "S",
    voidKind: "tetrahedral",
    selection: "one_of_two",
    roleBasis: "source_figure_interpretation",
    roleEvidenceSpanIds: [prefix + "span:tetrahedral-operation", prefix + "span:2d"],
    roleNote:
      "図2(d)と本文のZn/S部分配列を用い、Zn側を骨格に選んだ解釈。二種類の四面体空隙のどちらを選ぶかの座標や方位は指定しない。",
    condition:
      "Znの理想fcc骨格で、二種類の向きの四面体空隙の一方をSで占有する。無作為な半占有とは区別する。",
  },
  {
    suffix: "fluorite",
    name: "蛍石型",
    host: "Ca",
    guest: "F",
    voidKind: "tetrahedral",
    selection: "both",
    roleBasis: "prototype_cross_check",
    roleEvidenceSpanIds: [fluoriteRoleReference.id],
    roleNote:
      "KのCaF₂という例の元素役割をAFLOW蛍石プロトタイプのCa/F配列で補助照合した。Ca/Fの役割はK本文の逐語転記ではない。",
    condition: "Caの理想fcc骨格で、二種類の向きの四面体空隙の両方をFで占有する。",
  },
] as const;
export const occupationReconsiderations: HeldVoidResolution[] = cases.map((c) => {
  const candidateId = `${prefix}relation:fcc-${c.suffix}-voids`;
  return {
    id: `decision:v2:${candidateId}`,
    predecessorId: `decision:v1:${candidateId}`,
    candidateId,
    extractionId: "extraction:K:pdf2-3:v1",
    assetHash: "89e53b92d39ab682ec8dd1b6931e580ccb0de19fe07524d91d51d47ea9688e27",
    reviewId: `curation:K:pdf2-3:occupation-v2:${c.suffix}`,
    reviewer: "Codex",
    reviewedOn: "2026-11-09",
    reason: `KのPDF 3頁・印刷158頁の空隙占有の条件を再照合し、骨格・占有原子種・対象集合を明示した構築説明として採用する。${c.roleNote}`,
    evidenceSpanIds: [
      ...new Set([prefix + "span:tetrahedral-operation", ...c.roleEvidenceSpanIds]),
    ],
    resolution: {
      kind: "assertion",
      label: `空隙占有で${c.name}を構築（${c.host}骨格・${c.guest}占有）`,
      description: c.condition,
      target: `occupation:${candidateId}`,
      scope,
      notes: [c.roleNote],
    },
    occupation: {
      id: `occupation:${candidateId}`,
      hostMotifId: "fcc",
      hostSpecies: c.host,
      guestSpecies: c.guest,
      voidKind: c.voidKind,
      selection: c.selection,
      roleBasis: c.roleBasis,
      roleEvidenceSpanIds: [...c.roleEvidenceSpanIds],
      roleNote: c.roleNote,
      condition: c.condition,
      cellScope: "K §2.1の理想立方構造の説明に限定。具体的な座標設定・原点・空隙の方位は未指定。",
    },
    limitations,
  };
});
