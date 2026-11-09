import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "vite-plus/test";
import { scanCatalog } from "../../scripts/catalog-scan.ts";
import { validateCatalog } from "../../src/knowledge/catalog.ts";
import { knowledgeDataset } from "../../src/knowledge/dataset.ts";
import { DATA } from "../../src/data/atlas.ts";
import catalogData from "../../src/data/literature-catalog.json" with { type: "json" };
import type {
  LiteratureCatalog,
  BibliographicIdentification,
} from "../../src/knowledge/catalog.ts";

async function fixture(run: (root: string) => Promise<void>) {
  const root = await mkdtemp(join(tmpdir(), "atlas-catalog-test-"));
  try {
    await run(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}
const sources = { M: { filename: "Müller.pdf" } };
const pages = async () => 4;
const identification = (): BibliographicIdentification => ({
  reviewedOn: "2026-11-09",
  reviewer: "test fixture",
  method: "text_and_page_image",
  documentPart: "main",
  checks: [
    { pdfPages: [1], field: "title_authors", finding: "Synthetic title/author" },
    { pdfPages: [2], field: "publication", finding: "Synthetic edition" },
  ],
  limitations: [],
});
test("inventory is deterministic, deduplicates bytes, and matches Unicode candidates across copies", async () => {
  await fixture(async (root) => {
    await mkdir(join(root, "curation"));
    await writeFile(join(root, "aaa.pdf"), "same bytes");
    await writeFile(join(root, "curation", "Müller.pdf"), "same bytes");
    await symlink(join(root, "aaa.pdf"), join(root, "excluded.pdf"));
    await writeFile(join(root, "ignored.txt"), "not a pdf");
    const first = await scanCatalog(root, sources, undefined, "test", pages);
    const second = await scanCatalog(root, sources, first, "test", pages);
    assert.deepEqual(first, second);
    assert.equal(first.assets.length, 1);
    const asset = first.assets[0]!;
    assert.equal(asset.locations.length, 2);
    assert.deepEqual(asset.locations[1]!.roles, ["primary", "curation"]);
    assert.equal(asset.mapping.state, "candidate");
    assert.deepEqual(asset.mapping.documentIds, ["M"]);
    assert.ok(!JSON.stringify(first).includes(root));
    assert.equal(asset.coverage[0]!.channels.figures, "not_started");
  });
});
test("review records follow bytes through moves, but never transfer to replacement bytes", async () => {
  await fixture(async (root) => {
    const path = join(root, "Müller.pdf");
    await writeFile(path, "old");
    const original = await scanCatalog(root, sources, undefined, "test", pages);
    const asset = original.assets[0]!;
    asset.identification = identification();
    asset.mapping = {
      state: "confirmed",
      documentIds: ["M"],
      basis: "title page and edition checked, PDF p.1",
    };
    asset.coverage[0]!.channels.body = "reviewed";
    asset.coverage[0]!.note =
      "Reviewer A: body checked on PDF pages 1–4; no structures found. 2026-11-09";
    await writeFile(join(root, "copy.pdf"), "old");
    await rm(path);
    const moved = await scanCatalog(root, sources, original, "test", pages);
    assert.deepEqual(moved.assets[0]!.coverage, asset.coverage);
    assert.deepEqual(moved.assets[0]!.mapping, asset.mapping);
    await writeFile(join(root, "copy.pdf"), "new bytes");
    const replaced = await scanCatalog(root, sources, moved, "test", pages);
    assert.notEqual(replaced.assets[0]!.sha256, asset.sha256);
    assert.equal(replaced.assets[0]!.coverage[0]!.channels.body, "not_started");
    assert.equal(replaced.assets[0]!.mapping.state, "unmatched");
    await writeFile(join(root, "new-si.pdf"), "supplement bytes");
    assert.equal((await scanCatalog(root, sources, replaced, "test", pages)).assets.length, 2);
  });
});
test("unreadable PDF retains an unknown endpoint instead of claiming zero or reviewed pages", async () => {
  await fixture(async (root) => {
    await writeFile(join(root, "bad-si.pdf"), "broken");
    const catalog = await scanCatalog(root, sources, undefined, "test", async () => null);
    const asset = catalog.assets[0]!;
    assert.equal(asset.pageCount, null);
    assert.equal(asset.readState, "unreadable");
    assert.equal(asset.coverage[0]!.to, null);
    assert.deepEqual(asset.locations[0]!.roles, ["supplement"]);
    asset.coverage[0]!.channels.body = "reviewed";
    asset.coverage[0]!.note = "cannot claim review on unknown extent";
    assert.throws(() => validateCatalog(catalog, new Set(["M"])), /known pages/);
  });
});
test("changing input and page-count drift on a reviewed asset stop the scan", async () => {
  await fixture(async (root) => {
    const path = join(root, "x.pdf");
    await writeFile(path, "abc");
    await assert.rejects(
      scanCatalog(root, sources, undefined, "test", async () => {
        await writeFile(path, "changed bytes");
        return 4;
      }),
      /changed during scan/,
    );
    const catalog = await scanCatalog(root, sources, undefined, "test", pages);
    catalog.assets[0]!.coverage[0]!.channels.index = "not_applicable";
    catalog.assets[0]!.coverage[0]!.note = "Checked all 4 PDF pages: no index";
    await assert.rejects(
      scanCatalog(root, sources, catalog, "test", async () => 5),
      /Page count changed/,
    );
  });
});
test("ledger validates channel status, page partitions, evidence notes and relative paths", () => {
  const base = structuredClone(catalogData) as LiteratureCatalog;
  const docs = new Set(Object.keys(DATA.sources));
  const invalid = (mutate: (c: LiteratureCatalog) => void, message: RegExp) => {
    const copy = structuredClone(base);
    mutate(copy);
    assert.throws(() => validateCatalog(copy, docs), message);
  };
  invalid((c) => {
    c.assets[0]!.locations[0]!.path = "/private/document.pdf";
  }, /relative path/);
  invalid((c) => {
    c.assets[0]!.coverage[0]!.from = 2;
  }, /partition/);
  invalid((c) => {
    c.assets[0]!.coverage[0]!.to = 2;
  }, /extent/);
  invalid((c) => {
    c.assets[0]!.coverage[0]!.channels.tables = "reviewed";
  }, /audit note/);
  invalid((c) => {
    c.assets[0]!.mapping = { state: "confirmed", documentIds: ["M06"], basis: "" };
  }, /explicit basis/);
  const asset = base.assets[0]!;
  const second = structuredClone(asset.coverage[0]!);
  asset.coverage[0]!.to = 2;
  second.from = 3;
  asset.coverage.push(second);
  validateCatalog(base, docs);
  second.from = 2;
  assert.throws(() => validateCatalog(base, docs), /partition/);
});
test("identified assets connect to documents without reusing legacy page offsets", () => {
  const initial = knowledgeDataset(DATA);
  assert.equal(initial.rows.Asset!.length, 16);
  assert.equal(initial.rows.CandidateAsset!.length, 1);
  assert.equal(initial.rows.HasAsset!.length, 15);
  assert.equal(initial.rows.LocatedIn!.length, 26);
  assert.ok(
    initial.rows.LocatedIn!.every((r) =>
      /^(pilot:K:2-3:|manual:K:4:|manual:M13:21:|extraction:auto:)/.test(String(r[0])),
    ),
  );
  assert.equal(initial.rows.CoverageReview!.filter((row) => row[1] === "recorded").length, 4);
  const changed = structuredClone(catalogData) as LiteratureCatalog;
  const asset = changed.assets.find((a) => a.mapping.documentIds.length)!;
  asset.mapping.state = "candidate";
  asset.mapping.basis = "filename_only_not_edition_verified";
  const candidate = knowledgeDataset(DATA, changed);
  assert.equal(candidate.rows.HasAsset!.length, 14);
  assert.equal(candidate.rows.CandidateAsset!.length, 2);
  assert.equal(candidate.rows.LocatedIn!.length, 26);
});
test("confirmation requires in-bounds identification checks and retains unresolved notes on rescan", async () => {
  const catalog = structuredClone(catalogData) as LiteratureCatalog;
  const docs = new Set(Object.keys(DATA.sources));
  const first = catalog.assets.find((a) => a.mapping.state === "confirmed")!;
  const saved = first.identification;
  delete first.identification;
  assert.throws(() => validateCatalog(catalog, docs), /page-level identification/);
  first.identification = structuredClone(saved)!;
  first.identification.checks[0]!.pdfPages = [first.pageCount! + 1];
  assert.throws(() => validateCatalog(catalog, docs), /identification page/);
  await fixture(async (root) => {
    await writeFile(join(root, "unknown.pdf"), "unidentified");
    const original = await scanCatalog(root, {}, undefined, "test", pages);
    original.assets[0]!.identification = identification();
    original.assets[0]!.mapping.basis =
      "Identification examined but the edition remains unresolved";
    assert.deepEqual(await scanCatalog(root, {}, original, "test", pages), original);
  });
});
