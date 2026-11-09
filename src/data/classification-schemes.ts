import type { ClassificationRegistry } from "../knowledge/classification.ts";
// HS Table 1, printed p.785 / PDF4, complete page image checked 2026-11-09.
const tilts = [
  ["a⁰a⁰a⁰", "Pm−3m · 221"],
  ["a⁰a⁰c⁺", "P4/mbm · 127"],
  ["a⁰b⁺b⁺", "I4/mmm · 139"],
  ["a⁺a⁺a⁺", "Im−3 · 204"],
  ["a⁺b⁺c⁺", "Immm · 71"],
  ["a⁰a⁰c⁻", "I4/mcm · 140"],
  ["a⁰b⁻b⁻", "Imma · 74"],
  ["a⁻a⁻a⁻", "R−3c · 167"],
  ["a⁰b⁻c⁻", "C2/m · 12"],
  ["a⁻b⁻b⁻", "C2/c · 15"],
  ["a⁻b⁻c⁻", "P−1 · 2"],
  ["a⁰b⁺c⁻", "Cmcm · 63"],
  ["a⁺b⁻b⁻", "Pnma · 62"],
  ["a⁺b⁻c⁻", "P2₁/m · 11"],
  ["a⁺a⁺c⁻", "P4₂/nmc · 137"],
];
const refs = [{ s: "HS", p: 785, pdfPage: 4, sec: "Table 1・15個の単純回転系（無回転を含む）" }];
export const howardScheme: ClassificationRegistry = {
  id: "scheme:HS:1998:table1",
  title: "Howard–Stokes 1998 · 15単純回転系",
  basis: "literature_classification",
  documents: ["HS"],
  scope:
    "Table 1の理想ABX₃回転分類。Glazerの23系との比較を15系へ統合する著者の分類。実物質の陽イオン秩序・極性変位や相同定は含まない。",
  items: [
    { id: "class:HS:root", title: "単純八面体回転（無回転を含む）", refs },
    ...tilts.map(([tilt, sg], i) => ({
      id: `class:HS:${i}`,
      title: `${tilt} · ${sg}`,
      parentId: "class:HS:root",
      refs,
    })),
  ],
  memberships: [
    {
      id: "class-member:HS:perov",
      entityId: "perov",
      itemId: "class:HS:0",
      scope: "理想立方ペロブスカイトの無回転の基準型。実在する各物質カードを一括で分類しない。",
      refs,
    },
  ],
};
