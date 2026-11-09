export const CHANNELS = ["body", "figures", "tables", "index"] as const;
export type ReviewState = "not_started" | "in_progress" | "reviewed" | "not_applicable";
export interface CoverageRange {
  from: number;
  to: number | null;
  channels: Record<(typeof CHANNELS)[number], ReviewState>;
  note: string;
  printedPageMapping: string | null;
}
export interface BibliographicIdentification {
  reviewedOn: string;
  reviewer: string;
  method: "text_and_page_image" | "page_image";
  documentPart: "main" | "supplement" | "excerpt";
  checks: {
    pdfPages: number[];
    field: "title_authors" | "publication" | "doi" | "document_part" | "series" | "identity_limits";
    finding: string;
  }[];
  limitations: string[];
}
export interface CatalogAsset {
  sha256: string;
  bytes: number;
  locations: { path: string; roles: ("primary" | "supplement" | "curation")[] }[];
  pageCount: number | null;
  readState: "readable" | "unreadable";
  mapping: {
    state: "unmatched" | "candidate" | "confirmed";
    documentIds: string[];
    basis: string;
  };
  coverage: CoverageRange[];
  /** Identity checks do not count as review of structural content on these pages. */
  identification?: BibliographicIdentification;
}
export interface LiteratureCatalog {
  version: 1;
  probe: string;
  assets: CatalogAsset[];
}
export const assetId = (sha256: string) => `asset:${sha256}`;
export function initialCoverage(pageCount: number | null): CoverageRange[] {
  return [
    {
      from: 1,
      to: pageCount,
      channels: {
        body: "not_started",
        figures: "not_started",
        tables: "not_started",
        index: "not_started",
      },
      note: "",
      printedPageMapping: null,
    },
  ];
}
/** Reject malformed or overclaimed ledgers before generating the public snapshot. */
export function validateCatalog(catalog: LiteratureCatalog, documentIds: Set<string>): void {
  if (catalog.version !== 1 || !catalog.probe) throw new Error("Invalid catalog version/probe");
  const hashes = new Set<string>();
  const paths = new Set<string>();
  for (const a of catalog.assets) {
    if (!/^[a-f0-9]{64}$/.test(a.sha256) || hashes.has(a.sha256))
      throw new Error("Invalid/duplicate asset hash");
    hashes.add(a.sha256);
    if (!Number.isSafeInteger(a.bytes) || a.bytes < 0 || !a.locations.length)
      throw new Error("Invalid asset metadata");
    for (const loc of a.locations) {
      if (
        !loc.path ||
        loc.path.includes("\\") ||
        loc.path.split("").some((c) => c.charCodeAt(0) < 32) ||
        loc.path.startsWith("/") ||
        /^[A-Za-z]:/.test(loc.path) ||
        loc.path.split("/").some((p) => !p || p === "." || p === "..") ||
        paths.has(loc.path)
      )
        throw new Error("Invalid/duplicate relative path");
      paths.add(loc.path);
      if (
        !loc.roles.length ||
        loc.roles.some((r) => !["primary", "supplement", "curation"].includes(r))
      )
        throw new Error("Invalid role");
    }
    if (!["readable", "unreadable"].includes(a.readState)) throw new Error("Invalid read state");
    if (a.pageCount !== null && (!Number.isSafeInteger(a.pageCount) || a.pageCount < 1))
      throw new Error("Invalid page count");
    if ((a.readState === "readable") !== (a.pageCount !== null))
      throw new Error("Readability/page count mismatch");
    const m = a.mapping;
    if (
      !["unmatched", "candidate", "confirmed"].includes(m.state) ||
      m.documentIds.some((id) => !documentIds.has(id)) ||
      new Set(m.documentIds).size !== m.documentIds.length
    )
      throw new Error("Invalid document mapping");
    if (
      (m.state === "unmatched") !== (m.documentIds.length === 0) ||
      (m.state === "confirmed" && (m.documentIds.length !== 1 || !m.basis.trim()))
    )
      throw new Error("Mapping requires explicit basis");
    const identification = a.identification;
    if (m.state === "confirmed" && !identification)
      throw new Error("Confirmed mapping requires page-level identification checks");
    if (identification) {
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(identification.reviewedOn) ||
        !identification.reviewer.trim() ||
        !["text_and_page_image", "page_image"].includes(identification.method) ||
        !["main", "supplement", "excerpt"].includes(identification.documentPart) ||
        !identification.checks.length ||
        identification.limitations.some((s) => !s.trim())
      )
        throw new Error("Invalid bibliographic identification");
      for (const check of identification.checks) {
        if (
          !check.finding.trim() ||
          ![
            "title_authors",
            "publication",
            "doi",
            "document_part",
            "series",
            "identity_limits",
          ].includes(check.field) ||
          !check.pdfPages.length ||
          new Set(check.pdfPages).size !== check.pdfPages.length ||
          check.pdfPages.some(
            (page) =>
              !Number.isSafeInteger(page) || page < 1 || a.pageCount === null || page > a.pageCount,
          )
        )
          throw new Error("Invalid identification page/field");
      }
      if (
        m.state === "confirmed" &&
        (!identification.checks.some((c) => c.field === "title_authors") ||
          !identification.checks.some(
            (c) =>
              c.field ===
              (identification.documentPart === "supplement" ? "document_part" : "publication"),
          ))
      )
        throw new Error(
          "Confirmed mapping requires title/authors and publication or supplement checks",
        );
    }
    let next = 1;
    for (const range of a.coverage) {
      if (
        range.from !== next ||
        (range.to !== null && (!Number.isSafeInteger(range.to) || range.to < range.from))
      )
        throw new Error("Coverage must partition PDF pages without gaps/overlaps");
      if (range.to === null && (a.pageCount !== null || a.coverage.length !== 1))
        throw new Error("Unknown extent must remain explicit");
      for (const channel of CHANNELS) {
        const status = range.channels[channel];
        if (!["not_started", "in_progress", "reviewed", "not_applicable"].includes(status))
          throw new Error("Invalid review status");
        if (status !== "not_started" && (!range.note.trim() || a.pageCount === null))
          throw new Error("Review status requires known pages and an audit note");
      }
      next = range.to === null ? 0 : range.to + 1;
    }
    if (!a.coverage.length || (a.pageCount === null ? next !== 0 : next !== a.pageCount + 1))
      throw new Error("Coverage extent mismatch");
  }
}
