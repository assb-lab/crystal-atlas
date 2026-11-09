import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { test } from "vite-plus/test";
import { sha256, validKnowledgeCache, type BuildStamp } from "../../scripts/knowledge-cache.ts";

test("cache verifies runtime, builder and each distributed artifact, including missing files", async () => {
  const directory = await mkdtemp(join(tmpdir(), "atlas-cache-test-"));
  const data = {
    "atlas.lbdb": "binary snapshot",
    "dataset.json": '{"rows":{}}',
    "schema.cypher": "CREATE NODE TABLE Example(id STRING, PRIMARY KEY(id));",
  };
  const stamp: BuildStamp = {
    schemaVersion: 1,
    engineVersion: "0.22.3",
    storageVersion: "49",
    datasetVersion: "test",
    datasetHash: "input-hash",
    buildHash: "builder-hash",
    datasetFileHash: sha256(data["dataset.json"]),
    schemaHash: sha256(data["schema.cypher"]),
  };
  try {
    for (const [name, bytes] of Object.entries(data)) await writeFile(join(directory, name), bytes);
    await writeFile(
      join(directory, "manifest.json"),
      JSON.stringify({
        ...stamp,
        databaseHash: sha256(data["atlas.lbdb"]),
        bytes: Buffer.byteLength(data["atlas.lbdb"]),
      }),
    );
    assert.equal(await validKnowledgeCache(directory, stamp), true);
    for (const field of ["engineVersion", "storageVersion", "buildHash"] as const)
      assert.equal(await validKnowledgeCache(directory, { ...stamp, [field]: "changed" }), false);
    for (const [name, bytes] of Object.entries(data)) {
      await writeFile(join(directory, name), "tampered");
      assert.equal(await validKnowledgeCache(directory, stamp), false, name);
      await writeFile(join(directory, name), bytes);
      await rm(join(directory, name));
      assert.equal(await validKnowledgeCache(directory, stamp), false, `missing ${name}`);
      await writeFile(join(directory, name), bytes);
    }
    assert.equal(await validKnowledgeCache(directory, stamp), true);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
