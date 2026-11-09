import assert from "node:assert/strict";
import { test } from "vite-plus/test";
import { DATA } from "../../src/data/atlas.ts";
import { knowledgeDataset } from "../../src/knowledge/dataset.ts";
import { TABLES } from "../../src/knowledge/schema.ts";
import { snapshotWorker } from "../../src/knowledge/worker-compat.ts";

const { rows } = knowledgeDataset(DATA);
const assertions = new Map(rows.Assertion.map((r) => [r[0], r]));
test("migration preserves canonical cards and every source relationship", () => {
  const entities = new Map(rows.Entity.map((r) => [r[0], r]));
  for (const n of DATA.nodes) assert.deepEqual(JSON.parse(entities.get(n.id)![3] as string), n);
  for (const e of DATA.edges) assert.ok(assertions.has(`relation:${e.id}`), e.id);
  assert.equal(rows.Document.length, Object.keys(DATA.sources).length);
  assert.deepEqual(knowledgeDataset(DATA), { rows });
});
test("every physical relationship endpoint exists and node IDs are unique", () => {
  for (const table of TABLES) {
    const records = rows[table.name];
    for (const row of records)
      assert.equal(row.length, table.columns.length + (table.endpoints ? 2 : 0), table.name);
    if (!table.endpoints) {
      assert.equal(new Set(records.map((r) => r[0])).size, records.length, table.name);
      continue;
    }
    const [from, to] = table.endpoints.map((name) => new Set(rows[name].map((r) => r[0])));
    for (const row of records) {
      assert.ok(from.has(row[0]), `${table.name} source ${row[0]}`);
      assert.ok(to.has(row[1]), `${table.name} target ${row[1]}`);
    }
  }
});
test("undirected comparisons never become construction steps", () => {
  for (const edge of DATA.edges.filter((e) => e.undirected && !e.strict && e.kind !== "symmetry")) {
    assert.equal(assertions.get(`relation:${edge.id}`)![1], "comparison");
    assert.ok(!rows.HasStep.some((r) => r[0] === `relation:${edge.id}`));
  }
});
test("ordering and its symmetry explanation are linked independent assertions", () => {
  assert.equal(assertions.get("relation:e6")![1], "symmetry");
  assert.equal(assertions.get("derivation:e6")![1], "derivation");
  assert.equal(assertions.get("derivation:e6")![2], "ordering");
  assert.ok(rows.ExplainsSymmetryOf.some(([s, d]) => s === "relation:e6" && d === "derivation:e6"));
  const p = JSON.parse(assertions.get("relation:e6")![7] as string);
  assert.equal(p.verification, "literature_confirmed");
  assert.equal(p.basisMatrix, null);
  assert.equal(p.wyckoffMapping, null);
});
test("editorial family membership does not inherit scientific evidence", () => {
  assert.equal(assertions.get("family:pyrochlore")![6], "editorial");
  assert.ok(!rows.HasEvidence.some((r) => r[0] === "family:pyrochlore"));
  assert.ok(
    rows.Object.filter((r) => r[0] === "family:pyrochlore").some(
      (r) => r[1] === `family:${DATA.nodes.find((n) => n.id === "pyrochlore")!.family}`,
    ),
  );
  assert.ok(assertions.has("collection:pyro-alpha:pyrochlore"));
});
test("references preserve locators without inventing mentions or reviewed coverage", () => {
  assert.equal(rows.Mention.length, 55);
  assert.ok(rows.Mention.every((r) => r[2] === "candidate_unresolved"));
  assert.equal(rows.RefersTo.length, 10);
  assert.ok(rows.Asset.length > 0);
  assert.equal(rows.CoverageReview.filter((r) => r[1] === "recorded").length, 3);
  assert.equal(rows.HasAsset.length, 15);
  assert.equal(rows.CandidateAsset.length, 1);
  assert.equal(rows.LocatedIn.length, 26);
  assert.ok(
    rows.LocatedIn.every((r) =>
      /^(pilot:K:2-3:|manual:K:4:|manual:M13:21:|extraction:auto:)/.test(String(r[0])),
    ),
  );
  assert.equal(rows.ByRun.length, 4);
  const spans = new Map(
    rows.SourceSpan.map(([id, payload]) => [id, JSON.parse(payload as string)]),
  );
  const ref = rows.HasEvidence.find(([id]) => id === "relation:e1");
  assert.deepEqual(spans.get(ref![1]), DATA.edges.find((e) => e.id === "e1")!.refs[0]);
  for (const a of rows.Assertion.filter(
    (r) =>
      !String(r[0]).startsWith("adopted:") &&
      !String(r[0]).startsWith("recipe:") &&
      r[1] !== "description",
  ))
    assert.equal(a[5], "imported_not_revalidated");
  assert.equal(
    rows.Assertion.filter((r) => r[5] === "source_checked_not_machine_verified").length,
    10,
  );
});
test("source routes keep figure order without asserting a linear synthesis pathway", () => {
  for (const route of DATA.flows) {
    assert.deepEqual(
      rows.RouteMember.filter(([id]) => id === route.id).map((r) => r.slice(1)),
      route.edges.map((id, i) => [`relation:${id}`, i]),
    );
  }
});
test("snapshot adapter refuses missing or ambiguous upstream API changes", () => {
  assert.throws(() => snapshotWorker("changed upstream wrapper"), /compatibility check failed/);
  assert.throws(
    () => snapshotWorker("FS.writeFile(path, data); FS.writeFile(path, data);"),
    /compatibility check failed/,
  );
});
