/** Added refinements and explicit structural comparisons. */
export const classificationNodes = [
  {
    "id": "camntio6",
    "name": "CaMnTi₂O₆ · 293 K",
    "formula": "CaMnTi₂O₆",
    "family": "order",
    "sg": "P4₂mc · 105",
    "desc": "CaとMnがAサイトで1:1に柱状規則配列する二重ペロブスカイト。Tiと一部のMnの極性変位を伴います。",
    "packing": "1:1柱状A/A′秩序＋TiO₆頂点共有網",
    "coord": "Ca: 高配位、Mn: 4（四面体・平面から変位）、Ti: 6",
    "link": "a⁺a⁺c⁻型回転を持つ非極性参照相からの極性歪み。",
    "refs": [
      {
        "s": "CM14",
        "sec": "293 K単結晶CIF・800 K Table S9"
      },
      {
        "s": "AL24",
        "sec": "構造と八面体回転"
      }
    ],
    "x": 180,
    "y": 700
  },
  {
    "id": "camntio6-ht",
    "name": "CaMnTi₂O₆ · 800 K",
    "formula": "CaMnTi₂O₆",
    "family": "order",
    "sg": "P4₂/nmc · 137",
    "desc": "約630 Kの強誘電転移より高温の常誘電相。Ca/Mnの柱状秩序は保たれ、Mn分裂位置は平均占有で表します。",
    "packing": "1:1柱状A/A′秩序＋TiO₆頂点共有網",
    "coord": "Mn: 四面体・分裂した4配位、Ti: 6",
    "link": "a⁺a⁺c⁻型の八面体回転。",
    "refs": [
      {
        "s": "CM14",
        "sec": "293 K単結晶CIF・800 K Table S9"
      },
      {
        "s": "AL24",
        "sec": "構造と八面体回転"
      }
    ],
    "x": 180,
    "y": 700
  },
  {
    "id": "coo2-o1",
    "name": "O1 · CoO₂ 骨格",
    "formula": "CoO₂",
    "family": "layers",
    "sg": "P−3m1 · 164",
    "desc": "空の層間を持つCoO₂のO1骨格。CdI₂型の理想模型で示します。",
    "packing": "AB酸素積層・1枚のCoO₂スラブ",
    "coord": "Co: 6、空の層間: 八面体候補",
    "link": "層間は八面体位置。O3とO2の比較に用いる端成分。",
    "refs": [
      {
        "s": "DL",
        "sec": "Delmasの配位・積層周期表記"
      },
      {
        "s": "CA03",
        "sec": "Figs. 2–3"
      },
      {
        "s": "YB13",
        "sec": "O2・O3・O4の実験比較"
      }
    ],
    "x": 180,
    "y": 700
  },
  {
    "id": "licoo2-o2",
    "name": "O2 · LiCoO₂",
    "formula": "LiCoO₂",
    "family": "layers",
    "sg": "P6₃mc · 186",
    "desc": "2枚のCoO₂スラブを繰り返す準安定多形。LiO₆はCoO₆と稜だけでなく面も共有します。",
    "packing": "ABAC酸素積層・2スラブ周期",
    "coord": "Li・Co: 6",
    "link": "O2とO3はLiの同じ八面体配位でも面共有関係が異なる。",
    "refs": [
      {
        "s": "DL",
        "sec": "Delmasの配位・積層周期表記"
      },
      {
        "s": "CA03",
        "sec": "Figs. 2–3"
      },
      {
        "s": "YB13",
        "sec": "O2・O3・O4の実験比較"
      }
    ],
    "x": 180,
    "y": 700
  },
  {
    "id": "licoo2-o4",
    "name": "O4 · LiCoO₂",
    "formula": "LiCoO₂",
    "family": "layers",
    "sg": "P6₃mc · 186",
    "desc": "O2型とO3型の局所積層が交互に現れる4スラブ周期。OP4前駆体からイオン交換で得られます。",
    "packing": "4スラブ周期・O2/O3型インターグロース",
    "coord": "Li・Co: 6",
    "link": "同じO配位を保ちながらスラブのレジストリが変化。",
    "refs": [
      {
        "s": "DL",
        "sec": "Delmasの配位・積層周期表記"
      },
      {
        "s": "CA03",
        "sec": "Figs. 2–3"
      },
      {
        "s": "YB13",
        "sec": "O2・O3・O4の実験比較"
      }
    ],
    "x": 180,
    "y": 700
  },
  {
    "id": "linacoo2-op4",
    "name": "OP4 · (Li,Na)CoO₂",
    "formula": "Li₀.₃₇Na₀.₃₁CoO₂",
    "family": "layers",
    "sg": "P6₃/mmc · 194",
    "desc": "Liの八面体層間とNaの三角柱層間が交互に並ぶ平均構造。OP4の数字4はCoO₂スラブの繰返し数です。",
    "packing": "O/P層間の交替・4スラブ周期",
    "coord": "Li: 八面体、Na: 三角柱、Co: 八面体",
    "link": "O3-LiCoO₂とP2-NaₓCoO₂を組み合わせた積層。",
    "refs": [
      {
        "s": "YB13",
        "sec": "OP4前駆体・Table 1"
      },
      {
        "s": "BE11",
        "sec": "OP4とOPP9"
      }
    ],
    "x": 180,
    "y": 700
  },
  {
    "id": "nacoo2-p2",
    "name": "P2 · Na₀.₆₀₉CoO₂",
    "formula": "Na₀.₆₀₉CoO₂",
    "family": "layers",
    "sg": "P6₃/mmc · 194",
    "desc": "Naが三角柱型層間の分裂位置を部分占有する二層型。未水和相の回折平均モデルです。",
    "packing": "ABBA相当の酸素積層・2スラブ周期",
    "coord": "Na: 三角柱、Co: 八面体",
    "link": "酸素積層は起点の変更・A/B/Cの置換を除いて表記。",
    "refs": [
      {
        "s": "DL",
        "sec": "P2型"
      },
      {
        "s": "CD",
        "sec": "Jorgensen et al., Phys. Rev. B 68, 214517 (2003) · COD 1532937",
        "url": "https://doi.org/10.1103/PhysRevB.68.214517"
      }
    ],
    "x": 180,
    "y": 700
  },
  {
    "id": "nacoo2-p3",
    "name": "P3 · Na₀.₆CoO₂",
    "formula": "Na₀.₆CoO₂",
    "family": "layers",
    "sg": "R3m · 160",
    "desc": "三角柱配位のNa層を持つ3スラブ周期の古典的P3精密化。",
    "packing": "ABBCCA相当の酸素積層・3スラブ周期",
    "coord": "Na: 三角柱、Co: 八面体",
    "link": "P2との差は層間配位ではなく積層周期とレジストリ。",
    "refs": [
      {
        "s": "DL",
        "sec": "P3型"
      },
      {
        "s": "CD",
        "sec": "Fouassier et al., J. Solid State Chem. 6, 532–537 (1973) · COD 1529124",
        "url": "https://www.crystallography.net/cod/1529124.html"
      }
    ],
    "x": 180,
    "y": 700
  },
  {
    "id": "licoo2-t2",
    "name": "T#2 · Li₀.₅₆CoO₂",
    "formula": "Li₀.₅₆CoO₂",
    "family": "layers",
    "sg": "Cmca · 64",
    "desc": "O2相から一つおきのCoO₂スラブが(1/3,1/6,0)だけ滑り、Liが強く歪んだ四面体位置を占める相。",
    "packing": "2スラブ周期・面内ずれを含む酸素面",
    "coord": "Li: 歪んだ4配位、Co: 6",
    "link": "単純な最密酸素面のA/B/C表示だけでは表せないT#2型。",
    "refs": [
      {
        "s": "CA04",
        "sec": "Table 2・中性子回折"
      },
      {
        "s": "CA03",
        "sec": "Fig. 3b"
      }
    ],
    "x": 180,
    "y": 700
  },
  {
    "id": "li2mno3",
    "name": "Li₂MnO₃ · ハニカム",
    "formula": "Li₂MnO₃",
    "family": "layers",
    "sg": "C2/m · 12",
    "desc": "Li[Li₁/₃Mn₂/₃]O₂と書ける層状岩塩誘導体。Mnが六員環を作り、その中心の八面体をLiが占めます。",
    "packing": "Li層とLi/Mnの1:2規則配列層",
    "coord": "Li・Mn: 6",
    "link": "MnO₆を稜共有する平面ハニカム。",
    "refs": [
      {
        "s": "CD",
        "sec": "A. Boulineau et al., Solid State Ionics 180, 1652–1659 (2010). DOI: 10.1016/j.ssi.2009.10.020 · COD 1514044",
        "url": "https://doi.org/10.1016/j.ssi.2009.10.020"
      }
    ],
    "x": 180,
    "y": 700
  },
  {
    "id": "na2iro3",
    "name": "Na₂IrO₃ · ハニカム",
    "formula": "Na₂IrO₃",
    "family": "layers",
    "sg": "C2/m · 12",
    "desc": "Na[Na₁/₃Ir₂/₃]O₂型のIrハニカム。300 Kの修正された単結晶構造を採用します。",
    "packing": "Na層とNa/Irの1:2規則配列層",
    "coord": "Na・Ir: 6",
    "link": "IrO₆の稜共有六員環。β/γ-Li₂IrO₃の3D網とは区別。",
    "refs": [
      {
        "s": "CH12",
        "sec": "Table I・300 K"
      }
    ],
    "x": 180,
    "y": 700
  },
  {
    "id": "na2co2teo6",
    "name": "Na₂Co₂TeO₆ · P2ハニカム",
    "formula": "Na₂Co₂TeO₆",
    "family": "layers",
    "sg": "P6₃22 · 182",
    "desc": "Coのハニカムの中心にTeを持つ二層型。Naは三角柱層間の3種類の位置を部分占有します。",
    "packing": "Co/Te = 2:1秩序層・P2積層",
    "coord": "Co・Te/Sb: 6、Na: 層間配位",
    "link": "稜共有八面体層内の2:1秩序。",
    "refs": [
      {
        "s": "VC07",
        "sec": "Tables 1–2・中性子回折"
      }
    ],
    "x": 180,
    "y": 700
  },
  {
    "id": "na3co2sbo6",
    "name": "Na₃Co₂SbO₆ · 単斜ハニカム",
    "formula": "Na₃Co₂SbO₆",
    "family": "layers",
    "sg": "C2/m · 12",
    "desc": "Coのハニカムの中心をSbが占める単斜晶。一層のハニカムを持つ結晶学的セルをNa₂Co₂TeO₆と比較します。",
    "packing": "Co/Sb = 2:1秩序層・単斜セル",
    "coord": "Co・Te/Sb: 6、Na: 層間配位",
    "link": "稜共有八面体層内の2:1秩序。",
    "refs": [
      {
        "s": "VC07",
        "sec": "Tables 1–2・中性子回折"
      }
    ],
    "x": 180,
    "y": 700
  },
  {
    "id": "y2ti2o7",
    "name": "Y₂Ti₂O₇ · チタン酸塩",
    "formula": "Y₂Ti₂O₇",
    "family": "fluorite",
    "sg": "Fd−3m · 227",
    "desc": "典型的なA³⁺₂B⁴⁺₂O₇パイロクロア。Y/Tiの相互占有と酸素非化学量論を含む平均精密化を採用。",
    "packing": "A₂B₂O₆O′・秩序化した蛍石関連網",
    "coord": "A: 8、B: 6",
    "link": "Bサイトが頂点共有四面体のパイロクロア網を構成。",
    "refs": [
      {
        "s": "GI",
        "sec": "§5.8・パイロクロア",
        "p": 102
      },
      {
        "s": "CD",
        "sec": "M. Takano et al., J. Ceram. Soc. Jpn. 129, 22–31 (2021) · COD 1559965",
        "url": "https://www.crystallography.net/cod/1559965.html"
      }
    ],
    "x": 180,
    "y": 700
  },
  {
    "id": "la2zr2o7",
    "name": "La₂Zr₂O₇ · ジルコン酸塩",
    "formula": "La₂Zr₂O₇",
    "family": "fluorite",
    "sg": "Fd−3m · 227",
    "desc": "チタン酸塩より大きいZrO₆骨格を持つA³⁺₂B⁴⁺₂O₇。欠陥蛍石との秩序・無秩序比較の基準。",
    "packing": "A₂B₂O₆O′・秩序化した蛍石関連網",
    "coord": "A: 8、B: 6",
    "link": "Bサイトが頂点共有四面体のパイロクロア網を構成。",
    "refs": [
      {
        "s": "GI",
        "sec": "§5.8・パイロクロア",
        "p": 102
      },
      {
        "s": "CD",
        "sec": "K. R. Whittle et al., J. Solid State Chem. 182, 442–450 (2009) · COD 1528994",
        "url": "https://www.crystallography.net/cod/1528994.html"
      }
    ],
    "x": 180,
    "y": 700
  },
  {
    "id": "cd2re2o7",
    "name": "Cd₂Re₂O₇ · レニウム酸塩",
    "formula": "Cd₂Re₂O₇",
    "family": "fluorite",
    "sg": "Fd−3m · 227",
    "desc": "A²⁺₂B⁵⁺₂O₇の組合せ。立方晶の原著精密化を採用し、低温の対称性低下相とは区別します。",
    "packing": "A₂B₂O₆O′・秩序化した蛍石関連網",
    "coord": "A: 8、B: 6",
    "link": "Bサイトが頂点共有四面体のパイロクロア網を構成。",
    "refs": [
      {
        "s": "GI",
        "sec": "§5.8・パイロクロア",
        "p": 102
      },
      {
        "s": "CD",
        "sec": "P. C. Donohue et al., Inorg. Chem. 4, 1152–1153 (1965) · COD 4344503",
        "url": "https://www.crystallography.net/cod/4344503.html"
      }
    ],
    "x": 180,
    "y": 700
  },
  {
    "id": "kos2o6",
    "name": "KOs₂O₆ · βパイロクロア",
    "formula": "KOs₂O₆",
    "family": "frameworks",
    "sg": "Fd−3m · 227",
    "desc": "AOs₂O₆型。通常のA₂B₂O₆O′でAが占める位置とは異なるケージ位置をアルカリ金属が占めます。",
    "packing": "OsO₆頂点共有網＋アルカリ金属ケージ",
    "coord": "Os: 6、K/Rb: ケージ内高配位",
    "link": "Osがパイロクロア網、O′を持たないβ型。",
    "refs": [
      {
        "s": "CD",
        "sec": "J.-I. Yamaura et al., J. Solid State Chem. 179, 336–340 (2006) · COD 1529026",
        "url": "https://www.crystallography.net/cod/1529026.html"
      }
    ],
    "x": 180,
    "y": 700
  },
  {
    "id": "rbos2o6",
    "name": "RbOs₂O₆ · βパイロクロア",
    "formula": "RbOs₂O₆",
    "family": "frameworks",
    "sg": "Fd−3m · 227",
    "desc": "AOs₂O₆型。通常のA₂B₂O₆O′でAが占める位置とは異なるケージ位置をアルカリ金属が占めます。",
    "packing": "OsO₆頂点共有網＋アルカリ金属ケージ",
    "coord": "Os: 6、K/Rb: ケージ内高配位",
    "link": "Osがパイロクロア網、O′を持たないβ型。",
    "refs": [
      {
        "s": "CD",
        "sec": "R. Galati et al., J. Mater. Chem. 17, 160–164 (2007). DOI: 10.1039/b613083f · COD 7202515",
        "url": "https://www.crystallography.net/cod/7202515.html"
      }
    ],
    "x": 180,
    "y": 700
  },
  {
    "id": "al2cu",
    "name": "Al₂Cu · C16",
    "formula": "Al₂Cu",
    "family": "metal",
    "sg": "I4/mcm · 140",
    "desc": "Galassoの第11章で扱うCuAl₂型。Cuの面とAlの面から記述する金属間化合物です。",
    "packing": "Cu–Cu対＋回転したAl正方形",
    "coord": "金属間化合物の多配位",
    "link": "原子面による層の区分。van der Waals層状構造とは異なる。",
    "refs": [
      {
        "s": "GI",
        "sec": "§11.3・CuAl₂型",
        "p": 254
      },
      {
        "s": "AF",
        "sec": "A2B_tI12_140_h_a-001",
        "url": "https://aflow.org/p/A2B_tI12_140_h_a-001/"
      }
    ],
    "x": 180,
    "y": 700
  }
];
export const classificationEdges = [
  {
    "id": "class-perov-camntio6-ht",
    "a": "perov",
    "b": "camntio6-ht",
    "kind": "ordering",
    "label": "A/A′ 1:1柱状秩序",
    "desc": "TiO₆の回転とCa/Mnの柱状秩序。単純な元素置換のみを表す矢印ではありません。",
    "refs": [
      {
        "s": "CM14",
        "sec": "293 K単結晶CIF・800 K Table S9"
      },
      {
        "s": "AL24",
        "sec": "構造と八面体回転"
      }
    ]
  },
  {
    "id": "class-camntio6-ht-camntio6",
    "a": "camntio6-ht",
    "b": "camntio6",
    "kind": "distortion",
    "label": "極性変位",
    "desc": "高温の中心対称相と293 Kの強誘電相を比較。転移温度は約630 K。",
    "refs": [
      {
        "s": "CM14",
        "sec": "293 K単結晶CIF・800 K Table S9"
      },
      {
        "s": "AL24",
        "sec": "構造と八面体回転"
      }
    ]
  },
  {
    "id": "class-ccto-camntio6",
    "a": "ccto",
    "b": "camntio6",
    "kind": "analogy",
    "label": "A秩序 1:3 / 1:1",
    "desc": "CaCu₃Ti₄O₁₂とCaMnTi₂O₆ではAサイトの秩序比・回転・Mn/Cu配位が異なります。",
    "refs": [
      {
        "s": "CM14",
        "sec": "293 K単結晶CIF・800 K Table S9"
      },
      {
        "s": "AL24",
        "sec": "構造と八面体回転"
      }
    ],
    "undirected": true
  },
  {
    "id": "class-licoo2-coo2-o1",
    "a": "licoo2",
    "b": "coo2-o1",
    "kind": "stacking",
    "label": "層間配位・周期",
    "desc": "Delmas表記による比較。元素・組成・相安定領域が異なるものも含み、直接の相転移を意味しません。",
    "refs": [
      {
        "s": "DL",
        "sec": "Delmasの配位・積層周期表記"
      },
      {
        "s": "CA03",
        "sec": "Figs. 2–3"
      },
      {
        "s": "YB13",
        "sec": "O2・O3・O4の実験比較"
      }
    ],
    "undirected": true
  },
  {
    "id": "class-licoo2-licoo2-o2",
    "a": "licoo2",
    "b": "licoo2-o2",
    "kind": "stacking",
    "label": "層間配位・周期",
    "desc": "Delmas表記による比較。元素・組成・相安定領域が異なるものも含み、直接の相転移を意味しません。",
    "refs": [
      {
        "s": "DL",
        "sec": "Delmasの配位・積層周期表記"
      },
      {
        "s": "CA03",
        "sec": "Figs. 2–3"
      },
      {
        "s": "YB13",
        "sec": "O2・O3・O4の実験比較"
      }
    ],
    "undirected": true
  },
  {
    "id": "class-licoo2-licoo2-o4",
    "a": "licoo2",
    "b": "licoo2-o4",
    "kind": "stacking",
    "label": "層間配位・周期",
    "desc": "Delmas表記による比較。元素・組成・相安定領域が異なるものも含み、直接の相転移を意味しません。",
    "refs": [
      {
        "s": "DL",
        "sec": "Delmasの配位・積層周期表記"
      },
      {
        "s": "CA03",
        "sec": "Figs. 2–3"
      },
      {
        "s": "YB13",
        "sec": "O2・O3・O4の実験比較"
      }
    ],
    "undirected": true
  },
  {
    "id": "class-licoo2-nacoo2-p2",
    "a": "licoo2",
    "b": "nacoo2-p2",
    "kind": "stacking",
    "label": "層間配位・周期",
    "desc": "Delmas表記による比較。元素・組成・相安定領域が異なるものも含み、直接の相転移を意味しません。",
    "refs": [
      {
        "s": "DL",
        "sec": "Delmasの配位・積層周期表記"
      },
      {
        "s": "CA03",
        "sec": "Figs. 2–3"
      },
      {
        "s": "YB13",
        "sec": "O2・O3・O4の実験比較"
      }
    ],
    "undirected": true
  },
  {
    "id": "class-licoo2-nacoo2-p3",
    "a": "licoo2",
    "b": "nacoo2-p3",
    "kind": "stacking",
    "label": "層間配位・周期",
    "desc": "Delmas表記による比較。元素・組成・相安定領域が異なるものも含み、直接の相転移を意味しません。",
    "refs": [
      {
        "s": "DL",
        "sec": "Delmasの配位・積層周期表記"
      },
      {
        "s": "CA03",
        "sec": "Figs. 2–3"
      },
      {
        "s": "YB13",
        "sec": "O2・O3・O4の実験比較"
      }
    ],
    "undirected": true
  },
  {
    "id": "class-licoo2-linacoo2-op4",
    "a": "licoo2",
    "b": "linacoo2-op4",
    "kind": "stacking",
    "label": "層間配位・周期",
    "desc": "Delmas表記による比較。元素・組成・相安定領域が異なるものも含み、直接の相転移を意味しません。",
    "refs": [
      {
        "s": "DL",
        "sec": "Delmasの配位・積層周期表記"
      },
      {
        "s": "CA03",
        "sec": "Figs. 2–3"
      },
      {
        "s": "YB13",
        "sec": "O2・O3・O4の実験比較"
      }
    ],
    "undirected": true
  },
  {
    "id": "class-linacoo2-op4-licoo2-o4",
    "a": "linacoo2-op4",
    "b": "licoo2-o4",
    "kind": "stacking",
    "label": "Na→Liイオン交換",
    "desc": "OP4前駆体から得られるO4型。実試料のLi量・積層欠陥は原著を参照。",
    "refs": [
      {
        "s": "YB13",
        "sec": "イオン交換合成"
      }
    ]
  },
  {
    "id": "class-licoo2-o2-licoo2-t2",
    "a": "licoo2-o2",
    "b": "licoo2-t2",
    "kind": "stacking",
    "label": "脱Liとスラブ滑り",
    "desc": "一つおきのCoO₂スラブを(1/3,1/6,0)並進し、四面体Li位置が現れます。",
    "refs": [
      {
        "s": "CA04",
        "sec": "構造解析"
      }
    ]
  },
  {
    "id": "class-licoo2-li2mno3",
    "a": "licoo2",
    "b": "li2mno3",
    "kind": "ordering",
    "label": "層内1:2秩序",
    "desc": "岩塩型の陽イオン層でMnの2/3副格子がハニカム、Liが六員環中心を占めます。",
    "refs": [
      {
        "s": "CD",
        "sec": "A. Boulineau et al., Solid State Ionics 180, 1652–1659 (2010). DOI: 10.1016/j.ssi.2009.10.020 · COD 1514044",
        "url": "https://doi.org/10.1016/j.ssi.2009.10.020"
      }
    ]
  },
  {
    "id": "class-li2mno3-na2iro3",
    "a": "li2mno3",
    "b": "na2iro3",
    "kind": "analogy",
    "label": "ハニカム層の比較",
    "desc": "層内の2:1秩序を共有します。六員環を構成する原子・中心原子・層間配位を分けて比較。",
    "refs": [
      {
        "s": "CH12",
        "sec": "ハニカムIr層"
      },
      {
        "s": "VC07",
        "sec": "ハニカムCo層"
      }
    ],
    "undirected": true
  },
  {
    "id": "class-li2mno3-li2sno3-beta",
    "a": "li2mno3",
    "b": "li2sno3-beta",
    "kind": "analogy",
    "label": "ハニカム層の比較",
    "desc": "層内の2:1秩序を共有します。六員環を構成する原子・中心原子・層間配位を分けて比較。",
    "refs": [
      {
        "s": "CH12",
        "sec": "ハニカムIr層"
      },
      {
        "s": "VC07",
        "sec": "ハニカムCo層"
      }
    ],
    "undirected": true
  },
  {
    "id": "class-li2mno3-na2co2teo6",
    "a": "li2mno3",
    "b": "na2co2teo6",
    "kind": "analogy",
    "label": "ハニカム層の比較",
    "desc": "層内の2:1秩序を共有します。六員環を構成する原子・中心原子・層間配位を分けて比較。",
    "refs": [
      {
        "s": "CH12",
        "sec": "ハニカムIr層"
      },
      {
        "s": "VC07",
        "sec": "ハニカムCo層"
      }
    ],
    "undirected": true
  },
  {
    "id": "class-li2mno3-na3co2sbo6",
    "a": "li2mno3",
    "b": "na3co2sbo6",
    "kind": "analogy",
    "label": "ハニカム層の比較",
    "desc": "層内の2:1秩序を共有します。六員環を構成する原子・中心原子・層間配位を分けて比較。",
    "refs": [
      {
        "s": "CH12",
        "sec": "ハニカムIr層"
      },
      {
        "s": "VC07",
        "sec": "ハニカムCo層"
      }
    ],
    "undirected": true
  },
  {
    "id": "class-na2co2teo6-na3co2sbo6",
    "a": "na2co2teo6",
    "b": "na3co2sbo6",
    "kind": "stacking",
    "label": "二層六方 / 単斜",
    "desc": "Coのハニカム層を持つ2つの異なる酸化物。積層・層間配位・中心元素を比較。",
    "refs": [
      {
        "s": "VC07",
        "sec": "Tables 1–2"
      }
    ],
    "undirected": true
  },
  {
    "id": "class-pyrochlore-y2ti2o7",
    "a": "pyrochlore",
    "b": "y2ti2o7",
    "kind": "analogy",
    "label": "A₂B₂O₇の組成系列",
    "desc": "標準型A₂B₂O₆O′の化学系列。価数の組合せと酸素位置を比較。",
    "refs": [
      {
        "s": "GI",
        "sec": "§5.8・パイロクロア",
        "p": 102
      }
    ],
    "undirected": true
  },
  {
    "id": "class-pyrochlore-la2zr2o7",
    "a": "pyrochlore",
    "b": "la2zr2o7",
    "kind": "analogy",
    "label": "A₂B₂O₇の組成系列",
    "desc": "標準型A₂B₂O₆O′の化学系列。価数の組合せと酸素位置を比較。",
    "refs": [
      {
        "s": "GI",
        "sec": "§5.8・パイロクロア",
        "p": 102
      }
    ],
    "undirected": true
  },
  {
    "id": "class-pyrochlore-cd2re2o7",
    "a": "pyrochlore",
    "b": "cd2re2o7",
    "kind": "analogy",
    "label": "A₂B₂O₇の組成系列",
    "desc": "標準型A₂B₂O₆O′の化学系列。価数の組合せと酸素位置を比較。",
    "refs": [
      {
        "s": "GI",
        "sec": "§5.8・パイロクロア",
        "p": 102
      }
    ],
    "undirected": true
  },
  {
    "id": "class-csos2o6-kos2o6",
    "a": "csos2o6",
    "b": "kos2o6",
    "kind": "analogy",
    "label": "β型 AOs₂O₆",
    "desc": "K/Rbは原著座標、既存のCs模型は模式構造。模型の精度区分を保って比較。",
    "refs": [
      {
        "s": "CD",
        "sec": "J.-I. Yamaura et al., J. Solid State Chem. 179, 336–340 (2006) · COD 1529026",
        "url": "https://www.crystallography.net/cod/1529026.html"
      }
    ],
    "undirected": true
  },
  {
    "id": "class-csos2o6-rbos2o6",
    "a": "csos2o6",
    "b": "rbos2o6",
    "kind": "analogy",
    "label": "β型 AOs₂O₆",
    "desc": "K/Rbは原著座標、既存のCs模型は模式構造。模型の精度区分を保って比較。",
    "refs": [
      {
        "s": "CD",
        "sec": "R. Galati et al., J. Mater. Chem. 17, 160–164 (2007). DOI: 10.1039/b613083f · COD 7202515",
        "url": "https://www.crystallography.net/cod/7202515.html"
      }
    ],
    "undirected": true
  },
  {
    "id": "class-graphite-al2cu",
    "a": "graphite",
    "b": "al2cu",
    "kind": "analogy",
    "label": "Galasso 第11章",
    "desc": "六員環層とCu/Al原子面を同じ章で扱う、書籍の記述上の対応。層の結合様式は異なります。",
    "refs": [
      {
        "s": "GI",
        "sec": "Table 11.0・§11.3",
        "p": 252
      }
    ],
    "undirected": true
  }
];
