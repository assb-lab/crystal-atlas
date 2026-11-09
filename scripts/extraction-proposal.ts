import { createHash } from "node:crypto";
import type { Atlas } from "../src/types.ts";
import type { LiteratureCatalog } from "../src/knowledge/catalog.ts";
import type { ExtractionBatch } from "../src/knowledge/extraction.ts";
export interface DictionaryTerm {
  term: string;
  entityId?: string;
}
export interface PageText {
  pdfPage: number;
  text: string;
  printedPage: number | null;
  textState: "selectable_text" | "ocr_text" | "no_text";
}
export const digest = (value: string) => createHash("sha256").update(value).digest("hex");
export function extractionDictionary(data: Atlas): DictionaryTerm[] {
  const known = [
    ...data.nodes.flatMap((n) => [
      { term: n.name, entityId: n.id },
      ...(n.aliases ?? "")
        .split(/\s+/)
        .filter((t) => t.length >= 3)
        .map((term) => ({ term, entityId: n.id })),
    ]),
    { term: "WC構造", entityId: "wc" },
    { term: "六方最密充填構造", entityId: "hcp" },
    { term: "単純六方構造", entityId: "simple-hex" },
    { term: "ウルツ鉱構造", entityId: "wurtzite" },
  ];
  return [...new Map(known.map((t) => [JSON.stringify(t), t])).values()].sort((a, b) =>
    JSON.stringify(a).localeCompare(JSON.stringify(b), "en"),
  );
}
export function extractionProposal(
  data: Atlas,
  catalog: LiteratureCatalog,
  assetHash: string,
  pages: PageText[],
  dictionary: DictionaryTerm[],
  metadata: { operator: string; date: string; tool: string; version: string },
) {
  const asset = catalog.assets.find((a) => a.sha256 === assetHash);
  if (
    !asset ||
    !pages.length ||
    asset.pageCount === null ||
    pages.some(
      (p, i) =>
        !Number.isSafeInteger(p.pdfPage) ||
        p.pdfPage < 1 ||
        p.pdfPage > asset.pageCount! ||
        (i > 0 && p.pdfPage !== pages[i - 1]!.pdfPage + 1) ||
        (p.printedPage !== null && (!Number.isSafeInteger(p.printedPage) || p.printedPage < 1)),
    )
  )
    throw new Error("Proposal requires a known asset and consecutive bounded pages");
  if (
    pages.some(
      (p) =>
        typeof p.text !== "string" ||
        !["selectable_text", "ocr_text", "no_text"].includes(p.textState) ||
        (p.textState === "no_text" ? !!p.text.trim() : !p.text.trim()),
    )
  )
    throw new Error("Text state must describe the observed page");
  const ids = new Set(data.nodes.map((n) => n.id));
  if (
    !dictionary.length ||
    dictionary.some((t) => !t.term.trim() || (t.entityId && !ids.has(t.entityId)))
  )
    throw new Error("Invalid literal dictionary");
  if (
    !metadata.operator.trim() ||
    !/^\d{4}-\d{2}-\d{2}$/.test(metadata.date) ||
    !metadata.tool ||
    !metadata.version
  )
    throw new Error("Processing metadata required");
  const dictionaryHash = digest(JSON.stringify(dictionary));
  const observations = pages.map((p) => ({
    pdfPage: p.pdfPage,
    textHash: digest(p.text),
    characters: p.text.length,
    textState: p.textState,
  }));
  const id = `extraction:auto:${digest(JSON.stringify({ assetHash, dictionaryHash, observations, tool: metadata.tool, version: metadata.version })).slice(0, 24)}`;
  const matches: {
    pdfPage: number;
    start: number;
    end: number;
    rawName: string;
    entityIds: string[];
  }[] = [];
  for (const page of pages) {
    const found = new Map<string, (typeof matches)[number]>();
    for (const term of dictionary) {
      const escaped = term.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const ascii = /^[A-Za-z0-9 -]+$/.test(term.term);
      const regex = new RegExp(
        (ascii ? "(?<![A-Za-z0-9])" : "") + escaped + (ascii ? "(?![A-Za-z0-9])" : ""),
        "giu",
      );
      for (const match of page.text.matchAll(regex)) {
        const key = `${match.index}:${match[0].length}`;
        const item = found.get(key) ?? {
          pdfPage: page.pdfPage,
          start: match.index,
          end: match.index + match[0].length,
          rawName: match[0],
          entityIds: [],
        };
        if (term.entityId && !item.entityIds.includes(term.entityId))
          item.entityIds.push(term.entityId);
        found.set(key, item);
      }
    }
    matches.push(...[...found.values()].sort((a, b) => a.start - b.start || a.end - b.end));
  }
  const blocked =
    asset.mapping.state !== "confirmed" ||
    asset.mapping.documentIds.length !== 1 ||
    !data.sources[asset.mapping.documentIds[0] ?? ""];
  const sourceId = asset.mapping.documentIds[0];
  const batch: ExtractionBatch | null = blocked
    ? null
    : {
        id,
        sourceId: sourceId!,
        assetHash,
        operator: metadata.operator,
        reviewedOn: metadata.date,
        pdfFrom: pages[0]!.pdfPage,
        pdfTo: pages.at(-1)!.pdfPage,
        method: pages.some((p) => p.textState === "ocr_text")
          ? "ocr_dictionary_candidate"
          : "text_dictionary_candidate",
        processing: {
          tool: metadata.tool,
          version: metadata.version,
          dictionaryHash,
          pages: observations,
        },
        pageAnchors: pages.map((p) => ({ pdfPage: p.pdfPage, printedPage: p.printedPage })),
        scope: "指定したPDF頁に対する辞書の逐語一致候補。本文／図／表／索引の分類・採否は未実施。",
        limitations: [
          "自動候補。名前の一致を対象の同一性・採用と扱わない。",
          "候補0件やテキストなしは未掲載・調査完了を意味しない。",
          "重なった語の候補も保持する。印刷頁は明示したアンカーがある場合だけ記録。",
          "OCR誤読・欠落・見開き・図中文字の確認が必要。全文と頁画像はこの出力に含めない。",
        ],
        spans: pages.map((p) => ({
          id: `${id}:page:${p.pdfPage}`,
          ref: {
            s: sourceId!,
            pdfPage: p.pdfPage,
            ...(p.printedPage === null ? {} : { p: p.printedPage }),
            sec: "自動辞書候補・テキスト領域（表面分類未確認）",
          },
          surface: "unclassified",
        })),
        mentions: matches.map((m, i) => ({
          id: `${id}:mention:${i}`,
          rawName: m.rawName,
          spanId: `${id}:page:${m.pdfPage}`,
          identityNote: `逐語一致・UTF-16位置 ${m.start}–${m.end}。原典の文字列・対象・表面分類を未照合。`,
          candidates: m.entityIds.map((entityId) => ({
            entityId,
            note: "辞書一致による対応候補。名前だけでは確定しない。",
          })),
        })),
        relations: [],
      };
  return {
    proposalVersion: 1,
    assetHash,
    processingId: id,
    scope: { pdfFrom: pages[0]!.pdfPage, pdfTo: pages.at(-1)!.pdfPage },
    observations,
    matches,
    batch,
    blockedReasons: blocked
      ? ["書誌対応が未確定／曖昧のためDB用バッチを生成しない。書誌の確認が必要。"]
      : [],
    reviewRequired: true,
    coverageEffect: "none",
  };
}
