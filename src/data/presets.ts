import type { Kind, KindId, LabPreset, OccPreset, Route } from "../types.ts";
/** Display categories, learning routes, and idealized-model presets. */
export const KINDS: Record<KindId, Kind> = {
  symmetry: {
    name: "群–部分群",
    color: "#6de0bf",
    dash: "",
    meaning: "文献で確認した対称性低下。指数・位置対応を詳細に表示。",
  },
  occupation: {
    name: "空隙占有・空孔",
    color: "#79bed8",
    dash: "7 4",
    meaning: "T/O孔などの占有、空孔導入と配列の変更。",
  },
  ordering: {
    name: "原子の規則化",
    color: "#e7b77a",
    dash: "7 4",
    meaning: "異なる元素や原子種を、等価だった位置へ規則配置。",
  },
  distortion: {
    name: "歪み・多面体回転",
    color: "#b7a2e9",
    dash: "7 4",
    meaning: "原子変位、軸比の変化、配位多面体の協調的な回転。",
  },
  stacking: {
    name: "積層・ブロック",
    color: "#e494bb",
    dash: "7 4",
    meaning: "層の積み方や、構造ブロックの組み合わせの違い。",
  },
  analogy: {
    name: "比較・別の見方",
    color: "#93a6b8",
    dash: "2 5",
    meaning: "共通する特徴の比較。群–部分群や相転移を主張しない。",
  },
  antitype: {
    name: "反型（役割交換）",
    color: "#c7ca80",
    dash: "3 5",
    meaning: "同じ位置配置を、カチオン・アニオンの役割を替えて読む。",
  },
};

export const ROUTES: Route[] = [
  {
    title: "01　L2₁はどこから来る？",
    desc: "bccの色分けから、四つのfcc副格子と空孔へ。",
    ids: ["bcc", "b2", "heusler", "half"],
  },
  {
    title: "02　同じ占有率でも違う構造",
    desc: "スピネルとオリビン。T=1/8、O=1/2でも骨格は違う。",
    ids: ["fcc", "spinel", "olivine", "hcp"],
  },
  {
    title: "03　蛍石から空孔をつくる",
    desc: "反型・空孔・規則化の操作を分けて見る。",
    ids: ["fluorite", "antifluorite", "pyrochlore", "bixbyite"],
  },
  {
    title: "04　Bärnighausenの３つの入口",
    desc: "色分け、サイト対称性の低下、並進周期の変化。",
    ids: ["diamond", "zns", "rutile", "cacl2", "trirutile"],
  },
  {
    title: "05　八面体孔から層をつくる",
    desc: "NiAsから空層をつくり、ハニカム層や規則化へ。",
    ids: ["nias", "cdi2", "biI3", "corundum", "ilmenite"],
  },
  {
    title: "06　ペロブスカイトの操作",
    desc: "Aサイト除去、チルト、規則化、構造ブロックの積層。",
    ids: ["perov", "reo3", "tilted", "doubleperov", "rp1"],
  },
  {
    title: "07　BaTiO₃ の4つの多形",
    desc: "立方晶から、極性変位の方向が違う正方・斜方・菱面体晶へ。",
    ids: ["bt-cubic", "batio3", "bt-ortho", "bt-rhombo"],
  },
  {
    title: "08　Bサイトを1:1と1:2に並べる",
    desc: "Galasso の複合ペロブスカイトを、B層の繰り返しで比較する。",
    ids: ["doubleperov", "bamgwo6", "bast", "bamt", "elpasolite"],
  },
  {
    title: "09　同じ三層でも異なる層間",
    desc: "RP、Dion–Jacobson、Aurivilliusで三層ブロックの境界を比べる。",
    ids: ["rp1", "rp2", "rp3", "rbca2nb3o10", "bi4ti3o12"],
  },
  {
    title: "10　硫化物の層とCuの占有",
    desc: "高温・低温カルコサイトとコベリンで、Cuの部分占有と層の積み方を見る。",
    ids: ["chalcocite-high", "chalcocite-low", "covellite"],
  },
  {
    title: "11　蛍石のサイトを置き換える",
    desc: "Galasso の配置比較から、孤立八面体・規則化・酸素変位を見分ける。",
    ids: ["fluorite", "k2ptcl6", "scheelite", "zro2-c", "zro2-t", "zro2-m"],
  },
  {
    title: "12　MnO₂のトンネル断面",
    desc: "ルチル型の単鎖から、複鎖がつくる1×2・2×2トンネルへ。",
    ids: ["rutile", "pyrolusite", "ramsdellite", "hollandite-type"],
  },
];

export const LABPRESETS: LabPreset[] = [
  {
    id: "heusler",
    label: "フルホイスラー",
    formula: "Cu₂MnAl · L2₁",
    els: ["Al", "Mn", "Cu", "Cu"],
    desc: "４副格子をAl / Mn / Cu / Cuと占有します。全てが埋まっていても、元素の振り分けによって対称性と環境が変わります。",
  },
  {
    id: "half",
    label: "ハーフホイスラー",
    formula: "MgAgAs型",
    els: ["As", null, "Mg", "Ag"],
    desc: "B副格子を空にし、残り３つに異なる元素を置きます。４副格子のうち１つが空であり、全原子の半分が空になるわけではありません。",
  },
  {
    id: "d03",
    label: "Fe₃Al型",
    formula: "D0₃",
    els: ["Al", "Fe", "Fe", "Fe"],
    desc: "一つをAl、残り三つをFeで占めます。同じFeでも、全てが同じ結晶学的環境になるとは限りません。",
  },
  {
    id: "natl",
    label: "NaTl型",
    formula: "NaTl",
    els: ["Tl", "Na", "Tl", "Na"],
    desc: "AとCで一つ、BとDでもう一つのダイヤモンド型部分構造を作ります。同種原子だけを表示して、貫入する骨格を確認できます。",
  },
  {
    id: "fluorite",
    label: "蛍石",
    formula: "CaF₂",
    els: ["Ca", null, "F", "F"],
    desc: "Caのfcc配列に対して、CとDの四面体サイトを全てFで埋めます。ここでは球充填の主体がカチオンです。",
  },
  {
    id: "antifluorite",
    label: "逆蛍石",
    formula: "Li₂O",
    els: ["O", null, "Li", "Li"],
    desc: "蛍石と同じサイト配置で、骨格をO、四面体サイトをLiが担います。「反型」はこの役割の交換です。",
  },
  {
    id: "zns",
    label: "閃亜鉛鉱",
    formula: "ZnS · B3",
    els: ["Zn", null, "S", null],
    desc: "AとCの二つを使います。空いているもう一つのT副格子Dとの違いに注目すると、蛍石との関係が見えてきます。",
  },
  {
    id: "diamond",
    label: "ダイヤモンド",
    formula: "C · A4",
    els: ["C", null, "C", null],
    desc: "閃亜鉛鉱のAとCを同じ原子で占めると、両者が対称的に等価なダイヤモンド型になります。",
  },
  {
    id: "nacl",
    label: "岩塩",
    formula: "NaCl · B1",
    els: ["Na", "Cl", null, null],
    desc: "AとBを占め、T副格子CとDは空です。一方のfcc配列から見ると、他方は全ての八面体孔を占めています。",
  },
  {
    id: "fcc",
    label: "fcc",
    formula: "A1",
    els: ["Cu", null, null, null],
    desc: "Aだけを表示したものが一つのfcc副格子です。残りの位置は、この共通セルを使って別構造へ拡張するための候補サイトです。",
  },
  {
    id: "bcc",
    label: "bcc（拡大セル）",
    formula: "A2 · 2×2×2",
    els: ["W", "W", "W", "W"],
    desc: "４副格子を全て同じ原子で埋めると、bccの2×2×2拡大セルに対応します。通常のbcc慣用セルより辺が２倍の共通表示です。",
  },
  {
    id: "b2",
    label: "B2（拡大セル）",
    formula: "CsCl · 2×2×2",
    els: ["Cs", "Cs", "Cl", "Cl"],
    desc: "A/BとC/Dをそれぞれ同種原子で占めると、B2の2×2×2拡大セルとして見られます。ここでは全ての比較に同じ大きさの箱を使います。",
  },
];

export const OCCPRESETS: Record<string, OccPreset> = {
  spinel: {
    name: "スピネル／オリビン",
    t: 0.125,
    o: 0.5,
    title: "同じ占有率を、異なる骨格に。",
    desc: "正スピネルは近似ccp、オリビンは近似hcpのアニオン骨格を持ち、ともにT孔1/8・O孔1/2を占有します。比は同じ3/4でも、サイトの連結は異なります。",
    refs: [
      {
        s: "W",
        p: 80,
        sec: "§1.17.9",
      },
      {
        s: "W",
        p: 83,
        sec: "§1.17.10",
      },
    ],
  },
  nacl: {
    name: "NaCl／NiAs",
    t: 0,
    o: 1,
    title: "全O孔占有でも、多面体は同じではない。",
    desc: "ccpの岩塩とhcpのNiAsはいずれもO孔を全占有します。岩塩では両元素が八面体配位ですが、NiAsではAsの配位多面体は三角柱です。",
    refs: [
      {
        s: "M06",
        p: 196,
        sec: "§17.3",
      },
    ],
  },
  zns: {
    name: "ZnS／PbO／PtS",
    t: 0.5,
    o: 0,
    title: "割合だけでは、占有サイトを指定できない。",
    desc: "蛍石関連のT孔半占有には、閃亜鉛鉱、α-PbO、PtSという異なる配列があります。どの孔を選ぶかによって、四面体骨格・層・平面配位が分かれます。",
    refs: [
      {
        s: "M06",
        p: 206,
        sec: "§17.5",
      },
    ],
  },
  fluorite: {
    name: "蛍石／逆蛍石",
    t: 1,
    o: 0,
    title: "基準にする「充填粒子」を明示する。",
    desc: "蛍石ではCaを基準とする全T孔をFが占め、逆蛍石Li₂OではOを基準とする全T孔をLiが占めます。この式の「空隙内粒子」は常にカチオンとは限りません。",
    refs: [
      {
        s: "M06",
        p: 10,
        sec: "§2.4",
      },
      {
        s: "M06",
        p: 206,
        sec: "§17.5",
      },
    ],
  },
  corundum: {
    name: "コランダム",
    t: 0,
    o: 0.6666666666666666,
    title: "2/3の占有と、元素の規則配列。",
    desc: "コランダム、イルメナイト、LiNbO₃ではO孔の総占有率は2/3。どの元素がどの位置を占めるかという次の情報が、それらを区別します。",
    refs: [
      {
        s: "W",
        p: 85,
        sec: "§1.17.11",
      },
    ],
  },
};
