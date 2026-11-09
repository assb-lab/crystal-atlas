import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import { join, basename } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  initialCoverage,
  validateCatalog,
  type LiteratureCatalog,
  type CatalogAsset,
} from "../src/knowledge/catalog.ts";

const exec = promisify(execFile);
type Sources = Record<string, { filename?: string | null }>;
export async function pdfPages(path: string): Promise<number | null> {
  try {
    const { stdout } = await exec("pdfinfo", [path], {
      timeout: 30000,
      maxBuffer: 1024 * 1024,
      env: { ...process.env, LC_ALL: "C" },
    });
    const pages = Number(/^Pages:\s+(\d+)\s*$/m.exec(stdout)?.[1]);
    return Number.isSafeInteger(pages) && pages > 0 ? pages : null;
  } catch {
    return null;
  }
}
/** No symlinks, timestamps, PDF text or machine-specific paths enter the catalog. */
export async function scanCatalog(
  root: string,
  sources: Sources,
  previous?: LiteratureCatalog,
  probe = "pdfinfo",
  readPages = pdfPages,
): Promise<LiteratureCatalog> {
  const documentIds = new Set(Object.keys(sources));
  if (previous) validateCatalog(previous, documentIds);
  const old = new Map(previous?.assets.map((a) => [a.sha256, a]));
  const grouped = new Map<string, CatalogAsset>();
  async function visit(dir: string, prefix = "") {
    const entries = (await readdir(dir, { withFileTypes: true })).sort((a, b) =>
      a.name < b.name ? -1 : a.name > b.name ? 1 : 0,
    );
    for (const entry of entries) {
      if (entry.isSymbolicLink()) continue;
      const relative = prefix + entry.name;
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        await visit(path, relative + "/");
        continue;
      }
      if (!entry.isFile() || !/\.pdf$/i.test(entry.name)) continue;
      const before = await stat(path);
      const digest = createHash("sha256");
      for await (const chunk of createReadStream(path)) digest.update(chunk);
      const sha256 = digest.digest("hex");
      const pages = await readPages(path);
      const after = await stat(path);
      // A moving input has no trustworthy content identity. Abort rather than reuse old review data.
      if (
        before.size !== after.size ||
        before.mtimeMs !== after.mtimeMs ||
        before.ino !== after.ino
      )
        throw new Error(`PDF changed during scan: ${relative}`);
      const roles: CatalogAsset["locations"][number]["roles"] =
        /(?:^|[-_ ])(?:si|supplement(?:ary)?)(?:[-_. ]|$)/i.test(basename(relative))
          ? ["supplement"]
          : ["primary"];
      if (relative.startsWith("curation/")) roles.push("curation");
      const location = { path: relative, roles };
      const prior = old.get(sha256);
      const candidates = Object.entries(sources)
        .filter(([, s]) => s.filename?.normalize("NFC") === entry.name.normalize("NFC"))
        .map(([id]) => id)
        .sort();
      const existing = grouped.get(sha256);
      if (existing) {
        existing.locations.push(location);
        if (existing.mapping.state !== "confirmed") {
          existing.mapping.documentIds = [
            ...new Set([...existing.mapping.documentIds, ...candidates]),
          ].sort();
          existing.mapping.state = existing.mapping.documentIds.length ? "candidate" : "unmatched";
          existing.mapping.basis = existing.mapping.documentIds.length
            ? "filename_only_not_edition_verified"
            : "";
        }
        continue;
      }
      if (
        prior &&
        prior.pageCount !== pages &&
        (prior.identification ||
          prior.coverage.some(
            (r) =>
              r.printedPageMapping || Object.values(r.channels).some((s) => s !== "not_started"),
          ))
      )
        throw new Error(`Page count changed for reviewed asset: ${relative}`);
      grouped.set(sha256, {
        sha256,
        bytes: after.size,
        locations: [location],
        pageCount: pages,
        readState: pages === null ? "unreadable" : "readable",
        mapping:
          prior?.mapping.state === "confirmed"
            ? prior.mapping
            : {
                state: candidates.length ? "candidate" : "unmatched",
                documentIds: candidates,
                basis: candidates.length ? "filename_only_not_edition_verified" : "",
              },
        coverage: prior && prior.pageCount === pages ? prior.coverage : initialCoverage(pages),
        ...(prior?.identification ? { identification: prior.identification } : {}),
      });
    }
  }
  await visit(root);
  // Preserve an unresolved identification note too, if the candidate set is unchanged.
  for (const asset of grouped.values()) {
    const prior = old.get(asset.sha256);
    if (
      prior?.identification &&
      JSON.stringify(prior.mapping.documentIds) === JSON.stringify(asset.mapping.documentIds)
    )
      asset.mapping = prior.mapping;
  }
  const catalog: LiteratureCatalog = {
    version: 1,
    probe,
    assets: [...grouped.values()].sort((a, b) => (a.sha256 < b.sha256 ? -1 : 1)),
  };
  validateCatalog(catalog, documentIds);
  return catalog;
}
