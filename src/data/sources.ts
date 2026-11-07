/** Curated atlas sources. Source wording and page references retained from v1.0. */
import type { Source } from "../types.ts";

export const sources: Record<string, Source> = {
  K: {
    short: "岡本 講義ノート",
    title: "物質探索のための5d遷移金属化合物の結晶化学",
    author: "岡本佳比古",
    year: "2016–2017",
    edition: "物性研究・電子版 6(1), 061206",
    url: "https://repository.kulib.kyoto-u.ac.jp/server/api/core/bitstreams/d67b6cd7-7519-42f6-bc4e-0c26569f8c13/content",
    offset: -155,
    coverage:
      "第2章：格子の貫入、規則配列、NiAs派生、構造ブロック、積層。主に図7の共通記述を採用。",
  },
  M06: {
    short: "Müller 2006",
    title: "Inorganic Structural Chemistry",
    author: "Ulrich Müller",
    year: "2006",
    edition: "Second edition, Wiley",
    filename: "inorganic-structural-chemistry-2ed-2006-muller.pdf",
    offset: 13,
    coverage: "§2.4、§3.3、Ch.15–18：構造同型、規則化、空隙占有、配位多面体、群–部分群関係。",
  },
  M13: {
    short: "Müller 2013",
    title: "Symmetry Relationships between Crystal Structures",
    author: "Ulrich Müller",
    year: "2013",
    edition: "First edition, Oxford University Press / IUCr",
    filename: "Ulrich_Müller.pdf",
    offset: 17,
    coverage:
      "§1.2、Ch.10–13：Bärnighausen形式、Wyckoff位置の分裂、hcp・NaCl・CaF₂からの派生。添付版は2013年初版。",
  },
  W: {
    short: "West 2022",
    title: "Solid State Chemistry and its Applications",
    author: "Anthony R. West",
    year: "2022",
    edition: "Second edition, Wiley",
    filename: "solid-state-chemistry-and-its-applications.pdf",
    offset: 28,
    coverage:
      "§1.9–1.17：充填、スピネル・オリビン、蛍石関連、ペロブスカイトと積層構造。添付版は2022年版。",
  },
  SP: {
    short: "Seidel–Pöttgen 2021",
    title:
      "Coloring and distortion variants of the bcc packing and for the aristotypes BaAl₄ and CeMg₂Si₂",
    author: "Stefan Seidel; Rainer Pöttgen",
    year: "2021",
    edition: "Z. Naturforsch. B 76(5), 249–262. DOI: 10.1515/znb-2021-0022",
    url: "https://www.degruyterbrill.com/document/doi/10.1515/znb-2021-0022/pdf?licenseType=limitedFree",
    offset: -248,
    coverage:
      "本版では§2・図1/3を中心にbccの規則化・歪みとisopointalの注意点を採用。BaAl₄・CeMg₂Si₂の詳細枝は未収録。",
  },
};
