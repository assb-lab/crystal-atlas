import type { IdentityRegistry } from "../knowledge/identity.ts";
import type { Source } from "../types.ts";

export const identitySources: Record<string, Source> = {
  AF_TIO2: {
    short: "AFLOW · TiO₂ polymorphs",
    title: "Rutile and Anatase — Encyclopedia of Crystallographic Prototypes",
    author: "AFLOW consortium",
    article: "https://aflow.org/p/A2B_tP6_136_f_a-001/",
    citation:
      "AFLOW Encyclopedia of Crystallographic Prototypes, Rutile A2B_tP6_136_f_a-001 and Anatase A2B_tI12_141_e_a-001 (accessed 2026-11-09).",
    coverage:
      "TiO₂のルチル・アナターゼ多形、各プロトタイプ・空間群型、アナターゼの設定1／2に関する訂正注記を確認。測定温度・圧力・実試料条件や原子座標の再検証は未実施。",
  },
};
const base = "https://aflow.org/p/";
const cases = [
  { id: "rutile", title: "ルチル", prototype: "A2B_tP6_136_f_a-001" },
  { id: "anatase", title: "アナターゼ", prototype: "A2B_tI12_141_e_a-001" },
];
export const identityRegistry: IdentityRegistry = {
  id: "identity:TiO2:v1",
  reviewedOn: "2026-11-09",
  reviewer: "Codex",
  entities: [
    {
      id: "material:TiO2",
      title: "TiO₂ · 物質の組成定義",
      kind: "chemical_substance",
      description: "TiO₂という化学組成を表す。単一の結晶構造・試料・測定条件を指定しない。",
      formula: "TiO2",
    },
    ...cases.flatMap((c) => [
      {
        id: `phase:TiO2:${c.id}`,
        title: `TiO₂ · ${c.title}相（条件未転記）`,
        kind: "material_phase" as const,
        description: `一次資料がTiO₂の多形として記載する${c.title}。測定条件を特定した実試料のレコードではない。`,
        substanceId: "material:TiO2",
        conditions: {
          temperatureK: null,
          pressurePa: null,
          composition: "TiO2",
          sample: null,
          state: "not_transcribed" as const,
        },
      },
      {
        id: `prototype:TiO2:${c.id}`,
        title: `${c.title} · TiO₂プロトタイプ`,
        kind: "structural_prototype" as const,
        description: `AFLOW ${c.prototype}の代表的な原子種の割当。構造型と特定の実測相を同一視しない。`,
        prototypeLabel: c.prototype,
      },
    ]),
  ],
  claims: cases.flatMap((c) => {
    const reference = {
      s: "AF_TIO2",
      sec: `${c.title}: Prototype / polymorphs / setting notes`,
      url: `${base}${c.prototype}/`,
    };
    const scope =
      "資料で記載するTiO₂多形の識別。温度・圧力・安定領域・実試料の同一性や相転移経路は未確認。";
    return [
      {
        id: `identity:${c.id}:phase-of`,
        subjectId: `phase:TiO2:${c.id}`,
        objectId: "material:TiO2",
        operation: "phase_of",
        label: "同じ物質の多形",
        scope,
        references: [reference],
      },
      {
        id: `identity:${c.id}:structure-type`,
        subjectId: `phase:TiO2:${c.id}`,
        objectId: c.id,
        operation: "has_structure_type",
        label: `${c.title}相の構造型`,
        scope,
        references: [reference],
      },
      {
        id: `identity:${c.id}:prototype`,
        subjectId: `prototype:TiO2:${c.id}`,
        objectId: c.id,
        operation: "prototype_of_type",
        label: `${c.title}型のTiO₂プロトタイプ`,
        scope: "元素の割当を持つ参照プロトタイプ。一般の構造型・実測試料とは区別する。",
        references: [reference],
      },
    ];
  }),
  illustrations: [
    {
      modelId: "model:anatase",
      prototypeId: "prototype:TiO2:anatase",
      note: "既存プロトタイプ模型を例示として接続。AFLOWは過去の設定1→2の酸素座標の訂正を明記しているため、既存模型との数値対応は要再照合。実験精密化模型としない。",
    },
  ],
};
