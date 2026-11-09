import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  EVIDENCE_QUERY,
  RELATIONSHIP_QUERY,
  STEP_QUERY,
  COUNTERPART_QUERY,
  CATALOG_QUERY,
  COVERAGE_QUERY,
  DOCUMENT_ASSETS_QUERY,
  EXTRACTION_RUN_QUERY,
  MENTIONS_QUERY,
  RELATION_CANDIDATES_QUERY,
  ENTITY_CANDIDATES_QUERY,
  CANDIDATE_EVIDENCE_QUERY,
  ASSERTION_MATCHES_QUERY,
} from "../src/knowledge/queries.ts";
import { TABLES, type KnowledgeManifest } from "../src/knowledge/schema.ts";
import { DATA } from "../src/data/atlas.ts";
import { knowledgeDataset } from "../src/knowledge/dataset.ts";

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
  const expected = knowledgeDataset(DATA);
  for (const t of TABLES) {
    const pattern = t.endpoints ? `()-[r:${t.name}]->()` : `(r:${t.name})`;
    assert.equal(
      Number(query(`MATCH ${pattern} RETURN count(r) AS n`)[0]?.n),
      manifest.counts[t.name],
      t.name,
    );
    const fields = t.endpoints
      ? ["s.id", "t.id", ...t.columns.map(([name]) => `r.${name}`)]
      : t.columns.map(([name]) => `r.${name}`);
    const fullPattern = t.endpoints
      ? `(s:${t.endpoints[0]})-[r:${t.name}]->(t:${t.endpoints[1]})`
      : `(r:${t.name})`;
    const actualRows = query(
      `MATCH ${fullPattern} RETURN ${fields.map((field, i) => `${field} AS c${i}`).join(", ")}`,
    )
      .map((row) => JSON.stringify(fields.map((_, i) => row[`c${i}`])))
      .sort();
    assert.deepEqual(
      actualRows,
      expected.rows[t.name]!.map((row) => JSON.stringify(row)).sort(),
      `${t.name} full round-trip`,
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
  const steps = query(STEP_QUERY, { id: "derivation:e6" });
  assert.equal(steps[0]?.operation, "ordering");
  assert.deepEqual(JSON.parse(steps[0]!.parameters as string), { ratio: [3, 1] });
  assert.deepEqual(query(COUNTERPART_QUERY, { id: "derivation:e6" }), [
    { symmetry: "relation:e6", derivation: "derivation:e6" },
  ]);
  assert.ok(query(RELATIONSHIP_QUERY, { domain: "comparison", id: "nacoo2-p2" }).length > 0);
  assert.deepEqual(query(RELATIONSHIP_QUERY, { domain: "derivation", id: "fcc' OR true //" }), []);
  const assets = query(CATALOG_QUERY);
  assert.equal(assets.length, expected.rows.Asset!.length);
  for (const asset of assets) {
    const metadata = JSON.parse(asset.payload as string);
    const ranges = query(COVERAGE_QUERY, { id: asset.id });
    assert.deepEqual(
      ranges
        .map((r) => {
          const { coordinateSystem, ledgerOnly, ...range } = JSON.parse(r.payload as string);
          assert.equal(coordinateSystem, "pdf_page_1_based");
          const pending = Object.values(range.channels).every((state) => state === "not_started");
          assert.equal(ledgerOnly, pending);
          assert.equal(r.status, pending ? "not_started" : "recorded");
          return range;
        })
        .sort((a, b) => a.from - b.from),
      metadata.coverage,
    );
  }
  assert.equal(query(DOCUMENT_ASSETS_QUERY, { id: "M06" }).length, 1);
  const supplement = query(DOCUMENT_ASSETS_QUERY, { id: "CM14" });
  assert.equal(supplement.length, 1);
  assert.equal(
    JSON.parse(supplement[0]!.payload as string).identification.documentPart,
    "supplement",
  );
  assert.equal(query(DOCUMENT_ASSETS_QUERY, { id: "T16" }).length, 1);
  assert.equal(query(DOCUMENT_ASSETS_QUERY, { id: "HCG79" }).length, 1);
  assert.deepEqual(query(DOCUMENT_ASSETS_QUERY, { id: "M06' OR true //" }), []);
  const pilotAssetId = "asset:89e53b92d39ab682ec8dd1b6931e580ccb0de19fe07524d91d51d47ea9688e27";
  assert.equal(query(EXTRACTION_RUN_QUERY, { id: pilotAssetId }).length, 1);
  const mentions = query(MENTIONS_QUERY, { id: pilotAssetId });
  assert.equal(mentions.length, 10);
  for (const mention of mentions) {
    assert.equal(mention.status, "candidate_unresolved");
    const ref = JSON.parse(mention.reference as string);
    assert.ok([2, 3].includes(ref.pdfPage));
    assert.equal(ref.p, ref.pdfPage + 155);
    assert.equal(query(ENTITY_CANDIDATES_QUERY, { id: mention.id }).length, 1);
  }
  const candidates = query(RELATION_CANDIDATES_QUERY, { id: pilotAssetId });
  assert.equal(candidates.length, 10);
  for (const candidate of candidates) {
    const payload = JSON.parse(candidate.payload as string);
    assert.equal(candidate.status, "candidate_unresolved");
    assert.equal(payload.basisMatrix, null);
    assert.equal(
      query(CANDIDATE_EVIDENCE_QUERY, { id: candidate.id }).length,
      payload.evidenceSpanIds.length,
    );
    assert.equal(
      query(ASSERTION_MATCHES_QUERY, { id: candidate.id }).length,
      payload.existingAssertions.length,
    );
  }
  assert.deepEqual(query(MENTIONS_QUERY, { id: pilotAssetId + "' OR true //" }), []);
  assert.throws(() => query("CREATE (:Entity {id: 'forbidden-write'})"), /read.only/i);
  console.log(
    "Snapshot verified: all rows/columns, Atlas/comparison/operation/counterpart queries, evidence, parameter binding, read-only writes rejected",
  );
} finally {
  conn.close();
  db.close();
}
