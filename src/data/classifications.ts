import type { Collection, Ref, StructureLabel } from "../types.ts";
/** Overlapping classifications supplement, rather than replace, the original families.
 * Tables distinguish ideal rotation groups, measured phases, and literature-only rows.
 */
const classifyRef = (s: string, sec: string, p?: number): Ref => ({
  s,
  sec,
  ...(p === undefined ? {} : { p }),
});
const tiltRefs = [classifyRef("GL", "Glazer表記"), classifyRef("HS", "Table 1")];
const delmasRefs = [
  classifyRef("DL", "配位とスラブ周期"),
  classifyRef("YB13", "O2・O3・O4"),
  classifyRef("CA03", "Figs. 2–3"),
  classifyRef("BE11", "OP4・OPP9"),
];
const honeyRefs = [
  classifyRef("CH12", "Na₂IrO₃・Table I"),
  classifyRef("VC07", "Co系ハニカム・Tables 1–2"),
];
const pyroRefs = [
  classifyRef("GI", "§5.8", 102),
  classifyRef("K", "パイロクロア部分格子・図11", 162),
];

export const collections: Collection[] = [];
export const structureLabels: Record<string, StructureLabel[]> = {};
function addClassification(
  id: string,
  group: string,
  title: string,
  desc: string,
  ids: string[],
  refs: Ref[],
  extra: Pick<Collection, "parent" | "short" | "table"> = {},
) {
  collections.push({ id, group, title, desc, ids: [...new Set(ids)], refs, ...extra });
}
function labelStructures(ids: string[], key: string, value: string, refs: Ref[], detail?: string) {
  for (const id of ids) {
    (structureLabels[id] ??= []).push({ key, value, refs, ...(detail ? { detail } : {}) });
  }
}

const perovGroups: [string, string, string[], string][] = [
  [
    "perov-simple",
    "基本型・極性・反強誘電",
    [
      "perov",
      "bt-cubic",
      "batio3",
      "bt-ortho",
      "bt-rhombo",
      "kto",
      "kno-tet",
      "kno-ortho",
      "nno-afe",
      "pto",
      "pzo",
      "sto-tet",
      "srzro3-tet",
      "tilted",
      "gfo",
      "lmo",
      "lao",
      "bfo",
      "kmgf3",
      "knif3",
      "kfef3",
      "rbcaf3",
      "kcuf3",
      "kcrf3",
      "cspbcl3-cubic",
      "cspbbr3-cubic",
      "cspbbr3-ortho",
      "srtao2n",
    ],
    "BO₆の3D頂点共有を基本に、八面体回転と陽イオン変位を分けて比較。ハロゲン化物・酸窒化物も共通骨格から集めます。",
  ],
  [
    "perov-a-order",
    "Aサイト秩序 · 1:1 / 1:3",
    ["perov", "ccto", "namn7o12", "camntio6-ht", "camntio6"],
    "AA′B₂O₆型のCaMnTi₂O₆は1:1柱状秩序、AA′₃B₄O₁₂型のCaCu₃Ti₄O₁₂・NaMn₇O₁₂は1:3秩序。A′の配位と回転系も異なります。",
  ],
  [
    "perov-b-order",
    "Bサイト秩序 · 1:1 / 1:2",
    [
      "perov",
      "doubleperov",
      "bamgwo6",
      "srniwo6",
      "srfemoo6",
      "camgwo6",
      "bast",
      "bamt",
      "bamnb",
      "bbio3",
      "k2naalf6",
      "elpasolite",
      "cryolite",
    ],
    "A₂BB′X₆の1:1岩塩型秩序、A₃BB′₂O₉の1:2秩序、Biの電荷不均化を区別して比較。",
  ],
  [
    "perov-blocks",
    "層状ブロック · RP / DJ / Aurivillius",
    [
      "perov",
      "rp1",
      "k2nif4",
      "sr2iro4",
      "sr2cuo2cl2",
      "rp2",
      "rp3",
      "rbca2nb3o10",
      "bi4ti3o12",
      "srbi2ta2o9",
      "bi2wo6",
      "bi2moo6",
      "la2ti2o7",
      "la2ti2o7-ht",
    ],
    "RPの岩塩層、Dion–Jacobsonの単一層間陽イオン、AurivilliusのBi₂O₂層、シアー型層状相を区分します。",
  ],
  [
    "perov-vacancies",
    "欠損・無限層・反ペロブスカイト",
    ["perov", "reo3", "scf3", "brown", "sr2fe2o5", "srfeo2", "antiPerov", "fe4n", "mn3alc"],
    "Aサイト欠損、酸素空孔の秩序化、四面体/八面体交替、配位子・陽イオン役割交換という異なる操作。",
  ],
  [
    "perov-hex",
    "六方積層・ポストペロブスカイト",
    [
      "perov",
      "hexperov",
      "bt-6h",
      "baru-9r",
      "bamn-4h",
      "srmno3-4h",
      "cscdcl3",
      "csnicl3",
      "cairo3",
    ],
    "頂点共有/面共有の積層多形と、稜共有のポストペロブスカイトを別系統として比較します。",
  ],
];
addClassification(
  "perovskites",
  "ペロブスカイト",
  "ペロブスカイト · 分類総覧",
  "散在する酸化物・ハロゲン化物を、骨格、A/Bサイト秩序、層状ブロック、欠損で横断分類。Glazer回転系の表からも探せます。",
  perovGroups.flatMap((row) => row[2]),
  [classifyRef("G", "ペロブスカイトの分類", 1), ...tiltRefs],
);
for (const [id, title, ids, desc] of perovGroups) {
  const refs =
    id === "perov-a-order"
      ? [classifyRef("CM14", "柱状Aサイト秩序"), classifyRef("K", "図21", 169)]
      : [classifyRef("G", "関連構造の分類", 1)];
  addClassification(id, "ペロブスカイト", title, desc, ids, refs, {
    parent: "perovskites",
    short: title,
  });
  labelStructures(
    ids.filter((id) => id !== "perov"),
    "ペロブスカイト分類",
    title,
    refs,
  );
}
const tiltRows: [string, string, string[], string][] = [
  [
    "a⁰a⁰a⁰",
    "Pm−3m · 221",
    ["perov", "bt-cubic", "kto", "kmgf3", "cspbcl3-cubic", "cspbbr3-cubic"],
    "無回転の基準",
  ],
  ["a⁰a⁰c⁺", "P4/mbm · 127", [], "c軸まわり同位相"],
  ["a⁰b⁺b⁺", "I4/mmm · 139", [], "二軸同位相"],
  ["a⁺a⁺a⁺", "Im−3 · 204", ["ccto", "namn7o12"], "Aサイト秩序を伴う例"],
  ["a⁺b⁺c⁺", "Immm · 71", [], "三軸で異なる回転角"],
  ["a⁰a⁰c⁻", "I4/mcm · 140", ["sto-tet", "srzro3-tet"], "c軸まわり逆位相"],
  ["a⁰b⁻b⁻", "Imma · 74", [], "二軸逆位相"],
  ["a⁻a⁻a⁻", "R−3c · 167", ["lao", "bfo"], "BiFeO₃は極性変位が加わりR3c"],
  ["a⁰b⁻c⁻", "C2/m · 12", [], "二軸で異なる逆位相角"],
  ["a⁻b⁻b⁻", "C2/c · 15", [], "一軸と他の二軸で角度が異なる"],
  ["a⁻b⁻c⁻", "P−1 · 2", [], "三軸で異なる逆位相角"],
  ["a⁰b⁺c⁻", "Cmcm · 63", [], "同位相・逆位相の混合"],
  ["a⁺b⁻b⁻", "Pnma · 62", ["tilted", "gfo", "lmo"], "軸の取り替えでa⁻b⁺a⁻、a⁻a⁻c⁺と等価"],
  ["a⁺b⁻c⁻", "P2₁/m · 11", [], "逆位相二軸の角度が異なる"],
  ["a⁺a⁺c⁻", "P4₂/nmc · 137", ["camntio6-ht", "camntio6"], "293 K相は極性変位でP4₂mc"],
];
addClassification(
  "glazer",
  "ペロブスカイト",
  "Glazer · 15回転系",
  "同じ文字は回転角が等しいこと、⁰は無回転、⁺/⁻は回転軸方向に隣り合う八面体の同位相/逆位相を表します。表の空間群は回転だけの理想ABO₃。陽イオン秩序・極性変位を持つ実物質の空間群とは分けて読みます。",
  tiltRows.flatMap((row) => row[2]),
  tiltRefs,
  {
    parent: "perovskites",
    short: "Glazer回転系",
    table: {
      title: "Glazer表記と理想空間群 · 15系統を比較",
      headings: ["回転系", "回転のみの理想対称性", "読み方・実物質の注意"],
      rows: tiltRows.map(([tilt, sg, ids, note]) => ({ cells: [tilt, sg, note], ids })),
    },
  },
);
for (const [tilt, sg, ids, detail] of tiltRows) {
  labelStructures(ids, "Glazer回転系", tilt, tiltRefs, detail);
  if (ids.length)
    addClassification(
      "glazer-" + tilt.replaceAll("⁰", "0").replaceAll("⁺", "p").replaceAll("⁻", "m"),
      "Glazer回転系",
      tilt + " · " + sg,
      detail + "。理想回転系と実物質の追加変位を区別。",
      ids,
      tiltRefs,
      { parent: "glazer", short: tilt },
    );
}

const stackingRows: [string, string, string, string, string, string[]][] = [
  ["O1", "八面体候補", "1", "AB", "空層間のCoO₂骨格・模式模型", ["coo2-o1"]],
  ["O2", "八面体", "2", "ABAC", "LiO₆/CoO₆の面共有を含む・プロトタイプ", ["licoo2-o2"]],
  ["O3", "八面体", "3", "ABCABC", "層状岩塩・稜共有", ["licoo2", "nafeo2-alpha", "nacrs2"]],
  ["O4", "八面体", "4", "ABCACBAC", "O2/O3型の交替・プロトタイプ", ["licoo2-o4"]],
  ["P2", "三角柱", "2", "ABBA", "Na層とハニカム層の組合せも存在", ["nacoo2-p2", "na2co2teo6"]],
  ["P3", "三角柱", "3", "ABBCCA", "P2と同じ配位、異なる積層周期", ["nacoo2-p3"]],
  ["OP4", "八面体/三角柱", "4", "ABBACBBC", "Li/Na層交替・部分占有平均セル", ["linacoo2-op4"]],
  ["T#2", "歪んだ四面体", "2", "面内ずれを含む", "O2から(1/3,1/6,0)スラブ滑り", ["licoo2-t2"]],
  [
    "O6",
    "八面体",
    "6",
    "Carlier et al. Fig. 3a参照",
    "文献項目のみ・座標模型未収録。実測領域0.33 ≤ x < 0.42",
    [],
  ],
  [
    "OPP9",
    "八面体/三角柱/三角柱",
    "9",
    "Berthelot et al. 2011参照",
    "文献項目のみ・座標模型未収録",
    [],
  ],
];
const stackingIds = stackingRows.flatMap((row) => row[5]);
addClassification(
  "delmas",
  "層状岩塩・積層",
  "層状岩塩 · Delmas積層",
  "O/P/Tは層間の八面体/三角柱/四面体配位、数字はMX₂スラブの繰返し数。Oは酸素種を意味せず、NaCrS₂ではS面を数えます。A/B/Cは起点・文字の置換で等価。O4・OP4の列は採用座標の一周期で、同じ文字の連続は三角柱層間。文献のみの型は模型と区別します。",
  stackingIds,
  delmasRefs,
  {
    table: {
      title: "O1・O2・O3・O4・P2・P3・OP4・T#2・O6・OPP9を比較",
      headings: ["型", "層間配位", "スラブ数", "陰イオン面の順序", "出典・模型の範囲"],
      rows: stackingRows.map(([type, coord, period, sequence, note, ids]) => ({
        cells: [type, coord, period, sequence, note],
        ids,
      })),
    },
  },
);
for (const [type, coord, period, , note, ids] of stackingRows) {
  labelStructures(
    ids,
    "Delmas積層",
    type,
    delmasRefs,
    coord + "配位・" + period + "スラブ周期。" + note,
  );
}
addClassification(
  "delmas-o",
  "層状岩塩・積層",
  "O型 · 八面体層間",
  "O1・O2・O3・O4を比較。ハニカム秩序は別の分類軸です。",
  ["coo2-o1", "licoo2-o2", "licoo2", "nafeo2-alpha", "nacrs2", "licoo2-o4"],
  delmasRefs,
  { parent: "delmas", short: "O型" },
);
addClassification(
  "delmas-p",
  "層状岩塩・積層",
  "P型 · 三角柱層間",
  "P2・P3とP2ハニカムを並べ、層間配位と層内秩序を分けます。",
  ["nacoo2-p2", "nacoo2-p3", "na2co2teo6"],
  delmasRefs,
  { parent: "delmas", short: "P型" },
);
addClassification(
  "delmas-mixed",
  "層状岩塩・積層",
  "混合積層・スラブ滑り",
  "OP4の配位交替、イオン交換後のO4、O2から滑ってできるT#2を比較。",
  ["linacoo2-op4", "licoo2-o4", "licoo2-o2", "licoo2-t2"],
  delmasRefs,
  { parent: "delmas", short: "混合積層・滑り" },
);

const honeyGroups: [string, string, string[], string][] = [
  [
    "honey-lithium",
    "Li過剰層状岩塩",
    ["li2mno3", "li2sno3-beta", "li2pbo3"],
    "Li[Li₁/₃M₂/₃]O₂型。主骨格元素が六員環を作り、層内Liが環中心を占有。",
  ],
  [
    "honey-oxide",
    "2Dハニカム酸化物",
    ["li2mno3", "na2iro3", "na2co2teo6", "na3co2sbo6"],
    "Mn・Ir・Coの六員環。中心種と層間のO/P配位は独立に比較します。",
  ],
  [
    "honey-3d",
    "3D関連網 · β/γ-Li₂IrO₃",
    ["na2iro3", "li2iro3-beta", "li2iro3-gamma"],
    "平面六員環の2D層と、hyperhoneycomb/stripyhoneycombの3D三配位網を区別。",
  ],
  [
    "honey-halide",
    "ハロゲン化物 · 空孔型",
    ["biI3", "rhbr3"],
    "八面体位置の2/3を占める稜共有ハニカム。酸化物の環中心の別カチオンは、この場合は空孔。",
  ],
];
addClassification(
  "honeycomb",
  "ハニカム",
  "ハニカム · 層内秩序と3D関連網",
  "六員環を構成する原子、環の中心、層間配位、2D/3D連結性を分けて分類します。Na₅ReO₆の多数Na側の網と少数Re側の三角格子も区別できます。",
  [...honeyGroups.flatMap((row) => row[2]), "na5reo6"],
  honeyRefs,
  {
    table: {
      title: "ハニカムを作る部分格子",
      headings: ["代表構造", "六員環", "環の中心・連結性"],
      rows: [
        { cells: ["Li₂MnO₃", "Mn", "Li・2D"], ids: ["li2mno3"] },
        { cells: ["Na₂IrO₃", "Ir", "Na・2D"], ids: ["na2iro3"] },
        {
          cells: ["Na₂Co₂TeO₆ / Na₃Co₂SbO₆", "Co", "Te / Sb・2D"],
          ids: ["na2co2teo6", "na3co2sbo6"],
        },
        { cells: ["BiI₃ / RhBr₃", "Bi / Rh", "空孔・2D"], ids: ["biI3", "rhbr3"] },
        { cells: ["Na₅ReO₆", "層内Na", "Reは三角格子・2D"], ids: ["na5reo6"] },
        {
          cells: ["β/γ-Li₂IrO₃", "Irの3D三配位網", "平面ハニカム層とは異なる"],
          ids: ["li2iro3-beta", "li2iro3-gamma"],
        },
      ],
    },
  },
);
for (const [id, title, ids, desc] of honeyGroups) {
  addClassification(id, "ハニカム", title, desc, ids, honeyRefs, {
    parent: "honeycomb",
    short: title,
  });
  labelStructures(ids, "ハニカム分類", title, honeyRefs);
}

const pyroGroups: [string, string, string[], string][] = [
  [
    "pyro-alpha",
    "標準型 α · A₂B₂O₆O′",
    ["pyrochlore", "y2ti2o7", "la2zr2o7", "cd2re2o7"],
    "A:8配位、B:6配位。A³⁺/B⁴⁺のチタン酸塩・ジルコン酸塩と、A²⁺/B⁵⁺のレニウム酸塩を比較。酸素48fとO′を区別。",
  ],
  [
    "pyro-beta",
    "β型 · AOs₂O₆",
    ["kos2o6", "rbos2o6", "csos2o6"],
    "標準型と同じOs網を持ちながら、アルカリ金属は異なるケージ位置を占め、O′がありません。Csは模式模型、K/Rbは回折座標。",
  ],
  [
    "pyro-fluorite",
    "蛍石関連 · 秩序と欠陥",
    ["fluorite", "pyrochlore", "defectfluorite", "weberite", "bixbyite", "la2zr2o7"],
    "A/B秩序と酸素空孔秩序から比較。欠陥蛍石・weberite・bixbyiteは関連する別構造で、同じパイロクロア相ではありません。",
  ],
  [
    "pyro-sublattice",
    "部分格子 · スピネル / Laves / hyperkagome",
    ["pyrochlore", "spinel", "inverse", "laves-c15", "litio2-ordered", "mno2-spinel", "na4ir3o8"],
    "スピネルBサイト・C15の小原子側・規則LiTiO₂に現れるパイロクロア網を比較。Na₄Ir₃O₈のhyperkagomeはその1/4欠損網で、結晶全体の構造型とは区別。",
  ],
];
addClassification(
  "pyrochlores",
  "パイロクロア",
  "パイロクロア · 組成・ケージ・部分格子",
  "α-A₂B₂O₆O′、β-AOs₂O₆、蛍石との秩序関係、他構造中のパイロクロア部分格子を区分します。",
  pyroGroups.flatMap((row) => row[2]),
  pyroRefs,
  {
    table: {
      title: "化学式・配位・連結性を比較",
      headings: ["分類", "配位・占有", "見るべき違い"],
      rows: [
        {
          cells: ["標準型 α", "A:8 / B:6、O₆O′", "A³⁺₂B⁴⁺₂O₇ / A²⁺₂B⁵⁺₂O₇"],
          ids: ["y2ti2o7", "la2zr2o7", "cd2re2o7"],
        },
        {
          cells: ["β型", "アルカリ金属ケージ / Os:6", "標準型のA位置とは異なる・O′なし"],
          ids: ["kos2o6", "rbos2o6", "csos2o6"],
        },
        {
          cells: ["欠陥蛍石", "カチオンと酸素空孔の平均無秩序", "パイロクロアの秩序相と対比"],
          ids: ["defectfluorite", "pyrochlore"],
        },
        {
          cells: [
            "他構造中の部分格子",
            "頂点共有四面体の原子網",
            "網の一致と結晶全体の構造型を区別",
          ],
          ids: ["spinel", "laves-c15", "litio2-ordered"],
        },
        {
          cells: ["hyperkagome", "パイロクロア網の1/4欠損", "三次元の頂点共有三角形"],
          ids: ["na4ir3o8"],
        },
      ],
    },
  },
);
for (const [id, title, ids, desc] of pyroGroups) {
  addClassification(id, "パイロクロア", title, desc, ids, pyroRefs, {
    parent: "pyrochlores",
    short: title,
  });
  labelStructures(ids, "パイロクロア分類", title, pyroRefs);
}

const galassoChapters: [string, string, number, string[], string][] = [
  [
    "galasso-2",
    "第2章 · 単体・基本充填",
    26,
    ["simple-cubic", "fcc", "hcp", "bcc"],
    "単純立方・面心立方・六方最密・体心立方から派生を読む。",
  ],
  [
    "galasso-3",
    "第3章 · CsClと関連構造",
    39,
    ["simple-cubic", "b2", "cuprite", "rutile", "trirutile", "cab6", "bif3"],
    "Table 3.0：単純立方→CsCl・Cu₂O・rutile・CaB₆、CsCl→BiF₃、rutile→trirutile。",
  ],
  [
    "galasso-4",
    "第4章 · NaClと関連構造",
    59,
    ["nacl", "pyrite", "cac2", "heusler"],
    "Table 4.0：NaCl→FeS₂・CaC₂・Cu₂AlMn。二量体化・歪み・追加位置を区別。",
  ],
  [
    "galasso-5",
    "第5章 · ZnS・蛍石と関連構造",
    82,
    [
      "diamond",
      "zns",
      "cristobalite-b",
      "fluorite",
      "half",
      "k2ptcl6",
      "bixbyite",
      "pyrochlore",
      "scheelite",
    ],
    "Table 5.0：diamond→ZnS、閃亜鉛鉱からの位置追加、蛍石からMgAgAs・K₂PtCl₆・C型希土類・pyrochlore・scheelite。",
  ],
  [
    "galasso-6",
    "第6章 · NiAsと関連構造",
    120,
    [
      "hcp",
      "wc",
      "wurtzite",
      "mos2-2h",
      "cdi2",
      "na3as",
      "alb2",
      "la2o3-a",
      "nias",
      "ni2in",
      "covellite",
      "laves-c14",
    ],
    "Table 6.0：六方充填からWC・wurtzite・MoS₂・CdI₂、NiAsとNi₂In、CuS・MgZn₂へ。",
  ],
  [
    "galasso-7",
    "第7章 · ペロブスカイトと関連構造",
    162,
    ["fcc", "simple-cubic", "pbo", "l12", "reo3", "perov", "rp1", "k2nif4", "rp2", "bi4ti3o12"],
    "Table 7.0：fccに基づくPbO・Cu₃Au、単純立方のReO₃からペロブスカイトへ。K₂NiF₄・Sr₃Ti₂O₇・Bi₄Ti₃O₁₂へ層状ブロックを展開。",
  ],
  [
    "galasso-8",
    "第8章 · スピネルと関連構造",
    211,
    ["laves-c15", "spinel", "inverse", "magnetoplumbite"],
    "Table 8.0：Cu₂Mg型の陽イオン配置→spinel→BaFe₁₂O₁₉。組成だけでなくカチオン副格子と積層ブロックから分類。",
  ],
  [
    "galasso-9",
    "第9章 · コランダムとイルメナイト",
    235,
    ["corundum", "ilmenite"],
    "hcp酸素の八面体位置の占有と陽イオン秩序。",
  ],
  [
    "galasso-10",
    "第10章 · β-Wとガーネット",
    240,
    ["bcc", "nb3sn", "cr3si", "yag", "yig"],
    "Table 10.0：bcc→β-W(A15)→garnetの記述。",
  ],
  [
    "galasso-11",
    "第11章 · グラファイトと関連構造",
    252,
    ["graphite", "hbn", "al2cu"],
    "Table 11.0：graphite・BN・CuAl₂。CuAl₂も原著どおり収録し、金属間化合物の原子面と共有結合性六員環層を区別。",
  ],
];
const galassoRefs = [classifyRef("GI", "第2–11章・各章のフロー表", 26)];
addClassification(
  "galasso",
  "Galasso（1970）",
  "Galasso · 第2–11章の構造分類",
  "F. S. Galasso, Structure and Properties of Inorganic Solids (Pergamon Press, 1970) の章とフロー表に沿って、ファミリーをまたいで構造を整理。書籍の構造上の対応と、現代の群–部分群・実際の相転移は区別します。",
  galassoChapters.flatMap((row) => row[3]),
  galassoRefs,
);
for (const [id, title, page, ids, desc] of galassoChapters) {
  const refs = [classifyRef("GI", title, page)];
  addClassification(id, "Galasso（1970）", title, desc, ids, refs, {
    parent: "galasso",
    short: title,
  });
  labelStructures(ids, "Galassoの分類", title, refs);
}
