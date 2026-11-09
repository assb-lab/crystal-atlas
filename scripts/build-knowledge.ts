import { createRequire } from "node:module";
import { mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { DATA } from "../src/data/atlas.ts";
import { knowledgeDataset } from "../src/knowledge/dataset.ts";
import { sha256 as hash, validKnowledgeCache } from "./knowledge-cache.ts";
import {
  KNOWLEDGE_SCHEMA_VERSION,
  LADYBUG_VERSION,
  TABLES,
  tableDDL,
  type KnowledgeManifest,
} from "../src/knowledge/schema.ts";

const require = createRequire(import.meta.url);
const engine =
  require("@ladybugdb/wasm-core/nodejs/sync") as typeof import("@ladybugdb/wasm-core/nodejs/sync");
const output = resolve(".atlas-build");
const dataset = knowledgeDataset(DATA);
const datasetText = JSON.stringify(dataset, null, 2);
const schemaText = TABLES.map(tableDDL).join(";\n") + ";\n";
await engine.init();
const engineVersion = engine.getVersion();
if (engineVersion !== LADYBUG_VERSION) throw new Error("Ladybug engine version mismatch");
const storageVersion = String(engine.getStorageVersion());
const buildSources = await Promise.all([
  readFile(import.meta.filename),
  readFile(new URL("./knowledge-cache.ts", import.meta.url)),
]);
const datasetHash = hash(JSON.stringify({ dataset, schema: TABLES.map(tableDDL) }));
const stamp = {
  schemaVersion: KNOWLEDGE_SCHEMA_VERSION,
  engineVersion,
  storageVersion,
  datasetHash,
  datasetVersion: DATA.version,
  buildHash: hash(Buffer.concat(buildSources)),
  datasetFileHash: hash(datasetText),
  schemaHash: hash(schemaText),
};
const cached = await validKnowledgeCache(output, stamp);

if (cached) console.log("Knowledge DB: verified build cache");
else {
  const staging = await mkdtemp(join(tmpdir(), "crystal-atlas-db-"));
  try {
    const dbPath = join(staging, "atlas.lbdb");
    const db = new engine.Database(dbPath, 64 * 1024 * 1024, 1);
    const conn = new engine.Connection(db);
    try {
      for (const table of TABLES) {
        const result = conn.query(tableDDL(table));
        result.close();
        const rows = dataset.rows[table.name]!;
        if (!rows.length) continue;
        const headers = table.endpoints
          ? ["from", "to", ...table.columns.map(([n]) => n)]
          : table.columns.map(([n]) => n);
        const csv = [headers, ...rows]
          .map((row) =>
            row
              .map((cell) => (cell === null ? "" : `"${String(cell).replaceAll('"', '""')}"`))
              .join(","),
          )
          .join("\n");
        const csvPath = join(staging, `${table.name}.csv`);
        await writeFile(csvPath, csv);
        const copied = conn.query(
          `COPY ${table.name} FROM '${csvPath.replaceAll("'", "''")}' (HEADER=true)`,
        );
        copied.close();
      }
      const checkpoint = conn.query("CHECKPOINT");
      checkpoint.close();
    } finally {
      conn.close();
      db.close();
    }
    // Reopen the closed snapshot read-only; a successful import alone is not delivery proof.
    const checkDB = new engine.Database(dbPath, 64 * 1024 * 1024, 1, true, true);
    const check = new engine.Connection(checkDB);
    try {
      for (const table of TABLES) {
        if (table.endpoints) continue;
        const result = check.query(`MATCH (n:${table.name}) RETURN count(n) AS total`);
        const total = Number(result.getAllObjects()[0]?.total);
        result.close();
        if (total !== dataset.rows[table.name]!.length)
          throw new Error(`Snapshot count mismatch: ${table.name}`);
      }
    } finally {
      check.close();
      checkDB.close();
    }
    const bytes = await readFile(dbPath);
    const manifest: KnowledgeManifest = {
      ...stamp,
      databaseHash: hash(bytes),
      bytes: bytes.length,
      counts: Object.fromEntries(TABLES.map((t) => [t.name, dataset.rows[t.name]!.length])),
      coverage: "legacy-curated-subset",
    };
    await mkdir(output, { recursive: true });
    await writeFile(join(output, "atlas.lbdb.tmp"), bytes);
    await rename(join(output, "atlas.lbdb.tmp"), join(output, "atlas.lbdb"));
    await writeFile(join(output, "manifest.json"), JSON.stringify(manifest, null, 2));
    await writeFile(join(output, "dataset.json"), datasetText);
    await writeFile(join(output, "schema.cypher"), schemaText);
    console.log(
      `Knowledge DB: ${manifest.counts.Entity} entities, ${manifest.counts.Assertion} assertions; snapshot reopened read-only`,
    );
  } finally {
    await rm(staging, { recursive: true, force: true });
  }
}
