import type { Source } from "../types.ts";
/** Primary references for the cross-family classification views. */
export const classificationSources: Record<string, Source> = {
  GL: {
    short: "Glazer 1972",
    title: "The classification of tilted octahedra in perovskites",
    citation:
      "A. M. Glazer, “The classification of tilted octahedra in perovskites,” Acta Crystallogr. B 28, 3384–3392 (1972). DOI: 10.1107/S0567740872007976.",
    article: "https://doi.org/10.1107/S0567740872007976",
    coverage: "回転角の等値性と隣接八面体の位相を表すGlazer表記。",
  },
  HS: {
    short: "Howard–Stokes 1998",
    title: "Group-Theoretical Analysis of Octahedral Tilting in Perovskites",
    citation:
      "C. J. Howard and H. T. Stokes, “Group-Theoretical Analysis of Octahedral Tilting in Perovskites,” Acta Crystallogr. B 54, 782–789 (1998). DOI: 10.1107/S0108768198004200.",
    article: "https://doi.org/10.1107/S0108768198004200",
    coverage: "Table 1の、無回転を含む15個の単純回転系と理想対称性。",
  },
  DL: {
    short: "Delmas et al. 1980",
    title: "Structural classification and properties of the layered oxides",
    citation:
      "C. Delmas, C. Fouassier and P. Hagenmuller, “Structural classification and properties of the layered oxides,” Physica B+C 99, 81–85 (1980). DOI: 10.1016/0378-4363(80)90214-4.",
    article: "https://doi.org/10.1016/0378-4363(80)90214-4",
    coverage: "アルカリ金属の配位とMO₂スラブ周期による分類。",
  },
  CA03: {
    short: "Carlier et al. 2003",
    title: "First-Principles Investigation of Phase Stability in the O2-LiCoO₂ System",
    citation:
      "D. Carlier, A. Van der Ven, C. Delmas and G. Ceder, “First-Principles Investigation of Phase Stability in the O2-LiCoO₂ System,” Chem. Mater. 15, 2651–2660 (2003). DOI: 10.1021/cm030002t.",
    article: "https://doi.org/10.1021/cm030002t",
    filename: "Chem.Mat-15-2651-2003.pdf",
    offset: -2650,
    coverage:
      "Figs. 2–3のO1・O2・O3・O6・T#2の幾何学比較。計算で予測した秩序相を実測値とは扱わない。",
  },
  CA04: {
    short: "Carlier et al. 2004",
    title: "Structural Study of the T#2-LiₓCoO₂ (0.52 < x ≤ 0.72) Phase",
    citation:
      "D. Carlier, L. Croguennec, G. Ceder, M. Ménétrier, Y. Shao-Horn and C. Delmas, “Structural Study of the T#2-LiₓCoO₂ (0.52 < x ≤ 0.72) Phase,” Inorg. Chem. 43, 914–922 (2004). DOI: 10.1021/ic026285t.",
    article: "https://doi.org/10.1021/ic026285t",
    coverage: "Table 2の中性子回折精密化とスラブ滑り。",
  },
  YB13: {
    short: "Yabuuchi et al. 2013",
    title:
      "A Comparative Study of LiCoO₂ Polymorphs: Structural and Electrochemical Characterization of O2-, O3-, and O4-type Phases",
    citation:
      "N. Yabuuchi, Y. Kawamoto, R. Hara, T. Ishigaki, A. Hoshikawa, M. Yonemura, T. Kamiyama and S. Komaba, “A Comparative Study of LiCoO₂ Polymorphs: Structural and Electrochemical Characterization of O2-, O3-, and O4-type Phases,” Inorg. Chem. 52, 9131–9142 (2013). DOI: 10.1021/ic4013922.",
    article: "https://doi.org/10.1021/ic4013922",
    coverage: "O2・O3・O4の実験比較、OP4前駆体とイオン交換。",
  },
  CM14: {
    short: "Aimi et al. 2014",
    title:
      "High-Pressure Synthesis of A-Site Ordered Double Perovskite CaMnTi₂O₆ and Ferroelectricity Driven by Coupling of A-Site Ordering and the Second-Order Jahn–Teller Effect",
    citation:
      "A. Aimi, D. Mori, K. Hiraki, T. Takahashi, Y. J. Shan, Y. Shirako, J. Zhou and Y. Inaguma, “High-Pressure Synthesis of A-Site Ordered Double Perovskite CaMnTi₂O₆ and Ferroelectricity Driven by Coupling of A-Site Ordering and the Second-Order Jahn–Teller Effect,” Chem. Mater. 26, 2601–2608 (2014). DOI: 10.1021/cm500016z.",
    article: "https://doi.org/10.1021/cm500016z",
    coverage: "原著の293 K単結晶CIF、Supporting Information Table S9の800 K精密化。",
  },
  CH12: {
    short: "Choi et al. 2012",
    title: "Spin Waves and Revised Crystal Structure of Honeycomb Iridate Na₂IrO₃",
    citation:
      "S. K. Choi et al., “Spin Waves and Revised Crystal Structure of Honeycomb Iridate Na₂IrO₃,” Phys. Rev. Lett. 108, 127204 (2012). DOI: 10.1103/PhysRevLett.108.127204.",
    article: "https://doi.org/10.1103/PhysRevLett.108.127204",
    coverage: "Table Iの300 K C2/m構造。積層欠陥を伴う平均精密化。",
  },
  VC07: {
    short: "Viciu et al. 2007",
    title:
      "Structure and basic magnetic properties of the honeycomb lattice compounds Na₂Co₂TeO₆ and Na₃Co₂SbO₆",
    citation:
      "L. Viciu, Q. Huang, E. Morosan, H. W. Zandbergen, N. I. Greenbaum, T. McQueen and R. J. Cava, “Structure and basic magnetic properties of the honeycomb lattice compounds Na₂Co₂TeO₆ and Na₃Co₂SbO₆,” J. Solid State Chem. 180, 1060–1067 (2007). DOI: 10.1016/j.jssc.2007.01.002.",
    article: "https://doi.org/10.1016/j.jssc.2007.01.002",
    coverage: "Tables 1–2の中性子回折構造と異なる層間配位・周期。",
  },
  BE11: {
    short: "Berthelot et al. 2011",
    title:
      "Reinvestigation of the OP4-(Li/Na)CoO₂-Layered System and First Evidence of the (Li/Na/Na)CoO₂ Phase with OPP9 Oxygen Stacking",
    citation:
      "R. Berthelot, M. Pollet, D. Carlier and C. Delmas, “Reinvestigation of the OP4-(Li/Na)CoO₂-Layered System and First Evidence of the (Li/Na/Na)CoO₂ Phase with OPP9 Oxygen Stacking,” Inorg. Chem. 50, 2420–2430 (2011). DOI: 10.1021/ic102218w.",
    article: "https://doi.org/10.1021/ic102218w",
    coverage: "混合O/P積層のOP4とOPP9。OPP9は分類表の文献項目。",
  },
  AL24: {
    short: "Albrecht et al. 2024",
    title:
      "Low-Temperature Single-Crystal Structure and Phonon Properties of A-Site Ordered Double Perovskite CaMnTi₂O₆",
    citation:
      "E. K. Albrecht, T. Graubner, S. I. Ivlev, E.-L. Rautama, M. Karppinen, F. Kraus and A. J. Karttunen, “Low-Temperature Single-Crystal Structure and Phonon Properties of A-Site Ordered Double Perovskite CaMnTi₂O₆,” ChemistrySelect 9, e202402132 (2024). DOI: 10.1002/slct.202402132.",
    article: "https://doi.org/10.1002/slct.202402132",
    coverage: "CaMnTi₂O₆の柱状Aサイト秩序・Glazer回転系・低温極性変位。",
  },
};
