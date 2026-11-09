import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { DATA } from "../src/data/atlas.ts";
import { knowledgeDataset } from "../src/knowledge/dataset.ts";
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
const hash = (data: string | Uint8Array) => createHash("sha256").update(data).digest("hex");
const dataset = knowledgeDataset(DATA);
const datasetHash = hash(JSON.stringify({ dataset, schema: TABLES.map(tableDDL) }));
const stamp = {
  schemaVersion: KNOWLEDGE_SCHEMA_VERSION,
  engineVersion: LADYBUG_VERSION,
  datasetHash,
  datasetVersion: DATA.version,
};
let cached = false;
try {
  const old = JSON.parse(
    await readFile(join(output, "manifest.json"), "utf8"),
  ) as KnowledgeManifest;
  cached =
    Object.entries(stamp).every(([k, v]) => old[k as keyof KnowledgeManifest] === v) &&
    hash(await readFile(join(output, "atlas.lbdb"))) === old.databaseHash;
  if (cached)
    await Promise.all([
      readFile(join(output, "dataset.json")),
      readFile(join(output, "schema.cypher")),
    ]);
} catch {
  /* First build or incomplete cache. */
}

if (cached) console.log("Knowledge DB: verified build cache");
else {
  const staging = await mkdtemp(join(tmpdir(), "crystal-atlas-db-"));
  try {
    await engine.init();
    if (engine.getVersion() !== LADYBUG_VERSION) throw new Error("Ladybug engine version mismatch");
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
      storageVersion: String(engine.getStorageVersion()),
      datasetVersion: DATA.version,
      databaseHash: hash(bytes),
      bytes: bytes.length,
      counts: Object.fromEntries(TABLES.map((t) => [t.name, dataset.rows[t.name]!.length])),
      coverage: "legacy-curated-subset",
    };
    await mkdir(output, { recursive: true });
    await writeFile(join(output, "atlas.lbdb.tmp"), bytes);
    await rename(join(output, "atlas.lbdb.tmp"), join(output, "atlas.lbdb"));
    await writeFile(join(output, "manifest.json"), JSON.stringify(manifest, null, 2));
    await writeFile(join(output, "dataset.json"), JSON.stringify(dataset, null, 2));
    await writeFile(join(output, "schema.cypher"), TABLES.map(tableDDL).join(";\n") + ";\n");
    console.log(
      `Knowledge DB: ${manifest.counts.Entity} entities, ${manifest.counts.Assertion} assertions; snapshot reopened read-only`,
    );
  } finally {
    await rm(staging, { recursive: true, force: true });
  }
}
