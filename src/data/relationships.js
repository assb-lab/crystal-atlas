/** Curated atlas edges. Source wording and page references retained from v1.0. */
export const edges = [
  {
    "id": "e1",
    "a": "fcc",
    "b": "nacl",
    "kind": "occupation",
    "label": "O孔を全占有",
    "desc": "ccp粒子をアニオンとして読み替え、全八面体孔をカチオンで埋める。空間群型はFm−3mのまま。",
    "refs": [
      {
        "s": "M06",
        "p": 196,
        "sec": "§17.3"
      }
    ]
  },
  {
    "id": "e2",
    "a": "fcc",
    "b": "zns",
    "kind": "occupation",
    "label": "T孔を1/2占有",
    "desc": "二通りのT孔集合の一方を占有して、四面体配位のZnS型にする。",
    "refs": [
      {
        "s": "M06",
        "p": 206,
        "sec": "§17.5"
      }
    ]
  },
  {
    "id": "e3",
    "a": "fcc",
    "b": "antifluorite",
    "kind": "occupation",
    "label": "T孔を全占有",
    "desc": "アニオンのccp骨格に全T孔を埋める。骨格がカチオンなら蛍石型の記述になる。",
    "refs": [
      {
        "s": "M06",
        "p": 206,
        "sec": "§17.5"
      }
    ]
  },
  {
    "id": "e4",
    "a": "fcc",
    "b": "fluorite",
    "kind": "occupation",
    "label": "カチオンccp＋T全占有",
    "desc": "Caを骨格、FをT孔占有原子として読む。同じfccからでも、元素の役割を区別する。",
    "refs": [
      {
        "s": "M13",
        "p": 180,
        "sec": "§13.3.2"
      }
    ]
  },
  {
    "id": "e5",
    "a": "fcc",
    "b": "spinel",
    "kind": "occupation",
    "label": "T 1/8 ＋ O 1/2",
    "desc": "占有数だけでなく、占有するサイトの規則配列とアニオン変位がスピネルを決める。",
    "refs": [
      {
        "s": "W",
        "p": 80,
        "sec": "§1.17.9"
      }
    ]
  },
  {
    "id": "e6",
    "a": "fcc",
    "b": "l12",
    "kind": "symmetry",
    "label": "k4 · 3:1規則化",
    "desc": "面心並進を失い、fccの4aが角の1aと面心の3cに分かれる。",
    "refs": [
      {
        "s": "M13",
        "p": 7,
        "sec": "Fig.1.4"
      }
    ],
    "index": "k4",
    "basis": "セル基底を保つ：a′=a, b′=b, c′=c。F→Pで原始胞体積は4倍。",
    "split": "4a → 1a(Au) + 3c(Cu)",
    "strict": true
  },
  {
    "id": "e7",
    "a": "fcc",
    "b": "l10",
    "kind": "ordering",
    "label": "1:1の層状規則化",
    "desc": "Cu/Auを層状に配列し正方歪みを許す。ここでは詳細な群–部分群連鎖を省略する。",
    "refs": [
      {
        "s": "M06",
        "p": 158,
        "sec": "Fig.15.1"
      },
      {
        "s": "M06",
        "p": 159,
        "sec": "§15.2"
      }
    ]
  },
  {
    "id": "e8",
    "a": "diamond",
    "b": "zns",
    "kind": "symmetry",
    "label": "t2 · 二元素で色分け",
    "desc": "等価なダイヤモンドの原子位置を二種に分ける。結合網を保つ概念的な構造派生であり、CをZn/Sに実際に置換する反応ではない。",
    "refs": [
      {
        "s": "M13",
        "p": 4,
        "sec": "Fig.1.1"
      },
      {
        "s": "M13",
        "p": 5,
        "sec": "§1.2"
      }
    ],
    "index": "t2",
    "basis": "同じ立方基底。原著Fig.1.1の原点設定に従う。",
    "split": "8a → 4a + 4c",
    "strict": true
  },
  {
    "id": "e9",
    "a": "nacl",
    "b": "nbO",
    "kind": "symmetry",
    "label": "k4 · 両副格子に空孔",
    "desc": "カチオン・アニオンのそれぞれ1/4を空にする規則的な派生。",
    "refs": [
      {
        "s": "M13",
        "p": 180,
        "sec": "Fig.13.11"
      }
    ],
    "index": "k4",
    "basis": "同じ慣用立方セル。F→P。",
    "split": "4a → 1a(□)+3c(Nb)；4b → 1b(□)+3d(O)",
    "strict": true
  },
  {
    "id": "e10",
    "a": "spinel",
    "b": "inverse",
    "kind": "ordering",
    "label": "T/O間の元素再配分",
    "desc": "サイトの総占有数を変えず、A/Bの振り分けを変える。平均Fd−3mを保つ場合もあり、反転だけを対称性低下と同一視しない。",
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
    ]
  },
  {
    "id": "e11",
    "a": "fcc",
    "b": "hcp",
    "kind": "stacking",
    "label": "ABC ↔ AB",
    "desc": "最密層の積層の比較。両者を直接の群–部分群関係とする線ではない。",
    "refs": [
      {
        "s": "W",
        "p": 25,
        "sec": "§1.10"
      }
    ],
    "undirected": true
  },
  {
    "id": "e12",
    "a": "hcp",
    "b": "nias",
    "kind": "occupation",
    "label": "O孔を全占有",
    "desc": "hcpのAs骨格のO孔を埋める。Niは八面体、Asは三角柱配位になる。",
    "refs": [
      {
        "s": "M06",
        "p": 196,
        "sec": "§17.3"
      }
    ]
  },
  {
    "id": "e13",
    "a": "hcp",
    "b": "wurtzite",
    "kind": "occupation",
    "label": "T孔を1/2占有",
    "desc": "hcp骨格のT孔を規則的に半占有する。",
    "refs": [
      {
        "s": "M06",
        "p": 206,
        "sec": "§17.5"
      }
    ]
  },
  {
    "id": "e14",
    "a": "hcp",
    "b": "olivine",
    "kind": "occupation",
    "label": "T 1/8 ＋ O 1/2",
    "desc": "近似hcp酸素骨格のT/O孔を規則的に占有する。",
    "refs": [
      {
        "s": "W",
        "p": 83,
        "sec": "§1.17.10"
      }
    ]
  },
  {
    "id": "e15",
    "a": "nias",
    "b": "cdi2",
    "kind": "symmetry",
    "label": "t2 · 金属層を交互に空に",
    "desc": "P6₃/mmcの金属2aを二つに分け、一方を空にする。",
    "refs": [
      {
        "s": "M06",
        "p": 219,
        "sec": "§18.3"
      },
      {
        "s": "M13",
        "p": 170,
        "sec": "§13.2.1"
      }
    ],
    "index": "t2",
    "basis": "hcpの基本セルを拡大しない。",
    "split": "金属2a → 1a + 1b（片方が空孔）",
    "strict": true
  },
  {
    "id": "e16",
    "a": "cdi2",
    "b": "biI3",
    "kind": "occupation",
    "label": "占有層に1/3の空孔",
    "desc": "全体のO孔占有率は1/2から1/3へ。ハニカム配列を作り、周期・積層も整える。",
    "refs": [
      {
        "s": "M06",
        "p": 201,
        "sec": "§17.3"
      }
    ]
  },
  {
    "id": "e17",
    "a": "nias",
    "b": "corundum",
    "kind": "occupation",
    "label": "O孔を2/3に規則占有",
    "desc": "金属サイトの1/3を規則的に空にする。変位も含む概念的な導出で、ここでは完全な対称性連鎖を省略。",
    "refs": [
      {
        "s": "W",
        "p": 85,
        "sec": "§1.17.11"
      },
      {
        "s": "M13",
        "p": 169,
        "sec": "Fig.13.1"
      }
    ]
  },
  {
    "id": "e18",
    "a": "corundum",
    "b": "ilmenite",
    "kind": "symmetry",
    "label": "t2 · カチオン規則化",
    "desc": "R−3cからR−3へ。等価なカチオン位置をFeとTiに分ける。",
    "refs": [
      {
        "s": "M13",
        "p": 169,
        "sec": "Fig.13.1"
      },
      {
        "s": "M13",
        "p": 172,
        "sec": "§13.2.1"
      }
    ],
    "index": "t2",
    "basis": "六方軸表示の同じR格子を用いる。",
    "split": "カチオン12c → 6c(Fe) + 6c(Ti)",
    "strict": true
  },
  {
    "id": "e19",
    "a": "corundum",
    "b": "linbo3",
    "kind": "symmetry",
    "label": "t2 · 別の規則化と極性",
    "desc": "R−3cからR3cへの別の枝。カチオン分布がイルメナイトと異なる。",
    "refs": [
      {
        "s": "M13",
        "p": 169,
        "sec": "Fig.13.1"
      },
      {
        "s": "M13",
        "p": 172,
        "sec": "§13.2.1"
      }
    ],
    "index": "t2",
    "basis": "同じR格子；原点設定は原著Fig.13.1参照。",
    "split": "一つのカチオン軌道 → 二つの独立した6a軌道",
    "strict": true
  },
  {
    "id": "e20",
    "a": "nias",
    "b": "mnp",
    "kind": "symmetry",
    "label": "t3 → k2 · 歪み",
    "desc": "原著はP6₃/mmc → Cmcm → Pmcnの連鎖を示す。本図では中間の対称模型を折り畳んでいる。",
    "refs": [
      {
        "s": "M06",
        "p": 217,
        "sec": "§18.3"
      },
      {
        "s": "M06",
        "p": 218,
        "sec": "Fig.18.4"
      }
    ],
    "index": "t3 × k2（合成指数6）",
    "basis": "第一段：a, a+2b, c。第二段はC心の除去と原点変更。原点移動の数値は未転記。",
    "split": "原子軌道の分裂を必要とせず、許される原子変位が増える。",
    "strict": true,
    "warning": "中間ノードを省略した連鎖。単一の最大部分群ステップではない。"
  },
  {
    "id": "e21",
    "a": "corundum",
    "b": "rhf3",
    "kind": "occupation",
    "label": "O孔占有を補集合へ",
    "desc": "O孔の占有と空孔を入れ替える形式的比較。全体の対称性記号が同じでも、面・稜共有と頂点共有の違いは残る。",
    "refs": [
      {
        "s": "M13",
        "p": 170,
        "sec": "§13.2.1"
      }
    ],
    "undirected": true
  },
  {
    "id": "e22",
    "a": "spinel",
    "b": "olivine",
    "kind": "analogy",
    "label": "同じT/O占有割合",
    "desc": "T孔1/8・O孔1/2が共通。ccp系とhcp系の骨格・サイト配置は異なる。",
    "refs": [
      {
        "s": "W",
        "p": 83,
        "sec": "§1.17.10"
      }
    ],
    "undirected": true
  },
  {
    "id": "e23",
    "a": "zns",
    "b": "wurtzite",
    "kind": "stacking",
    "label": "四面体骨格の積層差",
    "desc": "四面体配位を共通に持つ、ccp系とhcp系の比較。",
    "refs": [
      {
        "s": "M06",
        "p": 206,
        "sec": "§17.5"
      }
    ],
    "undirected": true
  },
  {
    "id": "e24",
    "a": "bcc",
    "b": "b2",
    "kind": "symmetry",
    "label": "k2 · 角／体心を区別",
    "desc": "角と体心の原子を区別し、体心並進を失う。",
    "refs": [
      {
        "s": "SP",
        "p": 249,
        "sec": "§2"
      },
      {
        "s": "M06",
        "p": 160,
        "sec": "§15.3"
      }
    ],
    "index": "k2",
    "basis": "同じ立方基底。I→Pで原始胞体積は2倍。",
    "split": "2a → 1a + 1b",
    "strict": true
  },
  {
    "id": "e25",
    "a": "b2",
    "b": "heusler",
    "kind": "ordering",
    "label": "超セルで追加の規則化",
    "desc": "セル辺を2倍にした記述で、四つのfcc副格子に三元素を配列する。詳細な原子対応を含む厳密な矢印とは分けて表示。",
    "refs": [
      {
        "s": "M06",
        "p": 160,
        "sec": "§15.3"
      },
      {
        "s": "M06",
        "p": 161,
        "sec": "Fig.15.3"
      }
    ]
  },
  {
    "id": "e26",
    "a": "b2",
    "b": "d03",
    "kind": "ordering",
    "label": "3:1の超構造",
    "desc": "四副格子をAl/Fe/Fe/Feに色分けする。",
    "refs": [
      {
        "s": "M06",
        "p": 161,
        "sec": "Fig.15.3"
      }
    ]
  },
  {
    "id": "e27",
    "a": "b2",
    "b": "natl",
    "kind": "ordering",
    "label": "二種類のダイヤモンド網",
    "desc": "四副格子への色分けとしてbcc由来の記述に含める。",
    "refs": [
      {
        "s": "M06",
        "p": 161,
        "sec": "Fig.15.3"
      }
    ]
  },
  {
    "id": "e28",
    "a": "heusler",
    "b": "half",
    "kind": "occupation",
    "label": "4副格子中1つを空に",
    "desc": "四副格子記述で、全占有型と三副格子占有型を比較。元素名・副格子のラベルは読み替える。",
    "refs": [
      {
        "s": "M06",
        "p": 161,
        "sec": "Fig.15.3"
      }
    ]
  },
  {
    "id": "e29",
    "a": "diamond",
    "b": "natl",
    "kind": "analogy",
    "label": "二つのダイヤモンド網",
    "desc": "NaTlの二つの部分構造とダイヤモンドの結合網の関係。母結晶全体の直接の部分群関係ではない。",
    "refs": [
      {
        "s": "M06",
        "p": 161,
        "sec": "本文"
      }
    ],
    "undirected": true
  },
  {
    "id": "e30",
    "a": "bcc",
    "b": "bct",
    "kind": "symmetry",
    "label": "t3 · 正方歪み",
    "desc": "立方対称性を正方対称性へ落とす。",
    "refs": [
      {
        "s": "SP",
        "p": 251,
        "sec": "Fig.3"
      }
    ],
    "index": "t3",
    "basis": "a′=a, b′=b, c′=c（歪み前の対応基底）",
    "split": "bccの2aはbctの2a；空の6bは4c+2bに分かれる。",
    "strict": true
  },
  {
    "id": "e31",
    "a": "bct",
    "b": "mosi2",
    "kind": "ordering",
    "label": "c方向の3倍周期",
    "desc": "正方晶bcc関連骨格のAB₂規則超構造として整理する。",
    "refs": [
      {
        "s": "SP",
        "p": 249,
        "sec": "§2"
      },
      {
        "s": "SP",
        "p": 251,
        "sec": "Fig.3のMoSi₂型部分構造"
      }
    ]
  },
  {
    "id": "e32",
    "a": "mosi2",
    "b": "cuzr2",
    "kind": "analogy",
    "label": "isopointal",
    "desc": "I4/mmm・tI6・Wyckoff列eaの一致。軸比、内部座標、結合の違いは消えない。",
    "refs": [
      {
        "s": "SP",
        "p": 250,
        "sec": "§2・Fig.1"
      }
    ],
    "undirected": true
  },
  {
    "id": "e33",
    "a": "mosi2",
    "b": "cac2",
    "kind": "analogy",
    "label": "isopointal",
    "desc": "I4/mmm・tI6・Wyckoff列eaの一致。軸比、内部座標、結合の違いは消えない。",
    "refs": [
      {
        "s": "SP",
        "p": 250,
        "sec": "§2・Fig.1"
      }
    ],
    "undirected": true
  },
  {
    "id": "e34",
    "a": "mosi2",
    "b": "xef2",
    "kind": "analogy",
    "label": "isopointal",
    "desc": "I4/mmm・tI6・Wyckoff列eaの一致。軸比、内部座標、結合の違いは消えない。",
    "refs": [
      {
        "s": "SP",
        "p": 250,
        "sec": "§2・Fig.1"
      }
    ],
    "undirected": true
  },
  {
    "id": "e35",
    "a": "fluorite",
    "b": "antifluorite",
    "kind": "antitype",
    "label": "カチオン／アニオン反転",
    "desc": "同じサイト幾何を、元素の役割を反転して読む。群–部分群の対称性低下ではない。",
    "refs": [
      {
        "s": "M06",
        "p": 10,
        "sec": "§2.4"
      }
    ],
    "undirected": true
  },
  {
    "id": "e36",
    "a": "fluorite",
    "b": "pyrochlore",
    "kind": "ordering",
    "label": "カチオン＋空孔の秩序化",
    "desc": "基準蛍石に対してアニオン1/8欠損、カチオン規則化、2×2×2超構造と変位を組み合わせる。",
    "refs": [
      {
        "s": "W",
        "p": 87,
        "sec": "§1.17.12"
      },
      {
        "s": "W",
        "p": 89,
        "sec": "Fig.1.48"
      }
    ]
  },
  {
    "id": "e37",
    "a": "pyrochlore",
    "b": "defectfluorite",
    "kind": "ordering",
    "label": "秩序を平均化",
    "desc": "局所の配列を平均化した欠陥蛍石模型との比較。ここでは特定試料の温度誘起相転移を意味しない。",
    "refs": [
      {
        "s": "W",
        "p": 89,
        "sec": "Fig.1.48"
      }
    ]
  },
  {
    "id": "e38",
    "a": "fluorite",
    "b": "bixbyite",
    "kind": "occupation",
    "label": "アニオン1/4欠損",
    "desc": "酸素欠損と規則配列・変位により6配位のMを持つ関連構造。",
    "refs": [
      {
        "s": "W",
        "p": 88,
        "sec": "§1.17.12"
      }
    ]
  },
  {
    "id": "e39",
    "a": "fluorite",
    "b": "weberite",
    "kind": "occupation",
    "label": "アニオン欠損の別配列",
    "desc": "蛍石関連の異なる超構造。パイロクロアと区別して示す。",
    "refs": [
      {
        "s": "W",
        "p": 88,
        "sec": "§1.17.12"
      }
    ]
  },
  {
    "id": "e40",
    "a": "fluorite",
    "b": "cuprite",
    "kind": "symmetry",
    "label": "k4 · T孔1/4占有",
    "desc": "充填粒子をCu、残すT孔の原子をOとして読む形式的派生。",
    "refs": [
      {
        "s": "M13",
        "p": 181,
        "sec": "Fig.13.12"
      },
      {
        "s": "M13",
        "p": 183,
        "sec": "Table13.8"
      }
    ],
    "index": "k4",
    "basis": "原著Fig.13.12はPn−3mのorigin choice 2を使用。",
    "split": "T孔のうち1/4のみを規則占有。完全な座標変換表は原図を参照。",
    "strict": true
  },
  {
    "id": "e41",
    "a": "fluorite",
    "b": "zns",
    "kind": "symmetry",
    "label": "t2 · T孔を半分空に",
    "desc": "蛍石の等価な8cを二つに分け、片方だけを残す。元素は構造類型として読み替える。",
    "refs": [
      {
        "s": "M13",
        "p": 181,
        "sec": "Fig.13.12"
      }
    ],
    "index": "t2",
    "basis": "同じ立方基底。",
    "split": "8c → 4c + 4d（片方が空孔）",
    "strict": true
  },
  {
    "id": "e42",
    "a": "fluorite",
    "b": "pbo",
    "kind": "occupation",
    "label": "T孔半占有・層状配列",
    "desc": "同じ半占有でも、空けるサイトの選び方がZnS型とは異なる。",
    "refs": [
      {
        "s": "M06",
        "p": 206,
        "sec": "§17.5・Fig.17.14"
      }
    ]
  },
  {
    "id": "e43",
    "a": "fluorite",
    "b": "pts",
    "kind": "occupation",
    "label": "T孔半占有・別配列",
    "desc": "Ptの平面配位を生む別の占有パターン。",
    "refs": [
      {
        "s": "M06",
        "p": 206,
        "sec": "§17.5・Fig.17.14"
      }
    ]
  },
  {
    "id": "e44",
    "a": "perov",
    "b": "reo3",
    "kind": "occupation",
    "label": "Aサイトを空に",
    "desc": "BX₆骨格からの幾何学的な導出。空間群型がPm−3mのままでも化学的内容は変わる。",
    "refs": [
      {
        "s": "W",
        "p": 76,
        "sec": "§1.17.8"
      }
    ]
  },
  {
    "id": "e45",
    "a": "perov",
    "b": "tilted",
    "kind": "distortion",
    "label": "八面体の協調回転",
    "desc": "B–X–B角を変えてAサイトを小さくする。サイト内変位とは別の操作。",
    "refs": [
      {
        "s": "W",
        "p": 64,
        "sec": "§1.17.7.3"
      }
    ]
  },
  {
    "id": "e46",
    "a": "perov",
    "b": "batio3",
    "kind": "distortion",
    "label": "極性変位＋正方歪み",
    "desc": "Tiなどが理想位置からずれ、極性を生む。",
    "refs": [
      {
        "s": "W",
        "p": 64,
        "sec": "§1.17.7.2"
      }
    ]
  },
  {
    "id": "e47",
    "a": "perov",
    "b": "doubleperov",
    "kind": "ordering",
    "label": "B/B′の岩塩状秩序",
    "desc": "二種類のBサイトを交互に並べる。実際の化合物ではチルト等が加わり得る。",
    "refs": [
      {
        "s": "W",
        "p": 72,
        "sec": "§1.17.7.7"
      }
    ]
  },
  {
    "id": "e48",
    "a": "perov",
    "b": "brown",
    "kind": "occupation",
    "label": "O空孔を秩序化",
    "desc": "ABO₂.₅としてBO₆層とBO₄を含む層に分かれる。",
    "refs": [
      {
        "s": "W",
        "p": 70,
        "sec": "§1.17.7.5"
      }
    ]
  },
  {
    "id": "e49",
    "a": "perov",
    "b": "rp1",
    "kind": "stacking",
    "label": "岩塩型層を挿入",
    "desc": "ペロブスカイト1層と岩塩型ブロックの交互積層。直接の対称性低下の矢印ではない。",
    "refs": [
      {
        "s": "W",
        "p": 91,
        "sec": "§1.17.14"
      }
    ]
  },
  {
    "id": "e50",
    "a": "nacl",
    "b": "rp1",
    "kind": "stacking",
    "label": "岩塩型ブロックとして",
    "desc": "NaCl型の局所ブロックを、ペロブスカイトブロックとの積層に使う。",
    "refs": [
      {
        "s": "W",
        "p": 91,
        "sec": "§1.17.14"
      }
    ]
  },
  {
    "id": "e51",
    "a": "rp1",
    "b": "rp2",
    "kind": "stacking",
    "label": "ブロック厚 n: 1 → 2",
    "desc": "ペロブスカイトブロックの厚さを変える構造系列。",
    "refs": [
      {
        "s": "W",
        "p": 92,
        "sec": "§1.17.14"
      }
    ]
  },
  {
    "id": "e52",
    "a": "perov",
    "b": "antiPerov",
    "kind": "antitype",
    "label": "サイトの化学的役割を反転",
    "desc": "幾何学的なペロブスカイト配列を保ち、通常とは異なるカチオン／アニオン分布にする。",
    "refs": [
      {
        "s": "W",
        "p": 74,
        "sec": "§1.17.7.9"
      }
    ],
    "undirected": true
  },
  {
    "id": "e53",
    "a": "perov",
    "b": "hexperov",
    "kind": "stacking",
    "label": "AO₃層の積層変更",
    "desc": "混合AO₃層のccp積層とhcp積層を比べる。八面体の頂点共有・面共有が変わる。",
    "refs": [
      {
        "s": "W",
        "p": 75,
        "sec": "§1.17.7.11"
      }
    ]
  },
  {
    "id": "e54",
    "a": "reo3",
    "b": "rhf3",
    "kind": "distortion",
    "label": "頂点共有八面体の回転",
    "desc": "ReO₃型とRhF₃関連の構造を八面体回転で結ぶ見方。原著はhcpからの空隙占有の記述と別の木で示す。",
    "refs": [
      {
        "s": "M13",
        "p": 170,
        "sec": "§13.2.1"
      },
      {
        "s": "M13",
        "p": 171,
        "sec": "Fig.13.4"
      }
    ],
    "warning": "空隙への原子追加と、同組成の歪みは同じ物理過程ではない。"
  },
  {
    "id": "e55",
    "a": "linbo3",
    "b": "perov",
    "kind": "analogy",
    "label": "大きく歪んだ骨格という見方",
    "desc": "Westが示す代替的な構造記述。ここでは完全な群–部分群連鎖は示さない。",
    "refs": [
      {
        "s": "W",
        "p": 85,
        "sec": "§1.17.11"
      }
    ],
    "undirected": true
  },
  {
    "id": "e56",
    "a": "rutile",
    "b": "cacl2",
    "kind": "symmetry",
    "label": "t2 · 八面体回転",
    "desc": "P4₂/mnmからPnnmへ。サイト分裂がなくてもサイト対称性低下によって自由な変位が増える。",
    "refs": [
      {
        "s": "M13",
        "p": 6,
        "sec": "Fig.1.2"
      }
    ],
    "index": "t2",
    "basis": "同じ基底対応。歪みによりa≠b。",
    "split": "金属2aは保持；アニオン4f(x,x,0) → 4g(x,y,0)",
    "strict": true
  },
  {
    "id": "e57",
    "a": "cacl2",
    "b": "marcasite",
    "kind": "distortion",
    "label": "鎖の回転とX₂ダンベル",
    "desc": "類似した鎖のつながりを比較する。CaCl₂とFeS₂の直接変換反応を意味しない。",
    "refs": [
      {
        "s": "M06",
        "p": 198,
        "sec": "Fig.17.6"
      },
      {
        "s": "M06",
        "p": 199,
        "sec": "Table17.2"
      }
    ]
  },
  {
    "id": "e58",
    "a": "rutile",
    "b": "trirutile",
    "kind": "symmetry",
    "label": "i3 · c軸3倍",
    "desc": "同じ空間群型P4₂/mnmでも並進周期を3倍にすると、並進対称性が減る。",
    "refs": [
      {
        "s": "M06",
        "p": 21,
        "sec": "§3.3・Fig.3.10"
      }
    ],
    "index": "i3（同型のk部分群）",
    "basis": "a′=a, b′=b, c′=3c。",
    "split": "金属サイトが1:2の規則配列を許す。",
    "strict": true
  },
  {
    "id": "e59",
    "a": "rutile",
    "b": "anatase",
    "kind": "analogy",
    "label": "同組成・異なる連結",
    "desc": "TiO₂多形として比較する線。八面体が同じでも、空間群・連結は違う。",
    "refs": [
      {
        "s": "M13",
        "p": 179,
        "sec": "Fig.13.9"
      },
      {
        "s": "M06",
        "p": 199,
        "sec": "Table17.2"
      }
    ],
    "undirected": true
  },
  {
    "id": "e60",
    "a": "nacl",
    "b": "anatase",
    "kind": "occupation",
    "label": "空孔超構造＋変位",
    "desc": "MüllerのNaClからの派生記述。原著Fig.13.10に中間設定と群–部分群連鎖があるが、本版は占有の見方として表示。",
    "refs": [
      {
        "s": "M13",
        "p": 178,
        "sec": "§13.3.1・Fig.13.10"
      }
    ]
  },
  {
    "id": "e61",
    "a": "nacl",
    "b": "cdcl2",
    "kind": "occupation",
    "label": "カチオン層を交互に空に",
    "desc": "ccpハロゲン骨格で、全占有と空のO孔層を交互にする。",
    "refs": [
      {
        "s": "M06",
        "p": 198,
        "sec": "§17.3"
      }
    ]
  },
  {
    "id": "e62",
    "a": "cdi2",
    "b": "cdcl2",
    "kind": "stacking",
    "label": "層ブロックの積層差",
    "desc": "八面体の稜共有層を共通に持つ。全体のハロゲン積層は基本型でhcp/ccpに分かれる。",
    "refs": [
      {
        "s": "M06",
        "p": 198,
        "sec": "§17.3"
      }
    ],
    "undirected": true
  }
];
