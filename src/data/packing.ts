import type { Ref } from "../types.ts";

/** An editorial reading hierarchy, not a new crystallographic database. */
export type PackingRole = "packing" | "structure" | "material" | "topic";
export type PlacementKind = "derive" | "example" | "topic";
export interface Concept {
  id: string;
  title: string;
  description: string;
  refs: Ref[];
}
export interface Placement {
  parent: string;
  child: string;
  kind: PlacementKind;
  label: string;
  /** Existing relation IDs supply provenance, never the rank automatically. */
  evidence?: string[];
  refs?: Ref[];
}
const ref = (s: string, p: number, sec: string): Ref => ({ s, p, sec });
const W = (p: number, sec: string) => ref("W", p, sec);
const M = (p: number, sec: string) => ref("M06", p, sec);
const K = (p: number, sec: string) => ref("K", p, sec);

export const PACKING_ROOTS = ["bcc", "fcc", "hcp", "@aux"] as const;
export const ROOT_LABELS: Record<string, string> = {
  bcc: "bcc · 体心立方",
  fcc: "ccp / fcc · ABC積層",
  hcp: "hcp · AB積層",
  "@aux": "補助骨格・未整理",
};
export const ROOT_NOTES: Record<string, string> = {
  bcc: "cIの格子点に原子を置く基本配列。B2は色分けによりP格子になるため、子構造までbcc格子とは限りません。",
  fcc: "cFの格子点に原子を置くccp配列。空隙占有・混合充填・積層変更を辿ります。根は導出の出発点であり、全ての子の現在の充填を意味しません。",
  hcp: "hcpはブラベー格子ではなく、六方単純格子hP＋2原子の基底による充填構造です。AB積層と空隙占有を出発点とします。",
  "@aux": "単純立方・単純六方や別の骨格を保留せず表示します。資料で主系統を裏付けられない構造は『親経路未検証』に残し、強引に三系統へ接続しません。",
};

export const CONCEPTS: Concept[] = [];
export const PLACEMENTS: Placement[] = [];
export const ROLES: Record<string, PackingRole> = {
  bcc: "packing", fcc: "packing", hcp: "packing", "simple-cubic": "packing", "simple-hex": "packing",
};
function concept(id: string, title: string, description: string, refs: Ref[]) {
  CONCEPTS.push({ id, title, description, refs });
  ROLES[id] = "topic";
}
function attach(parent: string, child: string, kind: PlacementKind, label: string, evidence: string[] = [], refs: Ref[] = []) {
  PLACEMENTS.push({ parent, child, kind, label, evidence, refs });
}
function branch(id: string, parent: string, title: string, description: string, refs: Ref[]) {
  concept(id, title, description, refs);
  attach(parent, id, "topic", "整理の枝", [], refs);
}
function derive(parent: string, child: string, label: string, ...evidence: string[]) {
  attach(parent, child, "derive", label, evidence);
}
function examples(parent: string, ids: string[], label = "この構造の具体例") {
  for (const child of ids) {
    attach(parent, child, "example", label);
    ROLES[child] = "material";
  }
}

concept("@aux", ROOT_LABELS["@aux"], ROOT_NOTES["@aux"], [M(154, "§14.3")]);
branch("@unassigned", "@aux", "親経路未検証", "資料に構造は収録されていますが、この版では基本充填からの主経路を確定していません。未収録・無関係という意味ではありません。", []);
attach("@aux", "simple-cubic", "topic", "別の基本配列");
attach("@aux", "simple-hex", "topic", "別の基本配列");

// bcc: distinguish colouring, supercell occupation, and geometric block substitution.
derive("bcc", "b2", "角と体心を二元素で色分け", "e24");
branch("@fourfcc", "b2", "拡大セルの4つのfcc副格子", "B2の2×2×2セルを4つのfcc副格子に分け、元素と空孔の割当てを変える記述。空隙占有によるccpの説明とは別の見方です。", [M(160, "§15.3"), M(161, "Fig.15.3"), K(160, "図7")]);
for (const [child, label, evidence] of [
  ["heusler", "2:1:1の規則占有", "e25"], ["d03", "3:1の規則占有", "e26"],
  ["natl", "二つのダイヤモンド網", "e27"], ["limgsnpt", "4元素の規則占有", "okamoto-fourfcc-fcc-limgsnpt"],
  ["li2agsb", "2:1:1の別配列", "okamoto-fourfcc-fcc-li2agsb"],
]) derive("@fourfcc", child, label, evidence);
derive("heusler", "half", "一つの副格子を空にする", "e28");
examples("d03", ["bif3"]);
derive("bcc", "bct", "正方晶へ歪ませる", "e30");
derive("bct", "mosi2", "超構造と規則占有", "e31");
for (const [child, label, evidence] of [
  ["rutile", "TiO₆ブロックへの置換（幾何記述）", "okamoto-blocks-b2-rutile"],
  ["cab6", "サイトをB₆八面体に置換", "okamoto-blocks-b2-cab6"],
  ["lafe4p12", "P₄正方形の配置", "okamoto-blocks-b2-lafe4p12"],
]) derive("b2", child, label, evidence);

// ccp: the occupied host is stated in the card, never assumed to be the anion.
for (const [child, label, evidence] of [
  ["nacl", "八面体孔 O:1", "e1"], ["zns", "四面体孔 T:1/2 の選択配列", "e2"],
  ["antifluorite", "アニオンccp＋カチオン T:1", "e3"], ["fluorite", "カチオンccp＋アニオン T:1", "e4"],
  ["spinel", "T:1/8・O:1/2 の規則占有", "e5"], ["l12", "3:1の規則化", "e6"],
  ["l10", "1:1の層状規則化", "e7"], ["diamond", "同一元素の二つのfcc配列", "okamoto-lattices-fcc-diamond"],
  ["al3ti", "3:1の別の規則化周期", "okamoto-coloring-fcc-al3ti"],
]) derive("fcc", child, label, evidence);
for (const [child, evidence] of [["nbO", "e9"], ["anatase", "e60"], ["cdcl2", "e61"], ["pyrite", "okamoto-blocks-nacl-pyrite"], ["cac2", "okamoto-blocks-nacl-cac2"], ["litio2-ordered", "okamoto-rocksalt-nacl-litio2-ordered"]]) derive("nacl", child, "占有・規則化・置換", evidence);
derive("spinel", "inverse", "カチオンのサイト分配", "e10");
derive("litio2-ordered", "mno2-spinel", "一方のカチオン網を空にする", "okamoto-rocksalt-litio2-ordered-mno2-spinel");
derive("spinel", "na4ir3o8", "Bサイトの3:1規則化", "okamoto-iridates-spinel-na4ir3o8");
derive("spinel", "pentlandite", "四面体・八面体の占有配置", "related-pentlandite");
derive("spinel", "magnetoplumbite", "スピネル関連ブロックの積層", "related-magnetoplumbite");
derive("nacl", "gese", "岩塩配置の歪み", "related-gese");
branch("@o3", "nacl", "O3型の層状カチオン規則化", "ccpのアニオン配列中でカチオンの層を並べ分ける。具体物質同士を親子として連鎖させません。", [K(163, "図12"), { s: "DL", sec: "Delmasの層状構造分類" }]);
examples("@o3", ["nacrs2", "licoo2", "nafeo2-alpha"]);
branch("@layer-order", "@o3", "層内の規則化・部分網", "層間秩序に加え、層内の異種カチオン配置を指定する枝。ハニカム網と結晶全体の構造型を区別します。", [K(164, "図13–14"), { s: "CH12", sec: "Table I" }, { s: "VC07", sec: "Tables 1–2" }]);
examples("@layer-order", ["na5reo6", "li2sno3-beta", "li2pbo3", "li2mno3", "na2iro3", "na3co2sbo6"], "層内秩序の具体例");
derive("@layer-order", "rhbr3", "カチオン除去と積層変更", "okamoto-rocksalt-li2sno3-beta-rhbr3");
branch("@delmas", "@o3", "スラブ滑り・O/P/T積層系列", "O3を比較の入口に、層間配位・スラブ周期・組成の異なる構造を並列に表示します。この枝は全てがccpを保つという主張ではありません。", [{ s: "DL", sec: "配位・積層周期" }, { s: "CA03", sec: "Figs.2–3" }]);
examples("@delmas", ["coo2-o1", "licoo2-o2", "licoo2-o4", "linacoo2-op4", "nacoo2-p2", "nacoo2-p3", "licoo2-t2", "na2co2teo6"], "積層・配位を指定した例");
for (const [child, evidence] of [["li2iro3-beta", "okamoto-iridates-nacl-li2iro3-beta"], ["li2iro3-gamma", "okamoto-iridates-nacl-li2iro3-gamma"]]) derive("nacl", child, "三次元カチオン規則網", evidence);

// Fluorite: do not use the reverse averaging arrow to rank disordered below ordered.
derive("fluorite", "defectfluorite", "アニオン欠損を平均占有で記述", "e36", "e37");
derive("defectfluorite", "pyrochlore", "A/B・空孔の秩序化＋原子変位", "e36", "e37");
examples("pyrochlore", ["y2ti2o7", "la2zr2o7", "cd2re2o7"]);
branch("@beta-pyro", "pyrochlore", "β-パイロクロア AOs₂O₆", "標準型のA₄Oブロックをアルカリ金属のケージ位置へ読み替える関連系列。O′の除去だけではなく、Aサイトの位置が異なります。", [K(170, "図22")]);
examples("@beta-pyro", ["csos2o6", "kos2o6", "rbos2o6"]);
for (const [child, evidence] of [["bixbyite", "e38"], ["weberite", "e39"], ["cuprite", "e40"], ["pbo", "e42"], ["pts", "e43"], ["k2ptcl6", "related-k2ptcl6"], ["scheelite", "related-scheelite"]]) derive("fluorite", child, "欠損・占有配列・ブロック配置", evidence);
branch("@zirconia", "fluorite", "ZrO₂の蛍石関連多形", "立方・正方・単斜相を具体的な相として並列に収録。相転移の向きや条件は元の関係カードを参照します。", [W(85, "§1.17.12")]);
examples("@zirconia", ["zro2-c", "zro2-t", "zro2-m"], "ZrO₂の具体的な相");
derive("pbo", "biocl", "異種層を挿入", "related-biocl");
derive("biocl", "lacuos", "酸化物層と硫化物層", "related-lacuos");

// Mixed ccp host: A and X jointly form the packing, not X alone.
branch("@mixed-ccp", "fcc", "A/Xの1:3混合ccp配列", "AとXを合わせてccpとみなす。Xだけの最密充填ではない。BをX₆八面体孔（全O孔の1/4）へ配置する。", [W(61, "§1.17.7"), W(62, "Fig.1.41"), K(162, "図10")]);
derive("@mixed-ccp", "perov", "X₆で囲まれたO孔をBが占有", "okamoto-coloring-l12-perov");
examples("perov", ["bt-cubic", "kto", "kmgf3", "knif3", "kfef3", "rbcaf3", "cspbcl3-cubic", "cspbbr3-cubic"], "立方ペロブスカイトの例");
branch("@perov-distort", "perov", "八面体回転・極性・結合長秩序", "回転と極性は独立した記述軸。異なる化合物同士を歪みの親子として縦に連結しません。", [W(64, "§1.17.7.2–3"), { s: "HS", sec: "Table 1" }]);
derive("@perov-distort", "tilted", "GdFeO₃型の回転配置", "e45");
examples("tilted", ["gfo", "lmo", "cspbbr3-ortho"], "回転配置を持つ例（追加歪みは各カード）");
for (const [id, title, ids, description] of [
  ["@polar-tet", "正方晶の極性変位", ["batio3", "kno-tet", "pto"], "正方晶の極性変位を比較する。格子定数や変位量は物質・条件ごとに異なる。"],
  ["@polar-other", "斜方・菱面体の極性変位", ["bt-ortho", "bt-rhombo", "kno-ortho", "bfo"], "極性方向と回転を指定した具体相。ここでは各空間群を同じ構造型と同一視しない。"],
  ["@tilt-other", "その他の回転配置", ["sto-tet", "srzro3-tet", "lao"], "回転系を持つ各相。Glazer表記と極性などの付加的秩序は別の情報。"],
  ["@antipolar", "反平行変位", ["pzo", "nno-afe"], "反強誘電相を、立方母構造からの別の変位パターンとして比較する。"],
  ["@bond-order", "結合長・呼吸歪み", ["kcuf3", "kcrf3", "bbio3"], "同一元素であっても結合長秩序を区別する。単純な異元素のサイト規則化とは別の記述。"],
] as const) {
  branch(id, "@perov-distort", title, description, [W(64, "§1.17.7"), { s: "G", sec: "各具体相の出典は構造カードを参照" }]);
  examples(id, [...ids], "この変位パターンの具体相");
}
branch("@perov-order", "perov", "サイト規則化", "AサイトとBサイト、比率、配列を指定する。1:1から1:2への親子関係ではなく、共通母構造から分岐する。", [W(71, "§1.17.7.7")]);
derive("@perov-order", "doubleperov", "Bサイト1:1・岩塩型配列", "e47");
examples("doubleperov", ["bamgwo6", "srniwo6", "srfemoo6", "camgwo6", "elpasolite", "cryolite", "k2naalf6"], "1:1秩序の具体相（回転・歪みは詳細）");
branch("@b12", "@perov-order", "Bサイト1:2・層状配列", "A₃BB′₂X₉の3層周期。Bサイト1:1型の下位分類ではなく、別の規則化。", [W(73, "§1.17.7.7"), { s: "G", p: 14, sec: "Figs.2.6–2.7" }]);
examples("@b12", ["bast", "bamt", "bamnb"]);
branch("@a13", "@perov-order", "Aサイト1:3 · AA′₃B₄O₁₂", "Aサイトの秩序と大きな八面体回転を組み合わせる系列。", [W(65, "§1.17.7.4"), K(169, "図21")]);
examples("@a13", ["ccto", "namn7o12"]);
branch("@a11", "@perov-order", "Aサイト1:1・柱状配列", "Ca/Mnの柱状秩序を保った高温・低温相を、同じ配列の具体相として並べる。", [{ s: "CM14", sec: "293 K CIF / 800 K Table S9" }]);
examples("@a11", ["camntio6-ht", "camntio6"]);
branch("@perov-vacancies", "perov", "サイト欠損・占有変更", "Aサイト欠損とアニオン欠損は区別する。", [W(70, "§1.17.7.5"), W(76, "§1.17.8")]);
derive("@perov-vacancies", "reo3", "Aサイトを空にする", "e44");
examples("reo3", ["scf3"]);
derive("reo3", "rhf3", "頂点共有八面体を協調回転", "e54");
examples("rhf3", ["alf3-alpha"]);
derive("reo3", "cu3n", "反型の配置対応", "related-cu3n");
derive("reo3", "tinb2o7", "シアー境界を持つブロック", "breadth-reo3-tinb2o7");
derive("@perov-vacancies", "brown", "酸素欠損の秩序化", "e48");
examples("brown", ["sr2fe2o5"]);
branch("@infinite-layer", "@perov-vacancies", "無限層型", "アニオン数と配位を変更した関連系列。", [W(70, "§1.17.7.5")]);
examples("@infinite-layer", ["srfeo2"]);
derive("perov", "antiPerov", "サイトの役割を反転", "e52");
examples("antiPerov", ["fe4n", "mn3alc"]);
examples("perov", ["srtao2n"], "混合アニオン・歪みを持つ例");
branch("@blocks", "perov", "層状ブロックの積層", "ペロブスカイトブロックを何で区切るかを指定し、その後で厚さnを選ぶ。", [W(91, "§1.17.14")]);
branch("@rp", "@blocks", "Ruddlesden–Popper系列", "Aₙ₊₁BₙX₃ₙ₊₁。n=1, 2, 3は並列の系列メンバーであり、上下の詳しさではありません。", [W(92, "§1.17.14"), K(171, "図23–24")]);
attach("@rp", "rp1", "derive", "ブロック厚 n=1", ["e49"]);
attach("@rp", "rp2", "derive", "ブロック厚 n=2", ["e51"]);
branch("@rp3", "@rp", "RP · n=3", "3層厚のペロブスカイトブロック。", [W(92, "§1.17.14")]);
examples("@rp3", ["rp3"]);
examples("rp1", ["k2nif4", "sr2iro4", "sr2cuo2cl2"], "n=1関連の具体物質（回転・組成を参照）");
branch("@aurivillius", "@blocks", "Aurivillius系列", "[Bi₂O₂]層で区切る系列。RPのn=3構造を親にしません。", [W(93, "Fig.1.50"), { s: "G", sec: "各層状構造の出典は構造カードを参照" }]);
examples("@aurivillius", ["bi4ti3o12", "srbi2ta2o9", "bi2wo6", "bi2moo6"], "nと組成を指定したメンバー");
branch("@dj", "@blocks", "Dion–Jacobson系列", "層間の組成・配置をRPと区別する。", [W(91, "§1.17.14")]);
examples("@dj", ["rbca2nb3o10"]);
branch("@110blocks", "@blocks", "〈110〉型の層状ブロック", "切り分ける方位の異なる層状系列。", [{ s: "G", sec: "La₂Ti₂O₇の出典は構造カードを参照" }]);
examples("@110blocks", ["la2ti2o7", "la2ti2o7-ht"], "層状構造の具体相");
derive("nacl", "cairo3", "規則的双晶によるブロック連結", "okamoto-iridates-nacl-cairo3");

// hcp and changed stacking sequences. A mixed polytype is not labelled an hcp Bravais lattice.
for (const [child, label, evidence] of [
  ["nias", "八面体孔 O:1", "e12"], ["wurtzite", "四面体孔 T:1/2", "e13"], ["olivine", "T:1/8・O:1/2", "e14"],
  ["ni3sn", "3:1の規則配列", "okamoto-coloring-hcp-ni3sn"], ["ticu3", "3:1の別配列", "okamoto-coloring-hcp-ticu3"],
  ["lonsdaleite", "同一元素の四面体網", "okamoto-lattices-hcp-lonsdaleite"],
]) derive("hcp", child, label, evidence);
for (const [child, evidence] of [["cdi2", "e15"], ["corundum", "e17"], ["mnp", "e20"], ["ni2in", "e65"]]) derive("nias", child, "占有・空孔・歪み", evidence);
derive("cdi2", "biI3", "占有層内の1/3を空にする", "e16");
derive("corundum", "ilmenite", "カチオンの層状規則化", "e18");
derive("corundum", "linbo3", "別の規則化と極性変位", "e19");
examples("cdi2", ["tis2"]);
branch("@hcp-ao3", "hcp", "AO₃混合層のAB積層", "AとOの混合層をhcp型に積む。全て面共有の2Hと、h/c混合積層は区別する。", [W(75, "§1.17.7.11")]);
derive("@hcp-ao3", "hexperov", "Bを八面体位置へ · 2H", "e53");
examples("hexperov", ["csnicl3"]);
branch("@hc-stack", "hexperov", "h/c混合積層の系列", "2Hを入口として4H・6H・9Rなどを比較する整理の枝。全員がhcp充填という意味ではありません。", [W(75, "§1.17.7.11"), W(76, "積層系列")]);
examples("@hc-stack", ["bt-6h", "baru-9r", "bamn-4h", "srmno3-4h", "cscdcl3"], "積層周期を指定した具体相");
branch("@tetra-polytypes", "wurtzite", "四面体網の積層系列", "同じ四面体配位を保つが、4Hや6Hは単純なAB積層ではない。", [M(206, "§17.5")]);
examples("@tetra-polytypes", ["sic-4h", "sic-6h"]);
branch("@zns-order", "zns", "多元素の四面体サイト規則化", "Cu/Fe/Zn/Snなどの配列を指定する。同じ材料に順に置換して合成できるという主張ではない。", [M(123, "§12.4")]);
for (const [child, evidence] of [["chalcopyrite", "related-chalcopyrite"], ["stannite", "related-stannite"], ["kesterite", "related-kesterite"], ["cu2sns3", "related-cu2sns3"]]) derive("@zns-order", child, "カチオン配列を指定", evidence);
derive("antifluorite", "sulvanite", "四面体サイトの部分占有", "related-sulvanite");
branch("@cu-s", "hcp", "硫黄充填とCuの占有配置", "高温カルコサイトのhcp関連配列を入口に、占有秩序と別の積層を比較する。低温相やCuSへ同じ平均対称性を割り当てない。", [{ s: "GI", sec: "硫化銅の各相の出典は構造カードを参照" }]);
examples("@cu-s", ["chalcocite-high", "chalcocite-low", "covellite"], "占有・相・積層を指定した例");

// Rutile's primary route is Okamoto's geometric B2-block description, not hcp subgroup reduction.
derive("rutile", "cacl2", "斜方晶の協調変位", "e56");
derive("cacl2", "marcasite", "変位とアニオン対", "e57");
derive("rutile", "trirutile", "c軸3倍・カチオン1:2規則化", "e58");
examples("rutile", ["pyrolusite"], "同型の具体物質 · β-MnO₂");
branch("@magneli", "rutile", "ルチルブロックのMagnéli系列", "シアー境界の周期を指定する。n=4とn=5は同じ系列の並列メンバー。", [W(143, "§2.4.1")]);
examples("@magneli", ["ti4o7", "ti5o9"]);
branch("@tunnels", "rutile", "八面体鎖の連結とトンネル", "単鎖と複鎖の連結を比較する枝であり、群–部分群の階層ではない。", [K(177, "図29"), { s: "AW", p: 458, sec: "Fig.12.12" }]);
for (const [child, evidence] of [["ramsdellite", "breadth-pyrolusite-ramsdellite"], ["hollandite-type", "okamoto-iridates-rutile-hollandite-type"]]) derive("@tunnels", child, "鎖の連結を変更", evidence);

// Auxiliary families have an explicit entry, not an invented connection to bcc/ccp/hcp.
attach("@aux", "baal4", "topic", "別の母構造 · bccへの主経路は未設定");
for (const [child, evidence] of [["thcr2si2", "e66"], ["cabe2ge2", "e67"], ["banisn3", "related-banisn3"]]) derive("baal4", child, "サイトの規則化", evidence);
attach("@aux", "cemg2si2", "topic", "別の母構造");
derive("cemg2si2", "srau3ge", "規則超構造", "related-srau3ge");
derive("cemg2si2", "laru2al2b", "位置の充填", "related-laru2al2b");
branch("@laves", "cuprite", "C15を入口としたLaves系列", "Cu₂Oから一方の貫入網を取り出すC15の説明を入口に、C14・C36の積層関係を比較する。", [K(169, "図20"), M(162, "§15.5")]);
for (const child of ["laves-c15", "laves-c14", "laves-c36"]) attach("@laves", child, "derive", "積層を指定", ["okamoto-blocks-cuprite-laves-c15", "related-laves-c14", "related-laves-c36"]);
derive("simple-hex", "wc", "二つの単純六方配列", "okamoto-lattices-simple-hex-wc");
branch("@tetra-frameworks", "@aux", "開いた四面体骨格", "充填への確かな主経路をこの版で設定していないネットワーク。四面体配位が共通というだけでccpの子とはしない。", [M(124, "§12.5")]);
attach("@tetra-frameworks", "cristobalite-b", "topic", "SiO₂骨格の参照相");
attach("@tetra-frameworks", "cristobalite-a", "topic", "SiO₂骨格の参照相");
attach("@tetra-frameworks", "si3n4-alpha", "topic", "窒化物の別の網");
attach("@tetra-frameworks", "si3n4-beta", "topic", "窒化物の別の網");
branch("@garnet", "@aux", "ガーネット骨格", "四面体・八面体・8配位サイトからなる骨格。スピネルとの多面体比較を主系統の派生にすり替えない。", [W(90, "§1.17.13")]);
examples("@garnet", ["yag", "yig"]);
attach("@aux", "graphite", "topic", "六角網の積層");
derive("graphite", "hbn", "網を二元素で色分け", "related-hbn");
branch("@a15", "@aux", "A15型の副格子と直交鎖", "体心副格子と鎖を含む構造。副格子がbccであることと、全体がbcc由来という主張は区別する。", [{ s: "GI", p: 240, sec: "§10.1" }]);
examples("@a15", ["nb3sn", "cr3si"]);
branch("@mx2-slabs", "cdi2", "MX₂層の配位・積層を変更", "CdI₂型の八面体配位層を比較の入口に、三角柱配位・歪み・積層周期の異なるTMDを並列に読む。単純hcp充填を全例へ割り当てない。", [{ s: "BS", sec: "層状カルコゲン化物（各構造カードの出典を参照）" }]);
examples("@mx2-slabs", ["mos2-2h", "mos2-3r", "mote2-2h", "mote2-1t", "wte2-td"], "層配位・積層を指定した具体相");
attach("fluorite", "la2o3-a", "derive", "アニオン欠損・7配位のA型", [], [W(88, "§1.17.12・希土類酸化物")]);
