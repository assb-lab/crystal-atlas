import assert from "node:assert/strict";
import { test } from "vite-plus/test";
import { DATA } from "../../src/data/atlas.ts";
import catalogData from "../../src/data/literature-catalog.json" with { type: "json" };
import extractionData from "../../src/data/okamoto-extraction.json" with { type: "json" };
import decisionData from "../../src/data/okamoto-decisions.json" with { type: "json" };
import type { LiteratureCatalog } from "../../src/knowledge/catalog.ts";
import type { ExtractionBatch } from "../../src/knowledge/extraction.ts";
import { adoptedAssertionId, type DecisionBatch } from "../../src/knowledge/decisions.ts";
import { knowledgeDataset } from "../../src/knowledge/dataset.ts";

const catalog = catalogData as LiteratureCatalog;
const extraction = extractionData as ExtractionBatch;
const review = decisionData as DecisionBatch;
const base = knowledgeDataset(DATA, catalog, [extraction], []).rows;
const current = knowledgeDataset(DATA).rows;
test("all original candidates and source records survive their first decisions unchanged", () => {
  for (const table of [
    "Entity",
    "Mention",
    "RelationCandidate",
    "SourceSpan",
    "CandidateRefersTo",
    "CandidateMatches",
    "CoverageReview",
    "StructureModel",
    "ExplainsSymmetryOf",
  ])
    assert.deepEqual(current[table], base[table], table);
  assert.deepEqual(
    current.Assertion!.filter((r) => !String(r[0]).startsWith("adopted:")),
    base.Assertion,
  );
  assert.equal(current.CandidateDecision!.length, 20);
  assert.equal(current.CandidateDecision!.filter((r) => r[3] === "accepted").length, 13);
  assert.equal(current.CandidateDecision!.filter((r) => r[3] === "held").length, 7);
});
test("only accepted mentions resolve; same-name occurrences keep separate provenance", () => {
  assert.equal(current.RefersTo!.length, 9);
  assert.equal(current.ResolvedEntity!.length, 9);
  const sc = current.RefersTo!.filter((r) => r[1] === "simple-cubic");
  assert.equal(sc.length, 2);
  assert.notEqual(sc[0]![0], sc[1]![0]);
  assert.ok(!current.RefersTo!.some((r) => String(r[0]).endsWith("fcc-lattice")));
  for (const d of review.decisions.filter((d) => d.outcome === "held")) {
    assert.ok(d.nextAction?.trim());
    assert.ok(!current.ResolvedEntity!.some((r) => r[0] === d.id));
    assert.ok(!current.AdoptedAssertion!.some((r) => r[0] === d.id));
  }
});
test("adoption creates three qualified derivations and one editorial comparison without symmetry claims", () => {
  assert.equal(current.AdoptedAssertion!.length, 4);
  const adopted = current.Assertion!.filter((r) => String(r[0]).startsWith("adopted:"));
  assert.equal(adopted.filter((r) => r[1] === "derivation").length, 3);
  const comparison = adopted.find((r) => r[1] === "comparison")!;
  assert.equal(comparison[6], "editorial_comparison");
  assert.equal(JSON.parse(comparison[7] as string).undirected, true);
  assert.ok(!current.HasStep!.some((r) => r[0] === comparison[0]));
  for (const a of adopted) {
    assert.equal(a[5], "source_checked_not_machine_verified");
    const payload = JSON.parse(a[7] as string);
    assert.equal(payload.basisMatrix, null);
    assert.equal(payload.symmetryVerification, "not_verified");
    const decision = review.decisions.find((d) => d.id === payload.decisionId)!;
    assert.equal(decision.outcome, "accepted");
    assert.deepEqual(
      current.HasEvidence!.filter((r) => r[0] === a[0]).map((r) => r[1]),
      decision.evidenceSpanIds,
    );
  }
});
test("held and rejected decisions never generate results", () => {
  const changed = structuredClone(review);
  const comparison = changed.decisions.find((d) => d.candidateId.endsWith("nacl-zns-comparison"))!;
  comparison.outcome = "rejected";
  comparison.reason = "Synthetic rejection for the projection test";
  comparison.resolution = null;
  const rows = knowledgeDataset(DATA, catalog, [extraction], [changed]).rows;
  assert.equal(rows.AdoptedAssertion!.length, 3);
  assert.ok(!rows.Assertion!.some((r) => r[0] === adoptedAssertionId(comparison.candidateId)));
});
test("missing decisions, invalid evidence and unaccepted endpoints cannot produce assertions", () => {
  const invalid = (mutate: (r: DecisionBatch) => void, pattern: RegExp) => {
    const r = structuredClone(review);
    mutate(r);
    assert.throws(() => knowledgeDataset(DATA, catalog, [extraction], [r]), pattern);
  };
  invalid((r) => {
    r.decisions.pop();
  }, /exactly once/);
  invalid((r) => {
    r.assetHash = "0".repeat(64);
  }, /activity\/source/);
  invalid((r) => {
    r.decisions[0]!.evidenceSpanIds = ["unknown"];
  }, /evidence/);
  invalid((r) => {
    const d = r.decisions.find((d) => d.outcome === "held")!;
    d.nextAction = null;
  }, /next action/);
  invalid((r) => {
    r.decisions[0]!.outcome = "held";
    r.decisions[0]!.nextAction = "Later";
  }, /cannot produce/);
  invalid((r) => {
    const d = r.decisions[0]!;
    d.outcome = "held";
    d.resolution = null;
    d.nextAction = "Review later";
  }, /endpoints accepted/);
  invalid((r) => {
    const d = r.decisions[0]!;
    if (d.resolution?.kind === "entity") d.resolution.entityId = "unknown";
  }, /reviewed motif\/type/);
});
