/** Curated atlas nodes. Source wording and page references retained from v1.0. */
export const nodes = [
  {
    "id": "fcc",
    "name": "面心立方 / 立方最密充填",
    "formula": "A1 · fcc / ccp",
    "family": "fcc",
    "sg": "Fm−3m · 225",
    "desc": "単一種類の球のABCABC積層。化合物では、どの原子集合をこの充填として見るかを明示する。",
    "packing": "単原子fcc；ABCABC",
    "coord": "同種原子12配位",
    "link": "T孔は球1個につき2個、O孔は1個。",
    "refs": [
      {
        "s": "W",
        "p": 25,
        "sec": "§1.10–1.11"
      },
      {
        "s": "M06",
        "p": 150,
        "sec": "§14.1"
      }
    ],
    "x": 440,
    "y": 95,
    "model": "fcc",
    "aliases": "A1 cubic close packed 面心立方 立方最密充填",
    "note": "fccは並進格子の名称、ccpは充填の記述。同じ区別を多原子の結晶構造に機械的に当てはめない。"
  },
  {
    "id": "nacl",
    "name": "岩塩型",
    "formula": "NaCl · B1",
    "family": "fcc",
    "sg": "Fm−3m · 225",
    "desc": "ccpアニオン骨格の八面体孔を全て占有する。カチオン側から見ても同様に記述できる。",
    "packing": "Clのccp；ABCABC",
    "coord": "Na: 6 / Cl: 6",
    "link": "NaCl₆八面体の稜共有ネットワーク。",
    "refs": [
      {
        "s": "M06",
        "p": 196,
        "sec": "§17.3"
      },
      {
        "s": "W",
        "p": 44,
        "sec": "§1.17.1.1"
      }
    ],
    "x": 180,
    "y": 255,
    "model": "nacl",
    "occ": [
      0,
      1
    ],
    "host": "Cl / アニオン",
    "aliases": "rock salt rocksalt B1 岩塩"
  },
  {
    "id": "zns",
    "name": "閃亜鉛鉱型",
    "formula": "ZnS · B3",
    "family": "fcc",
    "sg": "F−43m · 216",
    "desc": "ccp骨格の四面体孔の半分を、特定の向きのサイトに規則的に占有する。ダイヤモンド骨格を二元素で色分けした構造でもある。",
    "packing": "Sのccp；ABCABC",
    "coord": "Zn: 4 / S: 4",
    "link": "頂点共有四面体の3次元ネットワーク。",
    "refs": [
      {
        "s": "M06",
        "p": 206,
        "sec": "§17.5"
      },
      {
        "s": "M13",
        "p": 4,
        "sec": "§1.2・Fig.1.1"
      }
    ],
    "x": 440,
    "y": 255,
    "model": "zns",
    "occ": [
      0.5,
      0
    ],
    "host": "S / アニオン",
    "aliases": "zinc blende sphalerite B3 ZnS"
  },
  {
    "id": "antifluorite",
    "name": "逆蛍石型",
    "formula": "Li₂O · anti-CaF₂",
    "family": "fcc",
    "sg": "Fm−3m · 225",
    "desc": "アニオンをccp骨格とし、全ての四面体孔をカチオンが占有する。蛍石型と同じ幾何配置で、元素・電荷の役割が逆になる。",
    "packing": "Oのccp",
    "coord": "Li: 4 / O: 8",
    "link": "LiO₄四面体は稜・頂点を共有。",
    "refs": [
      {
        "s": "M06",
        "p": 10,
        "sec": "§2.4"
      },
      {
        "s": "M06",
        "p": 206,
        "sec": "§17.5"
      }
    ],
    "x": 700,
    "y": 255,
    "model": "antifluorite",
    "occ": [
      1,
      0
    ],
    "host": "O / アニオン",
    "aliases": "Li2O antifluorite 逆蛍石"
  },
  {
    "id": "l12",
    "name": "Cu₃Au型",
    "formula": "L1₂ · Cu₃Au",
    "family": "fcc",
    "sg": "Pm−3m · 221",
    "desc": "fccの角と面心を異なる元素が占める3:1規則配列。立方対称でも面心並進は失われる。",
    "packing": "fcc由来の規則構造",
    "coord": "Auは12個のCuに囲まれる",
    "link": "角: Au、面心: Cu。",
    "refs": [
      {
        "s": "M13",
        "p": 7,
        "sec": "§1.2・Fig.1.4"
      },
      {
        "s": "M06",
        "p": 158,
        "sec": "§15.1・Fig.15.1"
      }
    ],
    "x": 180,
    "y": 95,
    "model": "l12",
    "aliases": "L12 L1₂ Cu3Au AuCu3"
  },
  {
    "id": "l10",
    "name": "CuAu型",
    "formula": "L1₀ · CuAu",
    "family": "fcc",
    "sg": "P4/mmm · 123",
    "desc": "fcc由来の1:1規則配列で、同種原子の面が交互に並ぶ。正方晶の歪みも組み合わさる。",
    "packing": "fccからの層状規則化",
    "coord": "近接配位は軸比にも依存",
    "link": "Cu層とAu層の交互配列。",
    "refs": [
      {
        "s": "M06",
        "p": 158,
        "sec": "§15.1・Fig.15.1"
      },
      {
        "s": "SP",
        "p": 251,
        "sec": "Fig.3"
      }
    ],
    "x": 700,
    "y": 95,
    "aliases": "L10 L1₀ CuAu AuCu",
    "note": "bccから正方歪みを通して見る記述もある。どの母構造を選ぶかで見える関係が変わる。"
  },
  {
    "id": "diamond",
    "name": "ダイヤモンド型",
    "formula": "C · A4",
    "family": "fcc",
    "sg": "Fd−3m · 227",
    "desc": "全ての原子が四面体配位された3次元骨格。二つのfcc副格子を(¼,¼,¼)だけずらして重ねて表現できる。",
    "packing": "四面体結合ネットワーク",
    "coord": "C: 4",
    "link": "全原子が等価な四連結骨格。",
    "refs": [
      {
        "s": "M13",
        "p": 4,
        "sec": "§1.2・Fig.1.1"
      },
      {
        "s": "M06",
        "p": 118,
        "sec": "§12.1"
      }
    ],
    "x": 440,
    "y": 420,
    "model": "diamond",
    "aliases": "diamond A4 ダイヤモンド"
  },
  {
    "id": "spinel",
    "name": "正スピネル",
    "formula": "AB₂X₄ · MgAl₂O₄",
    "family": "fcc",
    "sg": "Fd−3m · 227",
    "desc": "近似ccpアニオン骨格のT孔1/8とO孔1/2を占有する。実際のアニオン位置は理想ccpからずれる。",
    "packing": "Xの近似ccp",
    "coord": "A: 4 / B: 6",
    "link": "BO₆稜共有骨格とAO₄四面体。",
    "refs": [
      {
        "s": "W",
        "p": 79,
        "sec": "§1.17.9"
      },
      {
        "s": "W",
        "p": 82,
        "sec": "Fig.1.44"
      }
    ],
    "x": 700,
    "y": 420,
    "occ": [
      0.125,
      0.5
    ],
    "host": "X / アニオン",
    "aliases": "spinel スピネル MgAl2O4",
    "note": "T孔占有率1/8は「全てのT孔」を分母にする。8aなどの特定Wyckoffサイトの占有率とは異なる。"
  },
  {
    "id": "inverse",
    "name": "逆スピネル",
    "formula": "B[AB]X₄",
    "family": "fcc",
    "sg": "Fd−3m（平均構造）",
    "desc": "T孔とO孔の総占有数は正スピネルと同じだが、元素の振り分けが異なる。Oサイトの長距離秩序化はさらに別の問題。",
    "packing": "Xの近似ccp",
    "coord": "T: B / O: A,B",
    "link": "正スピネルと同じサイト骨格。",
    "refs": [
      {
        "s": "W",
        "p": 81,
        "sec": "§1.17.9"
      },
      {
        "s": "W",
        "p": 83,
        "sec": "反転度γ"
      }
    ],
    "x": 700,
    "y": 585,
    "occ": [
      0.125,
      0.5
    ],
    "host": "X / アニオン",
    "aliases": "inverse spinel 逆スピネル",
    "note": "「逆スピネル」はカチオン分布の入替え。「逆蛍石」のカチオン・アニオン交換と意味が異なる。"
  },
  {
    "id": "nbO",
    "name": "NbO型",
    "formula": "NbO · 空孔秩序",
    "family": "fcc",
    "sg": "Pm−3m · 221",
    "desc": "NaCl型のカチオン・アニオン両副格子から、それぞれ1/4のサイトを規則的に取り除いた構造。",
    "packing": "欠陥NaCl骨格",
    "coord": "NbのO配位: 平面四配位",
    "link": "Nb–Nb結合を含む構造。",
    "refs": [
      {
        "s": "M13",
        "p": 180,
        "sec": "Fig.13.11"
      }
    ],
    "x": 180,
    "y": 420,
    "aliases": "NbO vacancy 空孔",
    "note": "骨格側にも空孔があるため、単純な完全ccp基準のT/O占有率は表示しない。"
  },
  {
    "id": "hcp",
    "name": "六方最密充填",
    "formula": "A3 · hcp",
    "family": "hcp",
    "sg": "P6₃/mmc · 194",
    "desc": "球のABAB積層。ccpと同じ数のT孔とO孔を持つが、空隙の並び方・連結が異なる。",
    "packing": "ABAB積層",
    "coord": "同種原子12配位",
    "link": "O孔は積層方向に面共有列を作る。",
    "refs": [
      {
        "s": "W",
        "p": 25,
        "sec": "§1.10"
      },
      {
        "s": "M06",
        "p": 190,
        "sec": "§17.1"
      }
    ],
    "x": 440,
    "y": 95,
    "model": "hcp",
    "aliases": "A3 hexagonal close packed 六方最密充填"
  },
  {
    "id": "nias",
    "name": "NiAs型",
    "formula": "NiAs · B8₁",
    "family": "hcp",
    "sg": "P6₃/mmc · 194",
    "desc": "hcpのAs骨格のO孔を全てNiが占める。NiとAsはともに6配位でも、配位多面体は同じではない。",
    "packing": "Asのhcp",
    "coord": "Ni: 八面体 / As: 三角柱",
    "link": "NiAs₆八面体がc方向に面共有。",
    "refs": [
      {
        "s": "M06",
        "p": 196,
        "sec": "§17.3・Fig.17.5"
      }
    ],
    "x": 440,
    "y": 255,
    "model": "nias",
    "occ": [
      0,
      1
    ],
    "host": "As",
    "aliases": "NiAs nickel arsenide B81"
  },
  {
    "id": "wurtzite",
    "name": "ウルツ鉱型",
    "formula": "ZnS · B4",
    "family": "hcp",
    "sg": "P6₃mc · 186",
    "desc": "hcpのS骨格のT孔の半分を規則的に占有する。閃亜鉛鉱とは四面体配位を共有しつつ、積層が異なる。",
    "packing": "Sのhcp",
    "coord": "Zn: 4 / S: 4",
    "link": "頂点共有四面体の3次元骨格。",
    "refs": [
      {
        "s": "M06",
        "p": 206,
        "sec": "§17.5"
      },
      {
        "s": "W",
        "p": 49,
        "sec": "§1.17.3"
      }
    ],
    "x": 180,
    "y": 255,
    "model": "wurtzite",
    "occ": [
      0.5,
      0
    ],
    "host": "S / アニオン",
    "aliases": "wurtzite B4 ウルツ鉱"
  },
  {
    "id": "olivine",
    "name": "オリビン型",
    "formula": "Mg₂SiO₄ / LiFePO₄",
    "family": "hcp",
    "sg": "斜方晶",
    "desc": "hcpに近いO骨格のT孔1/8とO孔1/2を占有する。LiFePO₄では二種類の八面体サイトをLiとFeが規則的に占める。",
    "packing": "Oの近似hcp",
    "coord": "Si/P: 4 / Mg,Li,Fe: 6",
    "link": "T/O総占有割合はスピネルと同じ。",
    "refs": [
      {
        "s": "W",
        "p": 83,
        "sec": "§1.17.10・Fig.1.45"
      }
    ],
    "x": 700,
    "y": 95,
    "occ": [
      0.125,
      0.5
    ],
    "host": "O / アニオン",
    "aliases": "olivine LiFePO4 Mg2SiO4 オリビン",
    "note": "同じ占有割合でも、骨格と配列が異なれば別構造。これは直接の群–部分群関係を意味しない。"
  },
  {
    "id": "cdi2",
    "name": "CdI₂型",
    "formula": "CdI₂ · 層状MX₂",
    "family": "hcp",
    "sg": "P−3m1 · 164",
    "desc": "O孔が全占有の層と空の層を交互に並べる。占有した層の内部では八面体が稜共有する。",
    "packing": "Iのhcp（基本ポリタイプ）",
    "coord": "Cd: 6",
    "link": "稜共有CdI₆層。層間はカチオン空層。",
    "refs": [
      {
        "s": "M06",
        "p": 198,
        "sec": "§17.3"
      },
      {
        "s": "M13",
        "p": 170,
        "sec": "§13.2.1"
      }
    ],
    "x": 180,
    "y": 420,
    "occ": [
      0,
      0.5
    ],
    "host": "I / アニオン",
    "aliases": "CdI2 brucite 層状",
    "note": "CdI₂自体には多くのポリタイプがある。ここでは基本的なP−3m1型を指す。"
  },
  {
    "id": "biI3",
    "name": "BiI₃型",
    "formula": "BiI₃ · ハニカム層",
    "family": "hcp",
    "sg": "R−3 · 148",
    "desc": "O孔を全体として1/3占有する。占有層の2/3を埋めたハニカム配列と、空層を組み合わせる。",
    "packing": "Iの近似hcp",
    "coord": "Bi: 6",
    "link": "稜共有八面体のハニカム層。",
    "refs": [
      {
        "s": "M06",
        "p": 201,
        "sec": "§17.3"
      },
      {
        "s": "M13",
        "p": 170,
        "sec": "§13.2.1"
      }
    ],
    "x": 180,
    "y": 585,
    "occ": [
      0,
      0.3333333333333333
    ],
    "host": "I / アニオン",
    "aliases": "BiI3 honeycomb ハニカム"
  },
  {
    "id": "corundum",
    "name": "コランダム型",
    "formula": "α-Al₂O₃",
    "family": "hcp",
    "sg": "R−3c · 167",
    "desc": "hcpに近いO骨格のO孔を2/3占有する。空孔と占有サイトの規則配列を含む。",
    "packing": "Oの近似hcp",
    "coord": "Al: 6",
    "link": "八面体の稜共有と面共有対。",
    "refs": [
      {
        "s": "W",
        "p": 85,
        "sec": "§1.17.11"
      },
      {
        "s": "M13",
        "p": 170,
        "sec": "§13.2.1"
      }
    ],
    "x": 440,
    "y": 420,
    "occ": [
      0,
      0.6666666666666666
    ],
    "host": "O / アニオン",
    "aliases": "corundum alumina α-Al2O3"
  },
  {
    "id": "ilmenite",
    "name": "イルメナイト型",
    "formula": "FeTiO₃",
    "family": "hcp",
    "sg": "R−3 · 148",
    "desc": "コランダムのカチオン位置を二元素で規則化する。FeとTiの占有層が区別される。",
    "packing": "Oの近似hcp",
    "coord": "Fe: 6 / Ti: 6",
    "link": "異種カチオンを含む面共有対。",
    "refs": [
      {
        "s": "M13",
        "p": 172,
        "sec": "§13.2.1"
      },
      {
        "s": "W",
        "p": 85,
        "sec": "§1.17.11"
      }
    ],
    "x": 440,
    "y": 585,
    "occ": [
      0,
      0.6666666666666666
    ],
    "host": "O / アニオン",
    "aliases": "ilmenite FeTiO3"
  },
  {
    "id": "linbo3",
    "name": "LiNbO₃型",
    "formula": "LiNbO₃ / LiTaO₃",
    "family": "hcp",
    "sg": "R3c · 161",
    "desc": "コランダム関連の別のカチオン規則化。イルメナイトとは元素の配列が異なり、極性構造をとる。",
    "packing": "Oの歪んだhcp関連",
    "coord": "Li: 歪んだ6 / Nb: 6",
    "link": "同じO孔占有数でも、規則配列が異なる。",
    "refs": [
      {
        "s": "M13",
        "p": 172,
        "sec": "§13.2.1"
      },
      {
        "s": "W",
        "p": 85,
        "sec": "§1.17.11・Fig.1.46"
      }
    ],
    "x": 700,
    "y": 585,
    "occ": [
      0,
      0.6666666666666666
    ],
    "host": "O / アニオン",
    "aliases": "LiNbO3 LiTaO3 lithium niobate",
    "note": "Westは大きく歪んだペロブスカイトという別の見方も示す。アトラスの分類は唯一の親子関係ではない。"
  },
  {
    "id": "mnp",
    "name": "MnP型",
    "formula": "MnP · B31",
    "family": "hcp",
    "sg": "Pmcn · 62（非標準設定）",
    "desc": "NiAs型から原子をずらした斜方晶の派生。原著はCmcmを経由する群–部分群連鎖を示している。",
    "packing": "歪んだNiAs関連骨格",
    "coord": "歪んだ6配位",
    "link": "金属原子やPのジグザグ配列。",
    "refs": [
      {
        "s": "M06",
        "p": 197,
        "sec": "Fig.17.5"
      },
      {
        "s": "M06",
        "p": 217,
        "sec": "§18.3・Fig.18.4 (p.218)"
      }
    ],
    "x": 700,
    "y": 255,
    "aliases": "MnP B31 Pnma Pmcn",
    "note": "PmcnはPnmaと同じ空間群型No.62の別設定。座標は軸変換せずに混ぜない。"
  },
  {
    "id": "rhf3",
    "name": "RhF₃型",
    "formula": "RhF₃ · O孔1/3",
    "family": "hcp",
    "sg": "R−3c · 167",
    "desc": "hcp関連のF骨格のO孔を1/3占有する。コランダムとは占有孔・空孔を補集合として比較できる。",
    "packing": "Fのhcp関連",
    "coord": "Rh: 6",
    "link": "八面体は頂点共有。",
    "refs": [
      {
        "s": "M13",
        "p": 170,
        "sec": "§13.2.1・Fig.13.3"
      }
    ],
    "x": 700,
    "y": 420,
    "occ": [
      0,
      0.3333333333333333
    ],
    "host": "F / アニオン",
    "aliases": "RhF3 FeF3 VF3",
    "note": "コランダムと同じ空間群型でも、占有した多面体の連結は異なる。"
  },
  {
    "id": "bcc",
    "name": "体心立方",
    "formula": "A2 · W型",
    "family": "bcc",
    "sg": "Im−3m · 229",
    "desc": "角と体心を同じ原子が占める。二元素の不規則合金では、平均構造としてこの対称性を持ち得る。",
    "packing": "bcc；最密充填ではない",
    "coord": "最近接8（次近接6）",
    "link": "色分けにより体心並進が失われる。",
    "refs": [
      {
        "s": "M06",
        "p": 153,
        "sec": "§14.2"
      },
      {
        "s": "M06",
        "p": 160,
        "sec": "§15.3"
      }
    ],
    "x": 440,
    "y": 95,
    "model": "bcc",
    "aliases": "A2 bcc W tungsten 体心立方"
  },
  {
    "id": "b2",
    "name": "CsCl型 / B2",
    "formula": "CsCl · 規則AB",
    "family": "bcc",
    "sg": "Pm−3m · 221",
    "desc": "角と体心を異なる原子が占める。bcc由来の配列でも、結晶のBravais格子はPになる。",
    "packing": "bcc由来の二副格子",
    "coord": "A: 8 / B: 8",
    "link": "二つの単純立方副格子。",
    "refs": [
      {
        "s": "M06",
        "p": 160,
        "sec": "§15.3"
      },
      {
        "s": "SP",
        "p": 249,
        "sec": "§2"
      }
    ],
    "x": 180,
    "y": 255,
    "model": "b2",
    "aliases": "B2 CsCl cesium chloride β-brass"
  },
  {
    "id": "heusler",
    "name": "フルホイスラー型",
    "formula": "L2₁ · Cu₂MnAl",
    "family": "bcc",
    "sg": "Fm−3m · 225",
    "desc": "拡大したB2型のセルを四つのfcc副格子に分け、三元素を規則配置する記述。",
    "packing": "bcc超構造／4つのfcc",
    "coord": "CuとMn/Alの副格子を区別",
    "link": "4副格子: Al / Mn / Cu / Cu。",
    "refs": [
      {
        "s": "M06",
        "p": 160,
        "sec": "§15.3・Fig.15.3"
      },
      {
        "s": "K",
        "p": 160,
        "sec": "§2.1・図7"
      }
    ],
    "x": 180,
    "y": 420,
    "model": "heusler",
    "aliases": "L21 L2₁ full Heusler ホイスラー Cu2MnAl"
  },
  {
    "id": "half",
    "name": "ハーフホイスラー型",
    "formula": "MgAgAs型",
    "family": "bcc",
    "sg": "F−43m · 216",
    "desc": "四つのfcc副格子のうち三つを異なる元素で占め、一つを空にする。",
    "packing": "4つのfccのうち1つが空",
    "coord": "四面体配位部分を含む",
    "link": "4副格子: As / □ / Mg / Ag。",
    "refs": [
      {
        "s": "M06",
        "p": 161,
        "sec": "Fig.15.3"
      },
      {
        "s": "K",
        "p": 160,
        "sec": "図7"
      }
    ],
    "x": 180,
    "y": 585,
    "model": "half",
    "aliases": "half Heusler C1b C1_b MgAgAs ハーフホイスラー",
    "note": "「ホイスラーから半分の全原子を除く」意味ではない。ここでは4副格子のうち1つが空。"
  },
  {
    "id": "d03",
    "name": "Fe₃Al型",
    "formula": "D0₃ · Li₃Bi型",
    "family": "bcc",
    "sg": "Fm−3m · 225",
    "desc": "四つのfcc副格子の一つをAl、残り三つをFeが占めるbcc由来の規則構造。",
    "packing": "bcc超構造／4つのfcc",
    "coord": "Feに複数の環境",
    "link": "4副格子: Al / Fe / Fe / Fe。",
    "refs": [
      {
        "s": "M06",
        "p": 161,
        "sec": "Fig.15.3"
      }
    ],
    "x": 440,
    "y": 420,
    "model": "d03",
    "aliases": "D03 D0₃ Fe3Al Li3Bi"
  },
  {
    "id": "natl",
    "name": "NaTl型",
    "formula": "NaTl · Zintl相",
    "family": "bcc",
    "sg": "Fd−3m · 227",
    "desc": "二つのダイヤモンド型部分構造が互いに貫入する見方ができる。bcc由来の四副格子記述にも入る。",
    "packing": "2つのダイヤモンド骨格",
    "coord": "Tlの同種原子四連結部分骨格",
    "link": "4副格子: Tl / Na / Tl / Na。",
    "refs": [
      {
        "s": "M06",
        "p": 161,
        "sec": "Fig.15.3と本文"
      },
      {
        "s": "K",
        "p": 160,
        "sec": "図6・7"
      }
    ],
    "x": 440,
    "y": 585,
    "model": "natl",
    "aliases": "NaTl B32 Zintl LiAl"
  },
  {
    "id": "bct",
    "name": "正方歪みの中間母構造",
    "formula": "Pa型 · bct",
    "family": "bcc",
    "sg": "I4/mmm · 139",
    "desc": "bccを正方晶へ歪ませた母構造。論文図3はこの対称性を経る分岐を示す。",
    "packing": "body-centered tetragonal",
    "coord": "軸比によって近接関係が変化",
    "link": "bccの立方対称性の一部を失う。",
    "refs": [
      {
        "s": "SP",
        "p": 251,
        "sec": "§2・Fig.3"
      }
    ],
    "x": 700,
    "y": 95,
    "aliases": "Pa bct protactinium",
    "note": "ここでは母構造としての役割に注目。全bcc派生がこの枝を通るわけではない。"
  },
  {
    "id": "mosi2",
    "name": "MoSi₂型",
    "formula": "AB₂ · tI6",
    "family": "bcc",
    "sg": "I4/mmm · 139",
    "desc": "bcc関連の規則構造。MoSi₂とCuZr₂は同じ結晶学的fingerprintでも、軸比や結合の状況が違う。",
    "packing": "bcc関連超構造",
    "coord": "近接環境は軸比・内部座標に依存",
    "link": "2aと4eの組合せ。",
    "refs": [
      {
        "s": "SP",
        "p": 249,
        "sec": "§2"
      },
      {
        "s": "SP",
        "p": 250,
        "sec": "Fig.1"
      }
    ],
    "x": 700,
    "y": 255,
    "aliases": "MoSi2 C11b"
  },
  {
    "id": "cuzr2",
    "name": "CuZr₂型",
    "formula": "AB₂ · tI6",
    "family": "bcc",
    "sg": "I4/mmm · 139",
    "desc": "MoSi₂型とisopointalに比較される枝。空間群・Pearson記号・Wyckoff列が一致しても結合まで同じとはしない。",
    "packing": "bcc関連超構造",
    "coord": "軸比の異なるAB₂配置",
    "link": "2aと4eの組合せ。",
    "refs": [
      {
        "s": "SP",
        "p": 250,
        "sec": "§2・Fig.1"
      }
    ],
    "x": 700,
    "y": 420,
    "aliases": "CuZr2 isopointal"
  },
  {
    "id": "cac2",
    "name": "CaC₂型",
    "formula": "Ca²⁺[C₂]²⁻",
    "family": "bcc",
    "sg": "I4/mmm · 139",
    "desc": "同じfingerprintの別の例。C₂ダンベルを持ち、金属間化合物とは結合の解釈が異なる。",
    "packing": "正方晶；C₂単位を含む",
    "coord": "C–Cダンベル",
    "link": "構造記号だけでは結合を判別できない。",
    "refs": [
      {
        "s": "SP",
        "p": 250,
        "sec": "§2・Fig.1"
      },
      {
        "s": "W",
        "p": 17,
        "sec": "Fig.1.10"
      }
    ],
    "x": 440,
    "y": 255,
    "aliases": "CaC2 calcium acetylide"
  },
  {
    "id": "xef2",
    "name": "XeF₂型",
    "formula": "分子性結晶",
    "family": "bcc",
    "sg": "I4/mmm · 139",
    "desc": "このfingerprintには分子性のXeF₂も含まれる。原子位置の形式的な類似と化学的な同型性を分ける例。",
    "packing": "線状分子のパッキング",
    "coord": "XeF₂: 線状",
    "link": "分子内と分子間を区別。",
    "refs": [
      {
        "s": "SP",
        "p": 250,
        "sec": "§2・Fig.1"
      }
    ],
    "x": 700,
    "y": 585,
    "aliases": "XeF2 isopointal molecular"
  },
  {
    "id": "fluorite",
    "name": "蛍石型",
    "formula": "CaF₂ · C1",
    "family": "fluorite",
    "sg": "Fm−3m · 225",
    "desc": "Caをccp骨格として、全てのT孔をFが占有する。アニオンを骨格と決めつけないことが重要。",
    "packing": "Caのccp（カチオン骨格）",
    "coord": "Ca: 8 / F: 4",
    "link": "CaF₈立方体、FCa₄四面体。",
    "refs": [
      {
        "s": "M06",
        "p": 206,
        "sec": "§17.5"
      },
      {
        "s": "M13",
        "p": 180,
        "sec": "§13.3.2"
      }
    ],
    "x": 440,
    "y": 95,
    "model": "fluorite",
    "occ": [
      1,
      0
    ],
    "host": "Ca / カチオン",
    "aliases": "fluorite CaF2 C1 蛍石"
  },
  {
    "id": "pyrochlore",
    "name": "パイロクロア型",
    "formula": "A₂B₂X₇",
    "family": "fluorite",
    "sg": "Fd−3m · 227",
    "desc": "蛍石関連のカチオン規則化とアニオン空孔規則化を持つ。基準蛍石のアニオンサイトの1/8が空。",
    "packing": "歪んだ欠陥蛍石関連",
    "coord": "A: 8 / B: 6",
    "link": "BX₆は頂点共有；A側の部分骨格もある。",
    "refs": [
      {
        "s": "W",
        "p": 87,
        "sec": "§1.17.12・Fig.1.48"
      }
    ],
    "x": 180,
    "y": 255,
    "aliases": "pyrochlore A2B2O7 パイロクロア",
    "note": "アニオン変位によりB配位は八面体になる。蛍石の理想T孔をそのまま実構造の配位と読み替えない。"
  },
  {
    "id": "defectfluorite",
    "name": "欠陥蛍石の平均構造",
    "formula": "A₂B₂X₇（模式）",
    "family": "fluorite",
    "sg": "Fm−3m（平均構造）",
    "desc": "カチオン混合とアニオン空孔を平均化して記述する。局所秩序と平均対称性は区別する。",
    "packing": "欠陥蛍石",
    "coord": "局所配位は平均模型だけで決まらない",
    "link": "A/B混合、X/□の平均占有。",
    "refs": [
      {
        "s": "W",
        "p": 89,
        "sec": "Fig.1.48"
      }
    ],
    "x": 180,
    "y": 420,
    "aliases": "defect fluorite disordered fluorite 欠陥蛍石"
  },
  {
    "id": "bixbyite",
    "name": "ビクスビアイト型",
    "formula": "C型 M₂O₃",
    "family": "fluorite",
    "sg": "立方晶",
    "desc": "蛍石からOサイトを1/4取り除いた関連構造。Mの配位数は6になる。",
    "packing": "酸素欠損蛍石関連",
    "coord": "M: 6",
    "link": "空孔規則配列と原子変位。",
    "refs": [
      {
        "s": "W",
        "p": 88,
        "sec": "§1.17.12"
      }
    ],
    "x": 440,
    "y": 255,
    "aliases": "bixbyite C-type rare earth sesquioxide ビクスビアイト"
  },
  {
    "id": "weberite",
    "name": "ウェベライト型",
    "formula": "Na₂MgAlF₇",
    "family": "fluorite",
    "sg": "Imma（理想対称性）",
    "desc": "アニオン欠損蛍石の別の超構造。パイロクロアと関連するが、配列・連結を区別する。",
    "packing": "アニオン欠損蛍石関連",
    "coord": "A: 8 / B: 6",
    "link": "頂点共有BX₆とAO₈部分骨格。",
    "refs": [
      {
        "s": "W",
        "p": 88,
        "sec": "§1.17.12"
      }
    ],
    "x": 700,
    "y": 255,
    "aliases": "weberite Na2MgAlF7",
    "note": "組成に応じて複数の関連多形がある。Immaを全てのウェベライトに一律に当てはめない。"
  },
  {
    "id": "cuprite",
    "name": "赤銅鉱型",
    "formula": "Cu₂O",
    "family": "fluorite",
    "sg": "Pn−3m · 224",
    "desc": "Cuのccp配置のT孔を1/4だけOが規則占有する記述。Cuの配位は線状になる。",
    "packing": "Cuのccp",
    "coord": "Cu: 2 / O: 4",
    "link": "互いに貫入する二つの骨格。",
    "refs": [
      {
        "s": "M13",
        "p": 180,
        "sec": "§13.3.2・Fig.13.12"
      },
      {
        "s": "M13",
        "p": 183,
        "sec": "Table13.8"
      }
    ],
    "x": 440,
    "y": 420,
    "occ": [
      0.25,
      0
    ],
    "host": "Cu / カチオン",
    "aliases": "cuprite Cu2O 赤銅鉱"
  },
  {
    "id": "pbo",
    "name": "α-PbO型",
    "formula": "PbO · リサージ",
    "family": "fluorite",
    "sg": "P4/nmm · 129",
    "desc": "蛍石関連のT孔を半分空にする別配列。閃亜鉛鉱とは異なる、層状の連結になる。",
    "packing": "Pbの歪んだccp関連",
    "coord": "Pb: 4（四角錐状）/ O: 4",
    "link": "Oを中心とする四面体の稜共有層。",
    "refs": [
      {
        "s": "M06",
        "p": 206,
        "sec": "§17.5"
      },
      {
        "s": "M13",
        "p": 181,
        "sec": "Fig.13.12–14"
      }
    ],
    "x": 180,
    "y": 585,
    "occ": [
      0.5,
      0
    ],
    "host": "Pb / カチオン",
    "aliases": "PbO litharge リサージ",
    "note": "T孔半占有という割合だけでは、ZnS型・PbO型・PtS型を区別できない。"
  },
  {
    "id": "pts",
    "name": "PtS型",
    "formula": "PtS",
    "family": "fluorite",
    "sg": "P4₂/mmc · 131",
    "desc": "蛍石関連のT孔半占有のさらに別の配列。金属の平面配位とSの四面体配位が共存する。",
    "packing": "Ptの歪んだccp関連",
    "coord": "Pt: 平面4 / S: 4",
    "link": "占有の規則性が多面体連結を変える。",
    "refs": [
      {
        "s": "M06",
        "p": 206,
        "sec": "§17.5"
      },
      {
        "s": "M13",
        "p": 181,
        "sec": "Fig.13.12"
      }
    ],
    "x": 700,
    "y": 585,
    "occ": [
      0.5,
      0
    ],
    "host": "Pt / カチオン",
    "aliases": "PtS cooperite"
  },
  {
    "id": "perov",
    "name": "立方ペロブスカイト",
    "formula": "ABX₃ · SrTiO₃",
    "family": "perov",
    "sg": "Pm−3m · 221",
    "desc": "BX₆八面体を頂点共有でつなぎ、できた大きな空間をAが占める。AとXを合わせたccpという見方もある。",
    "packing": "A+Xの混合ccp／BX₆骨格",
    "coord": "A: 12 / B: 6",
    "link": "BX₆頂点共有の3次元骨格。",
    "refs": [
      {
        "s": "W",
        "p": 61,
        "sec": "§1.17.7"
      },
      {
        "s": "M13",
        "p": 168,
        "sec": "§13.1"
      }
    ],
    "x": 440,
    "y": 95,
    "model": "perov",
    "aliases": "perovskite SrTiO3 ABX3 ペロブスカイト"
  },
  {
    "id": "reo3",
    "name": "ReO₃型",
    "formula": "□BX₃",
    "family": "perov",
    "sg": "Pm−3m · 221",
    "desc": "ペロブスカイトのAサイトを空にした幾何学的骨格。頂点共有BX₆ネットワークを保つ。",
    "packing": "BX₆の骨格",
    "coord": "B: 6",
    "link": "A空間は空孔。",
    "refs": [
      {
        "s": "W",
        "p": 76,
        "sec": "§1.17.8"
      },
      {
        "s": "M13",
        "p": 168,
        "sec": "§13.1"
      }
    ],
    "x": 180,
    "y": 255,
    "model": "reo3",
    "aliases": "ReO3 空Aサイト"
  },
  {
    "id": "tilted",
    "name": "GdFeO₃型",
    "formula": "チルトしたABO₃",
    "family": "perov",
    "sg": "斜方晶",
    "desc": "八面体の協調回転によってAサイトの空間を小さくする。Westの設定ではGlazer表記a⁻b⁺a⁻。",
    "packing": "頂点共有BO₆骨格",
    "coord": "A配位が低下 / Bは八面体",
    "link": "結合角と軸長を変えて頂点共有を保つ。",
    "refs": [
      {
        "s": "W",
        "p": 64,
        "sec": "§1.17.7.3"
      }
    ],
    "x": 440,
    "y": 255,
    "aliases": "GdFeO3 tilted Glazer チルト Pnma",
    "note": "Glazerの軸順と空間群設定を揃えて比較する。本版は回転量の数値を収録しない。"
  },
  {
    "id": "batio3",
    "name": "正方晶BaTiO₃",
    "formula": "極性変位",
    "family": "perov",
    "sg": "正方晶（極性）",
    "desc": "Tiなどの相対変位が極性を生む。八面体回転だけでなく、サイト内部の変位も構造派生の操作になる。",
    "packing": "ペロブスカイト関連",
    "coord": "歪んだTi–O配位",
    "link": "正負電荷中心の相対変位。",
    "refs": [
      {
        "s": "W",
        "p": 64,
        "sec": "§1.17.7.2"
      }
    ],
    "x": 700,
    "y": 255,
    "aliases": "BaTiO3 tetragonal ferroelectric 強誘電",
    "note": "強誘電変位と八面体チルトは別の構造自由度として扱う。"
  },
  {
    "id": "doubleperov",
    "name": "二重ペロブスカイト",
    "formula": "A₂BB′X₆",
    "family": "perov",
    "sg": "立方晶の理想規則模型",
    "desc": "BとB′を岩塩状に交互配列する。理想的な無歪み構造は親ペロブスカイトの2倍のセル辺を持つ。",
    "packing": "頂点共有BX₆ / B′X₆",
    "coord": "B, B′: 6",
    "link": "B副格子の岩塩型規則化。",
    "refs": [
      {
        "s": "W",
        "p": 72,
        "sec": "§1.17.7.7"
      }
    ],
    "x": 700,
    "y": 420,
    "aliases": "double perovskite A2BBX6 二重ペロブスカイト",
    "note": "実物質にはチルト・非化学量論・部分不規則化がある。単一の空間群を全ての組成へ割り当てない。"
  },
  {
    "id": "brown",
    "name": "ブラウンミレライト",
    "formula": "A₂B₂O₅",
    "family": "perov",
    "sg": "例: Pnma · 62",
    "desc": "ペロブスカイト関連の酸素欠損を秩序化し、BO₆層とBO₄層を交互に作る。",
    "packing": "酸素欠損ペロブスカイト",
    "coord": "B: 6と4",
    "link": "八面体層と四面体を含む層の交互配列。",
    "refs": [
      {
        "s": "W",
        "p": 67,
        "sec": "Fig.1.42(b)"
      },
      {
        "s": "W",
        "p": 70,
        "sec": "§1.17.7.5"
      }
    ],
    "x": 440,
    "y": 420,
    "aliases": "brownmillerite Ca2Fe2O5 A2B2O5",
    "note": "表示した空間群はWestに示されたCa₂(Fe,Al)₂O₅の例。構造族全体の一意な対称性ではない。"
  },
  {
    "id": "rp1",
    "name": "K₂NiF₄型",
    "formula": "RP · n = 1",
    "family": "perov",
    "sg": "I4/mmm · 139（理想型）",
    "desc": "ペロブスカイトブロック1層と岩塩型ブロックを組み合わせる。RP系列の最も単純なメンバー。",
    "packing": "ペロブスカイト＋岩塩ブロック",
    "coord": "B: 6",
    "link": "頂点共有八面体の層状ブロック。",
    "refs": [
      {
        "s": "W",
        "p": 91,
        "sec": "§1.17.14"
      },
      {
        "s": "W",
        "p": 93,
        "sec": "Fig.1.50"
      }
    ],
    "x": 180,
    "y": 420,
    "aliases": "K2NiF4 Ruddlesden Popper RP n1 A2BO4"
  },
  {
    "id": "rp2",
    "name": "Ruddlesden–Popper",
    "formula": "RP · n = 2",
    "family": "perov",
    "sg": "層状構造族（理想型: 正方晶）",
    "desc": "二層厚のペロブスカイトブロックを岩塩型層で区切る。一般式Aₙ₊₁BₙX₃ₙ₊₁のn=2。",
    "packing": "ペロブスカイト2層＋岩塩層",
    "coord": "B: 6",
    "link": "例: Sr₃Ti₂O₇。",
    "refs": [
      {
        "s": "W",
        "p": 92,
        "sec": "§1.17.14"
      }
    ],
    "x": 180,
    "y": 585,
    "aliases": "Ruddlesden Popper RP n2 Sr3Ti2O7 A3B2O7"
  },
  {
    "id": "antiPerov",
    "name": "逆ペロブスカイト",
    "formula": "Na₃OCl など",
    "family": "perov",
    "sg": "理想立方型: Pm−3m",
    "desc": "ペロブスカイトのサイト幾何を保ち、カチオン・アニオンの役割が通常と異なる化合物群。",
    "packing": "ペロブスカイトの反型",
    "coord": "例: OをNa₆八面体が囲む",
    "link": "物質によって結合の性格は異なる。",
    "refs": [
      {
        "s": "W",
        "p": 74,
        "sec": "§1.17.7.9"
      }
    ],
    "x": 700,
    "y": 585,
    "aliases": "antiperovskite Na3OCl inverse perovskite 逆ペロブスカイト"
  },
  {
    "id": "hexperov",
    "name": "六方ペロブスカイト",
    "formula": "2H · BaNiO₃",
    "family": "perov",
    "sg": "P6₃/mmc · 194（2H例）",
    "desc": "AO₃層の積層を変えると、頂点共有に代わり面共有八面体列を持つ枝が現れる。",
    "packing": "AO₃混合層のhcp積層",
    "coord": "B: 6",
    "link": "2H例はc方向の面共有八面体列。",
    "refs": [
      {
        "s": "W",
        "p": 75,
        "sec": "§1.17.7.11"
      },
      {
        "s": "W",
        "p": 66,
        "sec": "Fig.1.42(g,h)"
      }
    ],
    "x": 440,
    "y": 585,
    "aliases": "hexagonal perovskite BaNiO3 2H"
  },
  {
    "id": "rutile",
    "name": "ルチル型",
    "formula": "TiO₂ · C4",
    "family": "rutile",
    "sg": "P4₂/mnm · 136",
    "desc": "稜共有八面体の直線鎖を、頂点共有で相互に連結する。MüllerはO配置を正方晶の密な充填として説明する。",
    "packing": "正方晶のO充填",
    "coord": "Ti: 6 / O: 3",
    "link": "稜共有鎖＋鎖間の頂点共有。",
    "refs": [
      {
        "s": "M06",
        "p": 198,
        "sec": "§17.3・Fig.17.6"
      },
      {
        "s": "M06",
        "p": 199,
        "sec": "Table17.2"
      }
    ],
    "x": 440,
    "y": 95,
    "model": "rutile",
    "aliases": "rutile TiO2 C4 ルチル",
    "note": "単純な「hcp→ルチル」の群–部分群矢印は置かない。Müllerはその解釈を明示的に否定する。"
  },
  {
    "id": "cacl2",
    "name": "CaCl₂型",
    "formula": "斜方晶歪み",
    "family": "rutile",
    "sg": "Pnnm · 58",
    "desc": "ルチル型から八面体鎖が互いに回転する歪み。四回対称などが失われ、aとbが分かれる。",
    "packing": "ルチル関連の歪み",
    "coord": "Ca: 歪んだ6配位",
    "link": "稜共有鎖の相対回転。",
    "refs": [
      {
        "s": "M13",
        "p": 5,
        "sec": "§1.2・Fig.1.2"
      },
      {
        "s": "M06",
        "p": 199,
        "sec": "Table17.2"
      }
    ],
    "x": 180,
    "y": 255,
    "aliases": "CaCl2 Pnnm ferroelastic"
  },
  {
    "id": "marcasite",
    "name": "白鉄鉱型",
    "formula": "FeS₂ · marcasite",
    "family": "rutile",
    "sg": "Pnnm · 58",
    "desc": "CaCl₂・ルチル関連の八面体鎖を比較できるが、S₂ダンベルの形成が重要な違いになる。",
    "packing": "歪んだ八面体鎖骨格",
    "coord": "Fe: 6 / S–S対あり",
    "link": "八面体鎖の回転とS₂対。",
    "refs": [
      {
        "s": "M06",
        "p": 198,
        "sec": "§17.3・Fig.17.6"
      },
      {
        "s": "M06",
        "p": 199,
        "sec": "Table17.2"
      }
    ],
    "x": 180,
    "y": 420,
    "aliases": "marcasite FeS2 白鉄鉱"
  },
  {
    "id": "trirutile",
    "name": "トリルチル型",
    "formula": "AB₂X₆ · ZnSb₂O₆",
    "family": "rutile",
    "sg": "P4₂/mnm · 136",
    "desc": "ルチルのc軸を3倍にして金属サイトを1:2規則化する。同じ空間群型記号でも、並進対称性は減っている。",
    "packing": "ルチル型のc方向超構造",
    "coord": "A,B: 6",
    "link": "金属サイトの1:2配列。",
    "refs": [
      {
        "s": "M06",
        "p": 21,
        "sec": "§3.3・Fig.3.10"
      }
    ],
    "x": 700,
    "y": 255,
    "aliases": "trirutile ZnSb2O6 トリルチル",
    "note": "「空間群型が同じ＝同じ空間群」ではない。i3（同型部分群）の代表的な例。"
  },
  {
    "id": "anatase",
    "name": "アナターゼ型",
    "formula": "TiO₂",
    "family": "rutile",
    "sg": "I4₁/amd · 141",
    "desc": "同じTiO₆八面体を持つTiO₂多形だが、連結が異なる。Müllerは欠陥NaClの系統からの記述も示す。",
    "packing": "欠陥NaCl関連の別の見方",
    "coord": "Ti: 6",
    "link": "ルチルとは八面体の連結が異なる。",
    "refs": [
      {
        "s": "M13",
        "p": 178,
        "sec": "§13.3.1・Fig.13.9–10"
      }
    ],
    "x": 440,
    "y": 420,
    "aliases": "anatase TiO2 アナターゼ",
    "note": "ルチルとの線は同組成多形としての比較。ここでは直接の群–部分群関係を主張しない。"
  },
  {
    "id": "cdcl2",
    "name": "CdCl₂型",
    "formula": "層状MX₂",
    "family": "rutile",
    "sg": "層状の基本構造",
    "desc": "ccpハロゲン骨格のO孔の半分を層状に占有する。CdI₂型とは層ブロックの積層を比較できる。",
    "packing": "Clのccp",
    "coord": "Cd: 6",
    "link": "全占有層／空層が交互。",
    "refs": [
      {
        "s": "M06",
        "p": 198,
        "sec": "§17.3"
      },
      {
        "s": "W",
        "p": 55,
        "sec": "§1.17.6"
      }
    ],
    "x": 700,
    "y": 420,
    "occ": [
      0,
      0.5
    ],
    "host": "Cl / アニオン",
    "aliases": "CdCl2 cadmium chloride",
    "note": "表示上は「連結の比較」領域に置いた。ルチルから派生するという意味ではない。"
  }
];
