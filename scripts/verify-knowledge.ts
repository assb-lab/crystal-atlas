import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { EVIDENCE_QUERY, RELATIONSHIP_QUERY } from "../src/knowledge/queries.ts";
import { TABLES, type KnowledgeManifest } from "../src/knowledge/schema.ts";

const require = createRequire(import.meta.url);
const engine =
  require("@ladybugdb/wasm-core/nodejs/sync") as typeof import("@ladybugdb/wasm-core/nodejs/sync");
await engine.init();
const manifest = JSON.parse(
  await readFile(".atlas-build/manifest.json", "utf8"),
) as KnowledgeManifest;
const db = new engine.Database(resolve(".atlas-build/atlas.lbdb"), 64 * 1024 * 1024, 1, true, true);
const conn = new engine.Connection(db);
function query(text: string, params: Record<string, unknown> = {}) {
  const prepared = conn.prepare(text);
  try {
    assert.ok(prepared.isSuccess(), prepared.getErrorMessage());
    const result = conn.execute(prepared, params);
    try {
      return result.getAllObjects();
    } finally {
      result.close();
    }
  } finally {
    prepared.close();
  }
}
try {
  for (const t of TABLES) {
    const pattern = t.endpoints ? `()-[r:${t.name}]->()` : `(r:${t.name})`;
    assert.equal(
      Number(query(`MATCH ${pattern} RETURN count(r) AS n`)[0]?.n),
      manifest.counts[t.name],
      t.name,
    );
  }
  const family = query(RELATIONSHIP_QUERY, { domain: "family", id: "pyrochlore" });
  assert.ok(family.length > 1);
  const derivation = query(RELATIONSHIP_QUERY, { domain: "derivation", id: "fcc" });
  assert.ok(derivation.some((r) => r.id === "relation:e1" && r.objectId === "nacl"));
  assert.ok(derivation.some((r) => r.id === "derivation:e6" && r.operation === "ordering"));
  const refs = query(EVIDENCE_QUERY, { id: "relation:e1" });
  assert.ok(refs.some((r) => JSON.parse(r.reference as string).s === "M06"));
  const symmetry = query(RELATIONSHIP_QUERY, { domain: "symmetry", id: "fcc" });
  const p = JSON.parse(symmetry.find((r) => r.id === "relation:e6")!.payload as string);
  assert.equal(p.verification, "literature_confirmed");
  assert.equal(p.originShift, null);
  assert.deepEqual(query(RELATIONSHIP_QUERY, { domain: "derivation", id: "fcc' OR true //" }), []);
  assert.throws(() => query("CREATE (:Entity {id: 'forbidden-write'})"), /read.only/i);
  console.log(
    "Snapshot verified: all table counts, 3 Atlas queries, evidence, parameter binding, read-only writes rejected",
  );
} finally {
  conn.close();
  db.close();
}
