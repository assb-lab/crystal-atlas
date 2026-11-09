import assert from "node:assert/strict";
import { test } from "vite-plus/test";
import { knowledgeDataset } from "../../src/knowledge/dataset.ts";
import { DATA } from "../../src/data/atlas.ts";
import { appendClassification } from "../../src/knowledge/classification.ts";
import { howardScheme } from "../../src/data/classification-schemes.ts";
test("source-specific classification separates imported synthesis and checked ideal types", () => {
  const { rows } = knowledgeDataset(DATA);
  assert.equal(rows.SchemeItem.filter((r) => r[0] === howardScheme.id).length, 16);
  assert.ok(
    rows.ClaimInScheme.some((r) => r[0] === "class-member:HS:perov" && r[1] === howardScheme.id),
  );
  assert.ok(
    rows.ClaimInScheme.some(
      (r) => r[0] === "collection:galasso-7:perov" && r[1] === "scheme:legacy:GI",
    ),
  );
  assert.equal(
    rows.Assertion.find((r) => r[0] === "collection:glazer:perov")![5],
    "imported_not_revalidated",
  );
  const mixed = rows.ClassificationScheme.find((r) => r[0] === "scheme:legacy:GL+HS")!;
  assert.equal(JSON.parse(String(mixed[2])).basis, "editorial_synthesis");
  assert.equal(rows.HasEvidence.filter((r) => r[0] === "family:perov").length, 0);
});
test("invalid scheme references, cycles and evidence fail atomically", () => {
  for (const change of [
    (s: typeof howardScheme) => {
      s.documents = ["missing"];
    },
    (s: typeof howardScheme) => {
      s.items[0]!.parentId = s.items[1]!.id;
    },
    (s: typeof howardScheme) => {
      s.memberships[0]!.entityId = "missing";
    },
    (s: typeof howardScheme) => {
      s.memberships[0]!.refs = [];
    },
  ]) {
    const { rows } = knowledgeDataset(DATA);
    rows.ClassificationScheme = rows.ClassificationScheme.filter((r) => r[0] !== howardScheme.id);
    rows.Entity = rows.Entity.filter((r) => !String(r[0]).startsWith("class:HS:"));
    const s = structuredClone(howardScheme);
    s.memberships[0]!.id = "new-claim";
    change(s);
    const before = structuredClone(rows);
    assert.throws(() => appendClassification(rows, s));
    assert.deepEqual(rows, before);
  }
});
