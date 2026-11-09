import assert from "node:assert/strict";
import { test } from "vite-plus/test";
import {
  parseReference,
  referenceHash,
  recordPath,
  recordSlug,
  recordKinds,
} from "../../src/knowledge/navigation.ts";
import { recordQuery, recordTables } from "../../src/knowledge/records.ts";
import { staticRecordPages } from "../../scripts/ssg.ts";
import { knowledgeDataset } from "../../src/knowledge/dataset.ts";
import { DATA } from "../../src/data/atlas.ts";
import { initialState, reducer } from "../../src/state.ts";
test("direct references round trip punctuation, Unicode and invalid links fail closed", () => {
  for (const kind of recordKinds) {
    const r = { kind, id: "構造:/~2F?#&'", mode: "symmetry" as const };
    assert.deepEqual(parseReference(referenceHash(r)), r);
    assert.ok(!recordPath(kind, r.id).includes("?"));
    assert.ok(!recordSlug(r.id).includes("/"));
  }
  assert.notEqual(recordSlug("/"), recordSlug("~2F"));
  for (const hash of [
    "#source-K",
    "#atlas?kind=unknown&id=x",
    "#atlas?kind=entity&id=",
    "#atlas?kind=entity&id=x&mode=unknown",
    "#atlas?kind=entity&id=%00",
  ])
    assert.equal(parseReference(hash), null);
  assert.ok(recordQuery("entity").includes("$id"));
  assert.ok(!recordQuery("entity", true).includes("LIMIT"));
});
test("SSG emits all public records with escaped data, source links and app references", () => {
  const data = knowledgeDataset(DATA);
  const pages = staticRecordPages(data);
  const count = recordKinds.reduce((sum, k) => sum + data.rows[recordTables[k].table]!.length, 0);
  assert.equal(pages.size, count + 1);
  const p = pages.get(recordPath("assertion", "adopted:manual:M13:21:relation:diamond-zns"))!;
  assert.ok(p.includes("M13"));
  assert.ok(p.includes("../document/M13.html"));
  assert.ok(p.includes("#atlas?kind=assertion&amp;id="));
  assert.ok(!p.includes("<script"));
  assert.ok(p.includes("verified_declared_ideal_model"));
  assert.ok(p.includes("parentOperations"));
  const entity = data.rows.Entity![0]!;
  entity[1] = "<script>bad()</script>";
  entity[3] = JSON.stringify({ name: "<img src=x onerror=bad()>" });
  const safe = staticRecordPages(data).get(recordPath("entity", String(entity[0])))!;
  assert.ok(!safe.includes("<script>bad"));
  assert.ok(safe.includes("&lt;script&gt;"));
});
test("knowledge targets and record navigation preserve the derivation exploration and history", () => {
  let s = initialState();
  s = reducer(s, { type: "classification", id: "pyro-alpha" });
  s = reducer(s, { type: "focusSelection" });
  const old = s;
  s = reducer(s, { type: "atlasMode", mode: "family", focusId: "perov" });
  s = reducer(s, { type: "recordReference", reference: { kind: "document", id: "HS" } });
  s = reducer(s, {
    type: "atlasMode",
    mode: "symmetry",
    focusId: "diamond",
    assertionId: "relation:e8",
  });
  assert.deepEqual(s.exploration, old.exploration);
  assert.equal(s.collection, old.collection);
  assert.equal(s.selected, old.selected);
  assert.equal(s.knowledgeTarget!.id, "diamond");
  assert.equal(s.knowledgeTarget!.seq, 2);
});
