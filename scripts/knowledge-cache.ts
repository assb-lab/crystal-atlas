import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { KnowledgeManifest } from "../src/knowledge/schema.ts";

export const sha256 = (bytes: string | Uint8Array) =>
  createHash("sha256").update(bytes).digest("hex");
export type BuildStamp = Pick<
  KnowledgeManifest,
  | "schemaVersion"
  | "engineVersion"
  | "storageVersion"
  | "datasetHash"
  | "datasetVersion"
  | "buildHash"
  | "datasetFileHash"
  | "schemaHash"
>;

/** An incomplete or stale auxiliary artifact invalidates the entire generated bundle. */
export async function validKnowledgeCache(directory: string, stamp: BuildStamp): Promise<boolean> {
  try {
    const [manifestBytes, database, dataset, schema] = await Promise.all(
      ["manifest.json", "atlas.lbdb", "dataset.json", "schema.cypher"].map((name) =>
        readFile(join(directory, name)),
      ),
    );
    const manifest = JSON.parse(manifestBytes!.toString("utf8")) as KnowledgeManifest;
    return (
      Object.entries(stamp).every(
        ([k, value]) => manifest[k as keyof KnowledgeManifest] === value,
      ) &&
      sha256(database!) === manifest.databaseHash &&
      database!.byteLength === manifest.bytes &&
      sha256(dataset!) === stamp.datasetFileHash &&
      sha256(schema!) === stamp.schemaHash
    );
  } catch {
    return false;
  }
}
