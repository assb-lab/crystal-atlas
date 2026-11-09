import { readFile, writeFile, rename } from "node:fs/promises";
import { resolve } from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { DATA } from "../src/data/atlas.ts";
import { scanCatalog } from "./catalog-scan.ts";
import type { LiteratureCatalog } from "../src/knowledge/catalog.ts";

const root = resolve(process.argv[2] ?? "refs");
const output = resolve(process.argv[3] ?? "src/data/literature-catalog.json");
let previous: LiteratureCatalog | undefined;
try {
  previous = JSON.parse(await readFile(output, "utf8"));
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}
// Fail clearly if the probe is missing, rather than label every PDF unreadable.
const result = spawnSync("pdfinfo", ["-v"], { encoding: "utf8" });
if (result.error || result.status !== 0)
  throw new Error("pdfinfo is required to scan PDFs", { cause: result.error });
const probe = (result.stdout + result.stderr).split("\n")[0]!.trim();
const catalog = await scanCatalog(root, DATA.sources, previous, probe);
const formatted = execFileSync("pnpm", ["exec", "vp", "fmt", `--stdin-filepath=${output}`], {
  input: JSON.stringify(catalog),
  encoding: "utf8",
});
// Keep the generated JSON identical to the repository formatter's canonical output.
if (JSON.stringify(JSON.parse(formatted)) !== JSON.stringify(catalog))
  throw new Error("Catalog formatter changed data");
await writeFile(output + ".tmp", formatted);
await rename(output + ".tmp", output);
console.log(
  `Catalog: ${catalog.assets.length} unique assets, ${catalog.assets.reduce((n, a) => n + a.locations.length, 0)} file locations; inventory only`,
);
