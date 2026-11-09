import assert from "node:assert/strict";
import { test } from "vite-plus/test";
import { diamondMapping } from "../../src/data/symmetry.ts";
import { appendSymmetryMapping, verifyIdealCubicSplit } from "../../src/knowledge/symmetry.ts";
import { knowledgeDataset } from "../../src/knowledge/dataset.ts";
import { DATA } from "../../src/data/atlas.ts";
test("declared diamond ideal set has a closed t2 color-preserving subgroup and 8a split", () => {
  const v = verifyIdealCubicSplit(diamondMapping.model!);
  assert.equal(v.parentOperations, 192);
  assert.equal(v.subgroupOperations, 96);
  assert.equal(v.translationCosets, 4);
  assert.deepEqual(
    v.orbits.map((o) => o.length),
    [4, 4],
  );
  assert.deepEqual(v.orbits[0], diamondMapping.model!.points.slice(0, 4));
  assert.deepEqual(v.orbits[1], diamondMapping.model!.points.slice(4));
  const { rows } = knowledgeDataset(DATA);
  assert.equal(rows.SymmetryValidation.length, 1);
  assert.equal(rows.SymmetryMapping.length, 15);
  assert.equal(rows.Assertion.find((r) => r[0] === "relation:e8")![5], "imported_not_revalidated");
  assert.ok(
    rows.ExplainsSymmetryOf.some(
      (r) => r[0] === diamondMapping.assertionId && r[1] === "derivation:M13:fig1.1",
    ),
  );
  for (const r of rows.SymmetryMapping.filter((r) => String(r[0]).startsWith("mapping:legacy:"))) {
    const m = JSON.parse(String(r[1]));
    assert.equal(m.basis, null);
    assert.equal(m.wyckoff, null);
    assert.equal(m.parent.setting, null);
  }
});
test("wrong origin, cell, color, index and split fail validation", () => {
  for (const mutate of [
    (m: typeof diamondMapping.model) => {
      m!.origin = [1, 1, 1];
    },
    (m: typeof diamondMapping.model) => {
      m!.basis[0]![0] = 2;
    },
    (m: typeof diamondMapping.model) => {
      m!.labels.fill("C");
    },
    (m: typeof diamondMapping.model) => {
      m!.index = 3;
    },
    (m: typeof diamondMapping.model) => {
      m!.split = [2, 6];
    },
    (m: typeof diamondMapping.model) => {
      m!.points[0] = [1, 2, 3];
    },
  ]) {
    const m = structuredClone(diamondMapping.model);
    mutate(m);
    assert.throws(() => verifyIdealCubicSplit(m!));
  }
});
test("mapping transcription cannot claim a different model result or mutate on failure", () => {
  const { rows } = knowledgeDataset(DATA);
  const before = structuredClone(rows);
  const mapping = structuredClone(diamondMapping);
  mapping.id = "bad-mapping";
  mapping.index = 3;
  assert.throws(() => appendSymmetryMapping(rows, mapping));
  assert.deepEqual(rows, before);
});
