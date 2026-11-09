import type { Source } from "../types.ts";

/** Bibliographic additions identified from local PDF title/publication pages; content unextracted. */
export const literatureSources: Record<string, Source> = {
  MI02: {
    short: "Mitchell 2002（書誌候補）",
    title: "Perovskites: Modern and Ancient",
    author: "Roger H. Mitchell",
    year: "2002",
    edition: "Almaz Press, Thunder Bay",
    citation:
      "R. H. Mitchell, Perovskites: Modern and Ancient (Almaz Press, Thunder Bay, 2002). ISBN: 0-9689411-0-9. 書誌の存在はIUCr刊行案内 J. Appl. Cryst. 36, 170 (2003), DOI: 10.1107/S0021889803001420で確認。",
    article: "https://journals.iucr.org/j/issues/2003/01/00/ht5033/",
    filename: "Perovskite_modern_and_ancient.pdf",
    coverage:
      "書誌候補。手元の132頁の画像PDFとの同一性・版は未確定。PDF 1頁の章見出しは整合するが表紙・奥付・ISBNを確認できず、確定した本文出典には使わない。",
  },
  T16: {
    short: "Tilley 2016",
    title: "Perovskites: Structure–Property Relationships",
    author: "Richard J. D. Tilley",
    year: "2016",
    edition: "First edition, John Wiley & Sons",
    citation:
      "R. J. D. Tilley, Perovskites: Structure–Property Relationships, 1st ed. (John Wiley & Sons, 2016). ISBN: 9781118935668.",
    filename: "Perovskites Structure-Property Relationships (Richard J. D. Tilley).pdf",
    coverage: "書誌・初版表記をPDF 5–6頁で確認。構造の抽出・本文照合は未実施。",
  },
  HCG79: {
    short: "Hill–Craig–Gibbs 1979",
    title: "Systematics of the Spinel Structure Type",
    author: "Roderick J. Hill; James R. Craig; G. V. Gibbs",
    year: "1979",
    edition: "Physics and Chemistry of Minerals 4, 317–339",
    citation:
      "R. J. Hill, J. R. Craig and G. V. Gibbs, “Systematics of the Spinel Structure Type,” Phys. Chem. Minerals 4, 317–339 (1979).",
    filename: "Systematics of the Spinel Structure Type.pdf",
    coverage:
      "タイトル・著者・誌名・年巻頁をPDF 1頁で確認。構造候補や構造パラメータは未転記。DOIは未照合。",
  },
};
