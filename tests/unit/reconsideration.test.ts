import assert from "node:assert/strict";
import { test } from "vite-plus/test";
import { DATA } from "../../src/data/atlas.ts";
import { knowledgeDataset } from "../../src/knowledge/dataset.ts";
import { appendHeldMentionResolution } from "../../src/knowledge/reconsideration.ts";
import {
  latticeReconsideration,
  latticeDescription,
} from "../../src/data/lattice-interpretation.ts";
import catalog from "../../src/data/literature-catalog.json" with { type: "json" };
import extractionData from "../../src/data/okamoto-extraction.json" with { type: "json" };
import decisionsData from "../../src/data/okamoto-decisions.json" with { type: "json" };
import type { ExtractionBatch } from "../../src/knowledge/extraction.ts";
import type { DecisionBatch } from "../../src/knowledge/decisions.ts";
import type { LiteratureCatalog } from "../../src/knowledge/catalog.ts";
const extraction = extractionData as ExtractionBatch;
const reviews = [decisionsData as DecisionBatch];
const before = knowledgeDataset(
  DATA,
  catalog as LiteratureCatalog,
  [extraction],
  reviews,
  [],
  [],
).rows;
const after = knowledgeDataset(
  DATA,
  catalog as LiteratureCatalog,
  [extraction],
  reviews,
  [latticeReconsideration],
  [],
).rows;
test("one lattice type and a descriptive assertion preserve all original entities, claims and models", () => {
  for (const table of [
    "Mention",
    "RelationCandidate",
    "CandidateRefersTo",
    "CandidateMatches",
    "CoverageReview",
    "ByRun",
    "StructureModel",
    "Models",
    "LocatedIn",
    "ExplainsSymmetryOf",
    "AdoptedAssertion",
    "OperationStep",
    "HasStep",
  ])
    assert.deepEqual(after[table], before[table], table);
  assert.deepEqual(after.Entity!.slice(0, -1), before.Entity);
  assert.deepEqual(after.Assertion!.slice(0, -1), before.Assertion);
  assert.equal(after.Entity!.at(-1)![2], "bravais_lattice_type");
  const lattice = JSON.parse(String(after.Entity!.at(-1)![3]));
  for (const key of ["atoms", "occupancy", "element", "sg", "latticeParameters"])
    assert.ok(!(key in lattice));
  assert.equal(after.Assertion!.at(-1)![1], "description");
  assert.deepEqual(
    after.Subject!.find(([a]) => a === latticeDescription.id),
    [latticeDescription.id, "fcc"],
  );
  assert.deepEqual(
    after.Object!.find(([a]) => a === latticeDescription.id),
    [latticeDescription.id, "bravais:cF"],
  );
  assert.equal(after.HasEvidence!.filter(([a]) => a === latticeDescription.id).length, 3);
});
test("held history is immutable while the current leaf uniquely resolves the occurrence", () => {
  assert.deepEqual(after.CandidateDecision!.slice(0, -1), before.CandidateDecision);
  assert.equal(after.CandidateDecision!.length, 21);
  assert.deepEqual(after.SupersedesDecision, [
    [latticeReconsideration.id, latticeReconsideration.predecessorId],
  ]);
  const superseded = new Set(after.SupersedesDecision!.map(([, id]) => id));
  const current = after.CandidateDecision!.filter(([id]) => !superseded.has(String(id)));
  assert.equal(current.length, 20);
  assert.equal(new Set(current.map((r) => r[2])).size, 20);
  assert.equal(current.filter((r) => r[3] === "accepted").length, 14);
  assert.equal(current.filter((r) => r[3] === "held").length, 6);
  assert.deepEqual(
    after.RefersTo!.filter(([m]) => m === latticeReconsideration.candidateId),
    [[latticeReconsideration.candidateId, "bravais:cF"]],
  );
  assert.ok(!after.ResolvedEntity!.some(([d]) => d === latticeReconsideration.predecessorId));
});
test("revisions refuse duplicates, cycles, forks, cross-candidate predecessors and unsupported resolutions", () => {
  const invalid = (mutate: (r: typeof latticeReconsideration) => void) => {
    const revision = structuredClone(latticeReconsideration);
    mutate(revision);
    assert.throws(
      () =>
        knowledgeDataset(DATA, catalog as LiteratureCatalog, [extraction], reviews, [revision], []),
      /Revision needs|resolution requires/,
    );
  };
  invalid((r) => {
    r.id = r.predecessorId;
  }); // self-cycle
  invalid((r) => {
    r.predecessorId = r.id;
  }); // nonexistent predecessor
  invalid((r) => {
    r.candidateId = "pilot:K:2-3:mention:2a";
  });
  invalid((r) => {
    r.predecessorId = "decision:v1:pilot:K:2-3:mention:2a";
  });
  invalid((r) => {
    r.resolution.entityId = "fcc";
  });
  invalid((r) => {
    r.evidenceSpanIds = ["definition:cF:ita16"];
  });
  invalid((r) => {
    r.evidenceSpanIds = ["pilot:K:2-3:span:fcc-lattice"];
  });
  invalid((r) => {
    r.evidenceSpanIds = ["pilot:K:2-3:span:fcc-lattice", String(before.SourceSpan![0]![0])];
  });
  invalid((r) => {
    r.assetHash = "0".repeat(64);
  });
  invalid((r) => {
    r.resolution.scope = "";
  });
  assert.throws(
    () => appendHeldMentionResolution(structuredClone(after), extraction, latticeReconsideration),
    /Revision needs/,
  );
  const fork = { ...latticeReconsideration, id: "fork", reviewId: "fork-run" };
  assert.throws(
    () => appendHeldMentionResolution(structuredClone(after), extraction, fork),
    /Revision needs/,
  );
});
