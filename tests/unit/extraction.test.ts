import assert from "node:assert/strict";
import { test } from "vite-plus/test";
import { DATA } from "../../src/data/atlas.ts";
import catalogData from "../../src/data/literature-catalog.json" with { type: "json" };
import batchData from "../../src/data/okamoto-extraction.json" with { type: "json" };
import type { LiteratureCatalog } from "../../src/knowledge/catalog.ts";
import type { ExtractionBatch } from "../../src/knowledge/extraction.ts";
import { knowledgeDataset } from "../../src/knowledge/dataset.ts";

const catalog = catalogData as LiteratureCatalog;
const batch = batchData as ExtractionBatch;
const { rows } = knowledgeDataset(DATA, catalog, [batch], []);
test("candidate extraction leaves canonical scientific entities and assertions unchanged", () => {
  const baseline = knowledgeDataset(DATA, catalog, []).rows;
  for (const table of [
    "Entity",
    "Assertion",
    "HasEvidence",
    "Subject",
    "Object",
    "OperationStep",
    "ExplainsSymmetryOf",
    "StructureModel",
    "RefersTo",
  ])
    assert.deepEqual(rows[table], baseline[table], table);
  assert.equal(rows.Mention!.length, 10);
  assert.equal(rows.RelationCandidate!.length, 10);
  assert.ok(rows.Mention!.every((r) => r[2] === "candidate_unresolved"));
  assert.ok(rows.RelationCandidate!.every((r) => r[3] === "candidate_unresolved"));
});
test("repeated names retain separate locators and identity candidates", () => {
  const repeated = rows.Mention!.filter((r) => r[1] === "単純立方構造");
  assert.equal(repeated.length, 2);
  assert.notEqual(repeated[0]![0], repeated[1]![0]);
  const refs = repeated.map((m) => {
    const spanId = rows.ContainsMention!.find((r) => r[1] === m[0])![0];
    return JSON.parse(rows.SourceSpan!.find((r) => r[0] === spanId)![1] as string);
  });
  assert.deepEqual(
    refs.map((r) => [r.pdfPage, r.p, r.sec]),
    [
      [2, 157, "図1(a)"],
      [3, 158, "図2(c)"],
    ],
  );
  for (const mention of repeated)
    assert.equal(rows.CandidateRefersTo!.find((r) => r[0] === mention[0])![1], "simple-cubic");
  assert.equal(rows.RefersTo!.length, 0);
});
test("same endpoint pair keeps different operations; comparison and reverse matches remain qualified", () => {
  const subset = batch.relations.filter(
    (r) => r.subjectMention.endsWith("mention:2a") && r.objectMention.endsWith("mention:2b"),
  );
  assert.deepEqual(
    subset.map((r) => r.operation),
    ["interpenetration", "void_occupation"],
  );
  const comparison = batch.relations.find((r) => r.domain === "comparison")!;
  assert.equal(comparison.basis, "editorial_comparison");
  const reverse = batch.relations.find(
    (r) => r.operation === "species_identification" && r.subjectMention.endsWith("mention:2d"),
  )!;
  assert.ok(reverse.existingAssertions[0]!.note.includes("逆向き"));
  for (const row of rows.RelationCandidate!) {
    const payload = JSON.parse(row[4] as string);
    assert.equal(payload.symmetryVerification, "not_verified");
    assert.equal(payload.basisMatrix, null);
    assert.equal(payload.wyckoffMapping, null);
  }
});
test("only new pilot spans are located in the verified asset and ledger scope stays bounded", () => {
  assert.equal(rows.LocatedIn!.length, 13);
  for (const [spanId, assetId] of rows.LocatedIn!) {
    assert.ok(String(spanId).startsWith("pilot:K:2-3:"));
    assert.equal(assetId, `asset:${batch.assetHash}`);
    const ref = JSON.parse(rows.SourceSpan!.find((r) => r[0] === spanId)![1] as string);
    assert.ok([2, 3].includes(ref.pdfPage));
    assert.equal(ref.p, ref.pdfPage + 155);
  }
  const asset = catalog.assets.find((a) => a.sha256 === batch.assetHash)!;
  assert.deepEqual(
    asset.coverage.map((r) => [r.from, r.to]),
    [
      [1, 1],
      [2, 3],
      [4, 31],
    ],
  );
  assert.deepEqual(asset.coverage[1]!.channels, {
    body: "in_progress",
    figures: "in_progress",
    tables: "not_applicable",
    index: "not_applicable",
  });
  for (const other of catalog.assets.filter((a) => a !== asset))
    assert.ok(
      other.coverage.every((r) => Object.values(r.channels).every((s) => s === "not_started")),
    );
  assert.equal(rows.ByRun!.length, 1);
  assert.equal(rows.ByRun![0]![1], batch.id);
});
test("out-of-scope locators, missing assets and unjustified matches fail before projection", () => {
  const invalid = (mutate: (b: ExtractionBatch) => void, pattern: RegExp) => {
    const copy = structuredClone(batch);
    mutate(copy);
    assert.throws(() => knowledgeDataset(DATA, catalog, [copy]), pattern);
  };
  invalid((b) => {
    b.assetHash = "0".repeat(64);
  }, /asset is not confirmed/);
  invalid((b) => {
    b.spans[0]!.ref.pdfPage = 4;
  }, /locator/);
  invalid((b) => {
    b.spans[0]!.ref.p = 158;
  }, /locator/);
  invalid((b) => {
    b.mentions[0]!.candidates[0]!.entityId = "unknown";
  }, /entity candidate/);
  invalid((b) => {
    b.relations[0]!.evidenceSpanIds = [];
  }, /evidence/);
  invalid((b) => {
    b.relations[0]!.existingAssertions[0]!.assertionId = "unknown";
  }, /assertion match/);
  invalid((b) => {
    b.relations[0]!.basis = "editorial_comparison";
  }, /semantics/);
  invalid((b) => {
    b.pageAnchors[0]!.pdfPage = 3;
  }, /page anchors/);
});
