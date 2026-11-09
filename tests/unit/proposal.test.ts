import assert from "node:assert/strict";
import { test } from "vite-plus/test";
import { DATA } from "../../src/data/atlas.ts";
import catalogData from "../../src/data/literature-catalog.json" with { type: "json" };
import type { LiteratureCatalog } from "../../src/knowledge/catalog.ts";
import { extractionProposal } from "../../scripts/extraction-proposal.ts";
import { appendExtraction } from "../../src/knowledge/extraction.ts";
import { knowledgeDataset } from "../../src/knowledge/dataset.ts";
const catalog = catalogData as LiteratureCatalog;
const hash = "89e53b92d39ab682ec8dd1b6931e580ccb0de19fe07524d91d51d47ea9688e27";
const metadata = { operator: "fixture", date: "2026-11-09", tool: "fixture", version: "1" };
const dictionary = [{ term: "NaCl構造", entityId: "nacl" }, { term: "未知構造" }];
test("literal occurrences retain unknown identity, repeated locations and unknown printed pages without source text", () => {
  const pages = [
    {
      pdfPage: 4,
      printedPage: null,
      textState: "selectable_text" as const,
      text: "NaCl構造 と NaCl構造。未知構造。PRIVATE-WHOLE-TEXT-MUST-NOT-BE-PUBLISHED",
    },
  ];
  const proposal = extractionProposal(DATA, catalog, hash, pages, dictionary, metadata);
  assert.equal(proposal.matches.length, 3);
  assert.equal(proposal.reviewRequired, true);
  assert.equal(proposal.coverageEffect, "none");
  assert.notEqual(proposal.matches[0]!.start, proposal.matches[1]!.start);
  assert.deepEqual(proposal.matches[2]!.entityIds, []);
  assert.ok(!JSON.stringify(proposal).includes("PRIVATE-WHOLE-TEXT"));
  assert.equal(proposal.batch!.pageAnchors[0]!.printedPage, null);
  assert.equal(proposal.batch!.spans[0]!.ref.p, undefined);
  assert.deepEqual(extractionProposal(DATA, catalog, hash, pages, dictionary, metadata), proposal);
  const rows = knowledgeDataset(DATA, catalog, [], []).rows;
  appendExtraction(rows, DATA, catalog, proposal.batch!);
  assert.equal(rows.RefersTo!.length, 0);
  assert.equal(rows.Mention!.length, 3);
  assert.equal(JSON.parse(String(rows.SourceSpan!.at(-1)![1])).p, undefined);
});
test("empty selectable text and OCR state never imply coverage or a bibliographic match", () => {
  const empty = extractionProposal(
    DATA,
    catalog,
    hash,
    [{ pdfPage: 4, printedPage: null, textState: "no_text", text: "\n\f" }],
    dictionary,
    metadata,
  );
  assert.equal(empty.matches.length, 0);
  assert.equal(empty.observations[0]!.textState, "no_text");
  assert.equal(empty.coverageEffect, "none");
  const unknown = extractionProposal(
    DATA,
    catalog,
    "715240dfc5db0ddb4abdaf7159b8f1ffe950bb6d6036eddbbbe80ff1fce8e6d0",
    [{ pdfPage: 1, printedPage: null, textState: "ocr_text", text: "NaCl構造" }],
    dictionary,
    metadata,
  );
  assert.equal(unknown.batch, null);
  assert.equal(unknown.blockedReasons.length, 1);
  assert.equal(unknown.matches.length, 1);
  assert.throws(() =>
    extractionProposal(
      DATA,
      catalog,
      hash,
      [{ pdfPage: 4, printedPage: null, textState: "no_text", text: "present" }],
      dictionary,
      metadata,
    ),
  );
  assert.throws(() =>
    extractionProposal(
      DATA,
      catalog,
      hash,
      [{ pdfPage: 32, printedPage: null, textState: "no_text", text: "" }],
      dictionary,
      metadata,
    ),
  );
  assert.throws(() =>
    extractionProposal(
      DATA,
      catalog,
      hash,
      [{ pdfPage: 4, printedPage: null, textState: "no_text", text: "" }],
      [{ term: "", entityId: "nacl" }],
      metadata,
    ),
  );
});
