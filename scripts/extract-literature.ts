import { readFile, writeFile, mkdir, mkdtemp, rm } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, join, relative, sep } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import { DATA } from "../src/data/atlas.ts";
import catalogData from "../src/data/literature-catalog.json" with { type: "json" };
import type { LiteratureCatalog } from "../src/knowledge/catalog.ts";
import {
  extractionDictionary,
  extractionProposal,
  type DictionaryTerm,
  type PageText,
} from "./extraction-proposal.ts";
const args = process.argv.slice(2);
const value = (name: string) => {
  const i = args.indexOf(name);
  return i < 0 ? undefined : args[i + 1];
};
const allowed = new Set([
  "--asset",
  "--from",
  "--to",
  "--root",
  "--output",
  "--dictionary",
  "--anchors",
  "--operator",
  "--date",
  "--ocr",
  "--ocr-lang",
]);
for (let i = 0; i < args.length; i++) {
  if (!allowed.has(args[i]!)) throw new Error(`Unknown argument ${args[i]}`);
  if (args[i] !== "--ocr") {
    if (!args[i + 1] || args[i + 1]!.startsWith("--")) throw new Error(`Missing value ${args[i]}`);
    i++;
  }
}
const catalog = catalogData as LiteratureCatalog;
const hash = value("--asset");
const from = Number(value("--from"));
const to = Number(value("--to"));
const asset = catalog.assets.find((a) => a.sha256 === hash);
if (
  !asset ||
  !Number.isSafeInteger(from) ||
  !Number.isSafeInteger(to) ||
  from < 1 ||
  to < from ||
  asset.pageCount === null ||
  to > asset.pageCount
)
  throw new Error(
    "Provide --asset <sha256> --from <PDF page> --to <PDF page> within catalog bounds",
  );
const root = resolve(value("--root") ?? "refs");
const file = resolve(root, asset.locations[0]!.path);
const checksum = async () => {
  const h = createHash("sha256");
  for await (const chunk of createReadStream(file)) h.update(chunk);
  return h.digest("hex");
};
if ((await checksum()) !== hash)
  throw new Error(
    "PDF hash differs from the catalog; do not transfer coverage to replacement bytes",
  );
const out = resolve(
  value("--output") ?? join(root, "curation", "extractions", `${hash}-${from}-${to}.json`),
);
const outRelative = relative(join(root, "curation"), out);
if (
  outRelative.startsWith(`..${sep}`) ||
  outRelative === ".." ||
  outRelative.startsWith(sep) ||
  !out.endsWith(".json")
)
  throw new Error(
    "Proposals must be JSON inside refs/curation; review before copying metadata into src/data",
  );
const version = (program: string) =>
  execFileSync(program, [program === "tesseract" ? "--version" : "-v"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  })
    .split("\n")[0]!
    .trim();
// Poppler writes version to stderr, while Tesseract writes to stdout.
const { spawnSync } = await import("node:child_process");
const probe = spawnSync("pdftotext", ["-v"], { encoding: "utf8" });
if (probe.status !== 0) throw new Error("pdftotext is required");
let toolVersion = (probe.stdout + probe.stderr).split("\n")[0]!.trim();
const ocr = args.includes("--ocr");
const ocrLanguage = value("--ocr-lang") ?? "eng";
if (!/^[A-Za-z_+0-9]+$/.test(ocrLanguage)) throw new Error("Invalid OCR language code");
if (ocr) toolVersion += " / " + version("tesseract");
const anchors = value("--anchors")
  ? (JSON.parse(await readFile(value("--anchors")!, "utf8")) as Record<string, number>)
  : {};
const dictionary: DictionaryTerm[] = value("--dictionary")
  ? (JSON.parse(await readFile(value("--dictionary")!, "utf8")) as DictionaryTerm[])
  : extractionDictionary(DATA);
const work = await mkdtemp(join(tmpdir(), "atlas-extract-"));
try {
  const pages: PageText[] = [];
  for (let p = from; p <= to; p++) {
    let text = execFileSync("pdftotext", ["-f", String(p), "-l", String(p), "-layout", file, "-"], {
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
    });
    let textState: PageText["textState"] = text.trim() ? "selectable_text" : "no_text";
    if (textState === "no_text" && ocr) {
      const image = join(work, `page-${p}`);
      execFileSync(
        "pdftoppm",
        ["-f", String(p), "-l", String(p), "-r", "200", "-png", "-singlefile", file, image],
        { stdio: "pipe" },
      );
      text = execFileSync("tesseract", [image + ".png", "stdout", "-l", ocrLanguage], {
        encoding: "utf8",
        maxBuffer: 32 * 1024 * 1024,
      });
      textState = text.trim() ? "ocr_text" : "no_text";
    }
    pages.push({ pdfPage: p, text, printedPage: anchors[String(p)] ?? null, textState });
  }
  if ((await checksum()) !== hash) throw new Error("PDF changed during extraction");
  const proposal = extractionProposal(DATA, catalog, hash!, pages, dictionary, {
    operator: value("--operator") ?? "unreviewed_machine",
    date: value("--date") ?? new Date().toISOString().slice(0, 10),
    tool: ocr
      ? `pdftotext-layout + tesseract fallback (lang=${ocrLanguage}, dpi=200)`
      : "pdftotext-layout",
    version: toolVersion,
  });
  await mkdir(resolve(out, ".."), { recursive: true });
  await writeFile(out, JSON.stringify(proposal, null, 2) + "\n", { flag: "wx" });
  console.log(
    `Proposal: ${pages.length} PDF pages, ${proposal.matches.length} literal matches; review required; ledger unchanged${proposal.batch ? "" : "; bibliographic binding blocked"}`,
  );
  console.log(relative(process.cwd(), out));
} finally {
  await rm(work, { recursive: true, force: true });
}
