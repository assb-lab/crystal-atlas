import assert from "node:assert/strict";
import { test } from "vite-plus/test";
import { DATA } from "../../src/data/atlas.ts";
import { knowledgeDataset } from "../../src/knowledge/dataset.ts";
import { labelReconsiderations } from "../../src/data/derivation.ts";
import { appendHeldLabelResolution, appendRecipe } from "../../src/knowledge/derivation.ts";
import catalog from "../../src/data/literature-catalog.json" with { type: "json" };
import extractionData from "../../src/data/okamoto-extraction.json" with { type: "json" };
import decisionsData from "../../src/data/okamoto-decisions.json" with { type: "json" };
import { latticeReconsideration } from "../../src/data/lattice-interpretation.ts";
import { occupationReconsiderations } from "../../src/data/okamoto-occupation.ts";
import type { ExtractionBatch } from "../../src/knowledge/extraction.ts";
import type { DecisionBatch } from "../../src/knowledge/decisions.ts";
import type { LiteratureCatalog } from "../../src/knowledge/catalog.ts";
const extraction = extractionData as ExtractionBatch;
const before = knowledgeDataset(
  DATA,
  catalog as LiteratureCatalog,
  [extraction],
  [decisionsData as DecisionBatch],
  [latticeReconsideration],
  occupationReconsiderations,
  [],
).rows;
const rows = knowledgeDataset(
  DATA,
  catalog as LiteratureCatalog,
  [extraction],
  [decisionsData as DecisionBatch],
).rows;
test("all original candidates and first judgments survive symbolic label adoption", () => {
  for (const table of [
    "Entity",
    "Mention",
    "RelationCandidate",
    "CandidateRefersTo",
    "CandidateMatches",
    "StructureModel",
    "ModelContext",
    "Models",
    "CoverageReview",
    "LocatedIn",
    "ExplainsSymmetryOf",
  ])
    assert.deepEqual(rows[table], before[table], table);
  assert.deepEqual(rows.CandidateDecision!.slice(0, -3), before.CandidateDecision);
  assert.equal(rows.CandidateDecision!.length, 27);
  const leaves = rows.CandidateDecision!.filter(
    ([id]) => !rows.SupersedesDecision!.some(([, old]) => old === id),
  );
  assert.equal(leaves.length, 20);
  assert.equal(new Set(leaves.map((r) => r[2])).size, 20);
  assert.ok(leaves.every((r) => r[3] === "accepted"));
  assert.deepEqual(rows.Assertion!.slice(0, -4), before.Assertion);
  assert.equal(rows.LabelMapSpec!.length, 3);
  for (const spec of rows.LabelMapSpec!) {
    const s = JSON.parse(String(spec[1]));
    assert.equal(s.outputLabel, "X");
    assert.equal(s.cellPolicy, "minimal_cell_not_verified");
  }
});
test("invalid symbolic and already resolved revisions cannot mutate records", () => {
  const invalid = (mutate: (r: (typeof labelReconsiderations)[number]) => void) => {
    const revision = structuredClone(labelReconsiderations[0]!);
    mutate(revision);
    const target = structuredClone(before);
    assert.throws(() => appendHeldLabelResolution(target, extraction, revision));
    assert.deepEqual(target, before);
  };
  invalid((r) => {
    r.predecessorId = r.id;
  });
  invalid((r) => {
    r.labelMap.inputLabels = ["Cs", "Cs"];
  });
  invalid((r) => {
    r.labelMap.scope = "";
  });
  invalid((r) => {
    r.evidenceSpanIds = ["pilot:K:2-3:span:tetrahedral-operation"];
  });
  invalid((r) => {
    r.resolution.target = "unknown";
  });
  assert.throws(() =>
    appendHeldLabelResolution(structuredClone(rows), extraction, labelReconsiderations[0]!),
  );
});
test("editorial recipe preserves order and reuses sourced components without inventing symmetry", () => {
  const id = "recipe:fcc-nacl-sc";
  assert.equal(rows.Assertion!.find(([a]) => a === id)![5], "editorial_composition_not_verified");
  const links = rows.HasStep!.filter(([a]) => a === id);
  assert.deepEqual(
    links.map((r) => r[2]),
    [0, 1],
  );
  assert.deepEqual(
    links.map(([, step]) => rows.ComposesAssertion!.find(([s]) => s === step)![1]),
    ["adopted:pilot:K:2-3:relation:fcc-nacl", "adopted:pilot:K:2-3:relation:nacl-sc"],
  );
  assert.ok(!rows.ExplainsSymmetryOf!.some((r) => r.includes(id)));
  for (const members of [
    ["adopted:pilot:K:2-3:relation:nacl-sc", "adopted:pilot:K:2-3:relation:fcc-nacl"],
    ["relation:e1"],
    ["unknown"],
  ]) {
    const target = structuredClone(rows);
    assert.throws(() => appendRecipe(target, "bad-recipe", "bad", members));
    assert.deepEqual(target, rows);
  }
  const missing = structuredClone(rows);
  missing.HasStep = missing.HasStep!.filter(([a]) => a !== "adopted:pilot:K:2-3:relation:fcc-nacl");
  const unchanged = structuredClone(missing);
  assert.throws(() =>
    appendRecipe(missing, "bad-recipe", "bad", ["adopted:pilot:K:2-3:relation:fcc-nacl"]),
  );
  assert.deepEqual(missing, unchanged);
});
