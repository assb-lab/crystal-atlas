import type { Source } from "../types.ts";

/** Bibliographic additions identified from local PDF title/publication pages; content unextracted. */
export const literatureSources: Record<string, Source> = {
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
