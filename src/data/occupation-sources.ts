import type { Source } from "../types.ts";

export const occupationSources: Record<string, Source> = {
  AF_FLUORITE: {
    short: "AFLOW · Fluorite",
    title: "Fluorite (CaF₂, C1) Structure: AB2_cF12_225_a_c-001",
    author: "AFLOW consortium",
    article: "https://aflow.org/p/AB2_cF12_225_a_c-001/",
    citation:
      "AFLOW Encyclopedia of Crystallographic Prototypes, Fluorite (CaF₂, C1), AB2_cF12_225_a_c-001 (accessed 2026-11-09). Entry first cited in M. J. Mehl et al., Comput. Mater. Sci. 136, S1–S828 (2017), DOI: 10.1016/j.commatsci.2017.01.017.",
    coverage:
      "2026-11-09、Face-centered Cubic primitive vectorsとBasis vectorsを確認し、Ca骨格とF占有の役割を照合。格子定数・座標・Wyckoff対応は今回転記・数値検証していない。実試料の精密化結果として扱わない。",
  },
};
