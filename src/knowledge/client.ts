import { RELATIONSHIP_QUERY } from "./queries.ts";
import type { Connection, Database } from "@ladybugdb/wasm-core";
import {
  KNOWLEDGE_SCHEMA_VERSION,
  LADYBUG_VERSION,
  type AtlasMode,
  type KnowledgeManifest,
} from "./schema.ts";

// 0.22.3's FS declaration describes the sync API; the shipped async module exports an instance.
interface BrowserEngine {
  init(): Promise<void>;
  close(): Promise<void>;
  getVersion(): Promise<string>;
  getStorageVersion(): Promise<bigint>;
  setWorkerPath(path: string | URL): void;
  FS: { writeFile(path: string, bytes: Uint8Array): Promise<void> };
  Database: new (
    path: string,
    buffer: number,
    threads: number,
    compress: boolean,
    readOnly: boolean,
  ) => Database;
  Connection: new (db: Database, threads?: number) => Connection;
}
export interface KnowledgeDB {
  manifest: KnowledgeManifest;
  query(text: string, parameters?: Record<string, unknown>): Promise<Record<string, unknown>[]>;
}
export interface RelationshipRecord {
  id: string;
  domain: string;
  operation: string;
  label: string;
  description: string;
  status: string;
  basis: string;
  payload: string;
  subjectId: string;
  subjectTitle: string;
  objectId: string;
  objectTitle: string;
}
let pending: Promise<KnowledgeDB> | undefined;
const decode = (value: string) => Uint8Array.from(atob(value), (c) => c.charCodeAt(0));

async function openKnowledge(): Promise<KnowledgeDB> {
  const blobs: string[] = [];
  let engine: BrowserEngine | undefined;
  let db: Database | undefined;
  let connection: Connection | undefined;
  try {
    const inline = document.getElementById("atlas-knowledge-assets")?.textContent;
    const assets = inline ? (JSON.parse(inline) as Record<string, string>) : null;
    const base = new URL(`${import.meta.env.BASE_URL}knowledge/`, document.baseURI);
    const blobURL = (name: string) => {
      const bytes = decode(assets![name]!);
      const url = URL.createObjectURL(new Blob([bytes], { type: "text/javascript" }));
      blobs.push(url);
      return url;
    };
    const moduleURL = assets ? blobURL("lbug.js") : new URL("lbug.js", base).href;
    const fetchAsset = async (name: string) => {
      const response = await fetch(new URL(name, base));
      if (!response.ok) throw new Error(`配布データを取得できませんでした (${response.status})`);
      return new Uint8Array(await response.arrayBuffer());
    };
    const [module, manifestBytes, snapshot] = await Promise.all([
      import(/* @vite-ignore */ moduleURL) as Promise<{ default: BrowserEngine }>,
      assets ? decode(assets["manifest.json"]!) : fetchAsset("manifest.json"),
      assets ? decode(assets["atlas.lbdb"]!) : fetchAsset("atlas.lbdb"),
    ]);
    const manifest = JSON.parse(new TextDecoder().decode(manifestBytes)) as KnowledgeManifest;
    if (
      manifest.schemaVersion !== KNOWLEDGE_SCHEMA_VERSION ||
      manifest.engineVersion !== LADYBUG_VERSION
    )
      throw new Error("配布データとアプリの版が一致しません。ページを再読み込みしてください。");
    if (snapshot.byteLength !== manifest.bytes) throw new Error("配布DBのサイズが一致しません。");
    if (globalThis.crypto?.subtle) {
      const digest = await crypto.subtle.digest("SHA-256", snapshot);
      const actualHash = [...new Uint8Array(digest)]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      if (actualHash !== manifest.databaseHash) throw new Error("配布DBの検証に失敗しました。");
    }
    engine = module.default;
    // URL objects use a native Worker directly. The package's string-path wrapper
    // nests importScripts(blob:...), which cannot load an opaque-origin file:// blob.
    engine.setWorkerPath(
      assets ? new URL(blobURL("lbug_wasm_worker.js")) : new URL("lbug_wasm_worker.js", base),
    );
    await engine.init();
    if (
      (await engine.getVersion()) !== LADYBUG_VERSION ||
      String(await engine.getStorageVersion()) !== manifest.storageVersion
    )
      throw new Error("DBエンジンの版が配布データと一致しません。");
    await engine.FS.writeFile("/atlas.lbdb", snapshot);
    db = new engine.Database("/atlas.lbdb", 64 * 1024 * 1024, 1, true, true);
    connection = new engine.Connection(db, 1);
    await connection.init();
    const conn = connection;
    // Serialize requests on one connection; a failed query must not poison subsequent requests.
    let queue: Promise<unknown> = Promise.resolve();
    return {
      manifest,
      query(text, parameters = {}) {
        const run = queue.then(async () => {
          const prepared = await conn.prepare(text);
          try {
            if (!prepared.isSuccess()) throw new Error(await prepared.getErrorMessage());
            const result = await conn.execute(prepared, parameters);
            try {
              return await result.getAllObjects();
            } finally {
              await result.close();
            }
          } finally {
            await prepared.close();
          }
        });
        queue = run.catch(() => {});
        return run;
      },
    };
  } catch (error) {
    await connection?.close().catch(() => {});
    await db?.close().catch(() => {});
    await engine?.close().catch(() => {});
    blobs.forEach((url) => URL.revokeObjectURL(url));
    throw error;
  }
}

/** One engine per page, including React StrictMode remounts and mode changes. */
export function getKnowledgeDB(): Promise<KnowledgeDB> {
  return (pending ??= openKnowledge().catch((error: unknown) => {
    pending = undefined;
    throw error;
  }));
}

export async function queryRelationships(db: KnowledgeDB, mode: AtlasMode, id: string) {
  return (await db.query(RELATIONSHIP_QUERY, {
    domain: mode,
    id,
  })) as unknown as RelationshipRecord[];
}
