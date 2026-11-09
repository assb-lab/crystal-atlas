import type { Source } from "../types.ts";

/** Online primary references checked for the lattice/motif distinction, not local PDF coverage. */
export const conceptSources: Record<string, Source> = {
  IUCR_LATTICE: {
    short: "IUCr · Lattice",
    title: "Lattice — Online Dictionary of Crystallography",
    author: "International Union of Crystallography",
    article: "https://dictionary.iucr.org/Lattice",
    citation: "IUCr, Online Dictionary of Crystallography, ‘Lattice’ (accessed 2026-11-09).",
    coverage:
      "2026-11-09、Definitionを確認。並進ベクトルから定義する格子と、原子配置の区別に使用。",
  },
  ITA16_SOUVIGNIER: {
    short: "Souvignier 2016 · ITA",
    title: "A general introduction to space groups",
    author: "B. Souvignier",
    year: "2016",
    edition: "International Tables for Crystallography, Vol. A, Chapter 1.3, 22–41",
    article: "https://it.iucr.org/Ac/ch1o3v0001/",
    citation:
      "B. Souvignier, ‘A general introduction to space groups’, International Tables for Crystallography (2016), Vol. A, ch. 1.3, pp. 22–41. DOI: 10.1107/97809553602060000921.",
    coverage:
      "2026-11-09、§1.3.2.1と§1.3.2.4(iii)の格子の定義・cFの説明を確認。原子座標や特定物質の格子定数は収録しない。",
  },
};
