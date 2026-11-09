import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import type { Plugin } from "vite-plus";
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

/** Serve the exact same snapshot/engine in development, static hosting and file:// exports. */
export function knowledgeAssets(): Plugin {
  let standalone = false;
  return {
    name: "crystal-atlas:knowledge-assets",
    config(_, env) {
      standalone = env.mode === "standalone";
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const name = req.url?.split("?")[0]?.replace(/^\/knowledge\//, "");
        if (!name || !Object.hasOwn(paths, name)) return next();
        void asset(name)
          .then((data) => {
            res.setHeader(
              "Content-Type",
              name.endsWith(".js")
                ? "text/javascript"
                : name.endsWith(".json")
                  ? "application/json"
                  : "application/octet-stream",
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
      const files = ["atlas.lbdb", "manifest.json", "lbug.js", "lbug_wasm_worker.js"];
      const assets = Object.fromEntries(
        await Promise.all(
          files.map(async (name) => [name, (await asset(name)).toString("base64")]),
        ),
      );
      return [
        {
          tag: "script",
          attrs: { id: "atlas-knowledge-assets", type: "application/json" },
          children: JSON.stringify(assets),
          injectTo: "body",
        },
      ];
    },
    async generateBundle() {
      if (standalone) return;
      for (const name of Object.keys(paths))
        this.emitFile({
          type: "asset",
          fileName: `knowledge/${name}`,
          source: await asset(name),
        });
    },
  };
}
