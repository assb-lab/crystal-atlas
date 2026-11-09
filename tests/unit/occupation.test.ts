import assert from "node:assert/strict";
import { test } from "vite-plus/test";
import { DATA } from "../../src/data/atlas.ts";
import { knowledgeDataset } from "../../src/knowledge/dataset.ts";
import { appendHeldVoidResolution } from "../../src/knowledge/occupation.ts";
import { occupationReconsiderations } from "../../src/data/okamoto-occupation.ts";
import { latticeReconsideration } from "../../src/data/lattice-interpretation.ts";
import catalog from "../../src/data/literature-catalog.json" with { type: "json" };
import extractionData from "../../src/data/okamoto-extraction.json" with { type: "json" };
import decisionsData from "../../src/data/okamoto-decisions.json" with { type: "json" };
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
  [],
).rows;
const after = knowledgeDataset(DATA).rows;

test("void adoption preserves candidates, prior judgments, existing claims, models and coverage", () => {
  for (const table of [
    "Entity",
    "Mention",
    "RelationCandidate",
    "CandidateRefersTo",
    "CandidateMatches",
    "RefersTo",
    "ResolvedEntity",
    "StructureModel",
    "Models",
    "ExplainsSymmetryOf",
    "CoverageReview",
    "ByRun",
    "LocatedIn",
  ])
    assert.deepEqual(after[table], before[table], table);
  assert.deepEqual(after.CandidateDecision!.slice(0, -3), before.CandidateDecision);
  assert.deepEqual(after.Assertion!.slice(0, -3), before.Assertion);
  assert.deepEqual(after.OperationStep!.slice(0, -3), before.OperationStep);
  assert.equal(after.AdoptedAssertion!.length, 7);
  const oldLeaves = before.CandidateDecision!.filter(
    ([id]) => !before.SupersedesDecision!.some(([, old]) => old === id),
  );
  const newLeaves = after.CandidateDecision!.filter(
    ([id]) => !after.SupersedesDecision!.some(([, old]) => old === id),
  );
  const changed = new Set(occupationReconsiderations.map((r) => r.candidateId));
  assert.deepEqual(
    newLeaves.filter((r) => !changed.has(String(r[2]))),
    oldLeaves.filter((r) => !changed.has(String(r[2]))),
  );
  assert.equal(newLeaves.length, 20);
  assert.equal(new Set(newLeaves.map((r) => r[2])).size, 20);
  assert.equal(newLeaves.filter((r) => r[3] === "accepted").length, 17);
  assert.equal(newLeaves.filter((r) => r[3] === "held").length, 3);
  assert.ok(
    newLeaves
      .filter((r) => r[3] === "held")
      .every((r) => String(r[2]).match(/cscl-bcc|nacl-sc|zns-diamond/)),
  );
});
test("named host and guest roles keep octahedral and the two tetrahedral selections distinct", () => {
  assert.equal(after.OccupationSpec!.length, 3);
  assert.deepEqual(
    after.OccupationSpec!.map((r) => r.slice(1, 5)),
    [
      ["Na", "Cl", "octahedral", "all"],
      ["Zn", "S", "tetrahedral", "one_of_two"],
      ["Ca", "F", "tetrahedral", "both"],
    ],
  );
  for (const r of occupationReconsiderations) {
    const result = after.AdoptedAssertion!.find(([d]) => d === r.id)![1];
    const assertion = after.Assertion!.find(([id]) => id === result)!;
    assert.equal(assertion[2], "void_occupation");
    const payload = JSON.parse(String(assertion[7]));
    assert.equal(payload.symmetryVerification, "not_verified");
    assert.equal(payload.basisMatrix, null);
    assert.ok(!after.ExplainsSymmetryOf!.some((edge) => edge.includes(result)));
    assert.ok(after.HasOccupationSpec!.some(([, target]) => target === r.occupation.id));
    assert.ok(
      after.HostMotif!.some(([target, host]) => target === r.occupation.id && host === "fcc"),
    );
    const spec = JSON.parse(
      String(after.OccupationSpec!.find(([id]) => id === r.occupation.id)![5]),
    );
    for (const field of ["fraction", "coordinates", "wyckoffMapping", "orientationVector"])
      assert.ok(!(field in spec));
    assert.deepEqual(
      after.DecisionEvidence!.filter(([d]) => d === r.id).map(([, span]) => span),
      r.evidenceSpanIds,
    );
  }
  const ca = occupationReconsiderations.find((r) => r.occupation.hostSpecies === "Ca")!;
  assert.equal(ca.occupation.roleBasis, "prototype_cross_check");
  assert.ok(
    ca.occupation.roleEvidenceSpanIds.every((s) =>
      after.InDocument!.some(([span, doc]) => span === s && doc === "AF_FLUORITE"),
    ),
  );
});
test("invalid void revisions fail before appending judgments or assertions", () => {
  // Definitions already loaded, remove only this revision's generated rows to obtain a valid pre-adoption graph.
  const withRoles = structuredClone(before);
  const roleSpan = after.SourceSpan!.at(-1)!;
  withRoles.SourceSpan!.push(roleSpan);
  withRoles.InDocument!.push(after.InDocument!.find(([id]) => id === roleSpan[0])!);
  const invalid = (
    mutate: (
      revision: (typeof occupationReconsiderations)[number],
      rows: typeof withRoles,
      e: ExtractionBatch,
    ) => void,
  ) => {
    const rows = structuredClone(withRoles);
    const r = structuredClone(occupationReconsiderations[0]!);
    const e = structuredClone(extraction);
    mutate(r, rows, e);
    const snapshot = structuredClone(rows);
    assert.throws(() => appendHeldVoidResolution(rows, e, r));
    assert.deepEqual(rows, snapshot);
  };
  invalid((r) => {
    r.id = r.predecessorId;
  });
  invalid((r) => {
    r.predecessorId = "decision:v1:pilot:K:2-3:relation:fcc-zns-voids";
  });
  invalid((r) => {
    r.occupation.hostMotifId = "bravais:cF";
  });
  invalid((r) => {
    r.occupation.selection = "one_of_two";
  });
  invalid((r) => {
    r.occupation.voidKind = "tetrahedral";
  });
  invalid((r) => {
    r.occupation.guestSpecies = r.occupation.hostSpecies;
  });
  invalid((r) => {
    r.occupation.roleNote = "";
  });
  invalid((r) => {
    r.evidenceSpanIds = [];
  });
  invalid((r) => {
    r.evidenceSpanIds = ["pilot:K:2-3:span:tetrahedral-operation"];
  });
  invalid((r) => {
    r.occupation.roleBasis = "prototype_cross_check";
  });
  invalid((r) => {
    r.resolution.target = "wrong-target";
  });
  invalid((r) => {
    r.resolution.scope = "";
  });
  invalid((_r, rows) => {
    rows.CandidateDecision!.find((d) => d[2] === "pilot:K:2-3:mention:2b")![3] = "held";
  });
  invalid((r, rows) => {
    rows.SupersedesDecision!.push(["existing-later-decision", r.predecessorId]);
  });
  invalid((r, _rows, e) => {
    e.relations.find((c) => c.id === r.candidateId)!.operation = "interpenetration";
  });
  assert.throws(() =>
    appendHeldVoidResolution(structuredClone(after), extraction, occupationReconsiderations[0]!),
  );
});
