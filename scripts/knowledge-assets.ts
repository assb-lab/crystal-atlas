import { gzipSync } from "node:zlib";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import type { Plugin } from "vite-plus";
import { sha256 } from "./knowledge-cache.ts";
import type { KnowledgeDistributionManifest, KnowledgeManifest } from "../src/knowledge/schema.ts";
import { snapshotWorker } from "../src/knowledge/worker-compat.ts";

const require = createRequire(import.meta.url);
const engineDir = dirname(require.resolve("@ladybugdb/wasm-core"));
const paths: Record<string, string> = {
  "atlas.lbdb": resolve(".atlas-build/atlas.lbdb"),
  "manifest.json": resolve(".atlas-build/manifest.json"),
  "dataset.json": resolve(".atlas-build/dataset.json"),
  "schema.cypher": resolve(".atlas-build/schema.cypher"),
  "lbug.js": resolve(engineDir, "index.js"),
  "lbug_wasm_worker.js": resolve(engineDir, "lbug_wasm_worker.js"),
  "LADYBUG-LICENSE.txt": resolve(engineDir, "LICENSE"),
};
async function asset(name: string) {
  const bytes = await readFile(paths[name]!);
  if (name !== "lbug_wasm_worker.js" && name !== "lbug.js") return bytes;
  const license = await readFile(paths["LADYBUG-LICENSE.txt"]!, "utf8");
  const source =
    name === "lbug_wasm_worker.js"
      ? snapshotWorker(bytes.toString("utf8"))
      : bytes.toString("utf8");
  return Buffer.from(`/* LadybugDB license\n${license.replaceAll("*/", "* /")}\n*/\n${source}`);
}

/** Content-address the binary/module/worker as one coherent distributed release. */
async function distribution() {
  const files = new Map(
    await Promise.all(Object.keys(paths).map(async (name) => [name, await asset(name)] as const)),
  );
  const original = JSON.parse(files.get("manifest.json")!.toString("utf8")) as KnowledgeManifest;
  if (sha256(files.get("atlas.lbdb")!) !== original.databaseHash)
    throw new Error("Snapshot changed during distribution build");
  const manifest: KnowledgeDistributionManifest = {
    ...original,
    files: {
      database: `atlas.${original.databaseHash}.lbdb`,
      module: `lbug.${sha256(files.get("lbug.js")!)}.js`,
      worker: `lbug_wasm_worker.${sha256(files.get("lbug_wasm_worker.js")!)}.js`,
    },
  };
  for (const [before, after] of [
    ["atlas.lbdb", manifest.files.database],
    ["lbug.js", manifest.files.module],
    ["lbug_wasm_worker.js", manifest.files.worker],
  ] as const) {
    files.set(after, files.get(before)!);
    files.delete(before);
  }
  files.set("manifest.json", Buffer.from(JSON.stringify(manifest, null, 2)));
  return { files, manifest };
}

/** Serve the exact same snapshot/engine in development, static hosting and file:// exports. */
export function knowledgeAssets(): Plugin {
  let standalone = false;
  let prepared: ReturnType<typeof distribution> | undefined;
  const getDistribution = () =>
    (prepared ??= distribution().catch((error: unknown) => {
      prepared = undefined;
      throw error;
    }));
  return {
    name: "crystal-atlas:knowledge-assets",
    config(_, env) {
      standalone = env.mode === "standalone";
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith("/knowledge/")) return next();
        const name = req.url.split("?")[0]!.slice("/knowledge/".length);
        void getDistribution()
          .then(({ files }) => {
            const data = files.get(name);
            if (!data) return next();
            res.setHeader(
              "Content-Type",
              name.endsWith(".js")
                ? "text/javascript"
                : name.endsWith(".json")
                  ? "application/json"
                  : "application/octet-stream",
            );
            res.setHeader(
              "Cache-Control",
              /\.[a-f0-9]{64}\./.test(name) ? "public, max-age=31536000, immutable" : "no-cache",
            );
            res.end(data);
          })
          .catch((error: unknown) => {
            res.statusCode = 500;
            res.end(String(error));
          });
      });
    },
    async transformIndexHtml() {
      if (!standalone) return;
      const { files, manifest } = await getDistribution();
      const names = [
        ["manifest.json", "manifest.json"],
        ["atlas.lbdb", manifest.files.database],
        ["lbug.js", manifest.files.module],
        ["lbug_wasm_worker.js", manifest.files.worker],
      ] as const;
      const assets = Object.fromEntries(
        names.map(([key, name]) => [
          key,
          gzipSync(files.get(name)!, { level: 9 }).toString("base64"),
        ]),
      );
      return [
        {
          tag: "script",
          attrs: {
            id: "atlas-knowledge-assets",
            type: "application/json",
            "data-compression": "gzip",
          },
          children: JSON.stringify(assets),
          injectTo: "body",
        },
      ];
    },
    async generateBundle() {
      if (standalone) return;
      for (const [name, source] of (await getDistribution()).files)
        this.emitFile({ type: "asset", fileName: `knowledge/${name}`, source });
    },
  };
}
