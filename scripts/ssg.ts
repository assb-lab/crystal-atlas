import type { Plugin } from "vite-plus";
import { knowledgeDataset, type KnowledgeDataset } from "../src/knowledge/dataset.ts";
import { DATA } from "../src/data/atlas.ts";
import { recordTables, recordLabels } from "../src/knowledge/records.ts";
import { recordKinds, recordPath, referenceHash } from "../src/knowledge/navigation.ts";
import { TABLES } from "../src/knowledge/schema.ts";
const escape = (s: unknown) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
const page = (title: string, body: string) =>
  `<!doctype html><html lang="ja"><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)} · Crystal Atlas</title><meta name="description" content="Crystal Atlasの出典・未確認事項を含む静的レコード"><style>body{font:16px/1.7 system-ui;max-width:1000px;margin:auto;padding:24px;background:#0d1822;color:#e3edf5;overflow-wrap:anywhere}a{color:#6be3d1;margin-right:12px}pre{white-space:pre-wrap;font-size:13px;border:1px solid #314555;padding:14px}li{margin:8px 0}small{color:#b2c4d1}</style><main>${body}</main></html>`;
export function staticRecordPages(dataset: KnowledgeDataset) {
  const { rows } = dataset;
  const output = new Map<string, string>();
  const index: string[] = [];
  const references = new Map(rows.SourceSpan!.map((r) => [String(r[0]), JSON.parse(String(r[1]))]));
  for (const kind of recordKinds) {
    const table = recordTables[kind];
    const columns = TABLES.find((t) => t.name === table.table)!.columns;
    const titleAt = columns.findIndex((c) => c[0] === table.title);
    const payloadAt = columns.findIndex((c) => c[0] === table.payload);
    for (const row of rows[table.table]!) {
      const id = String(row[0]);
      const title = String(row[titleAt]);
      const payload = JSON.parse(String(row[payloadAt]));
      const evidence = (
        kind === "assertion" ? rows.HasEvidence : kind === "candidate" ? rows.CandidateEvidence : []
      )!
        .filter((r) => r[0] === id)
        .map((r) => references.get(String(r[1])));
      if (kind === "mention")
        for (const [span, mention] of rows.ContainsMention!)
          if (mention === id) evidence.push(references.get(String(span)));
      const linked: Record<string, unknown> = {};
      if (kind === "assertion") {
        const ids = rows.MappingFor!.filter((r) => r[1] === id).map((r) => r[0]);
        linked.symmetryMappings = rows
          .SymmetryMapping!.filter((r) => ids.includes(r[0]))
          .map((r) => JSON.parse(String(r[1])));
        const validationIds = rows.Validates!.filter((r) => ids.includes(r[1])).map((r) => r[0]);
        linked.idealModelValidation = rows
          .SymmetryValidation!.filter((r) => validationIds.includes(r[0]))
          .map((r) => JSON.parse(String(r[1])));
      }
      if (kind === "entity" || kind === "model") {
        const models =
          kind === "model"
            ? [id]
            : [...rows.Models!, ...rows.IllustratesPrototype!]
                .filter((r) => r[1] === id)
                .map((r) => String(r[0]));
        const contextIds = rows
          .ContextFor!.filter((r) => models.includes(String(r[1])))
          .map((r) => r[0]);
        linked.modelContexts = rows
          .ModelContext!.filter((r) => contextIds.includes(r[0]))
          .map((r) => JSON.parse(String(r[2])));
      }
      if (kind === "mention" || kind === "candidate")
        linked.decisionHistory = rows
          .CandidateDecision!.filter((r) => r[2] === id)
          .map((r) => ({
            current: !rows.SupersedesDecision!.some((edge) => edge[1] === r[0]),
            ...JSON.parse(String(r[5])),
          }));
      const properties = Object.fromEntries(
        columns.map(([name], i) => [name, row[i]]).filter(([name]) => name !== table.payload),
      );
      const refList = evidence
        .filter(Boolean)
        .map(
          (r) =>
            `<li><a href="../document/${escape(recordPath("document", r.s).split("/").at(-1))}">${escape(r.s)}</a> ${escape(r.p === undefined ? "印刷頁未確認" : `印刷p.${r.p}`)} ${r.pdfPage ? ` / PDF ${escape(r.pdfPage)}` : ""} · ${escape(r.sec)}</li>`,
        )
        .join("");
      const endpoints =
        kind === "assertion"
          ? [...rows.Subject!, ...rows.Object!]
              .filter((r) => r[0] === id)
              .map(
                (r) =>
                  `<a href="../entity/${escape(recordPath("entity", String(r[1])).split("/").at(-1))}">${escape(r[1])}</a>`,
              )
              .join(" → ")
          : "";
      output.set(
        recordPath(kind, id),
        page(
          title,
          `<nav><a href="../../records/index.html">公開レコード索引</a><a href="../../index.html${escape(referenceHash({ kind, id }))}">アプリで探索</a></nav><p>${escape(recordLabels[kind])}</p><h1>${escape(title)}</h1><code>${escape(id)}</code><p>${escape(kind === "assertion" ? `状態: ${row[5]} / 根拠の種別: ${row[6]}` : "記述・模型・候補の同一性と検証状態は内容の個別記録を参照してください。")}</p><p>${endpoints}</p><h2>根拠</h2>${refList ? `<ul>${refList}</ul>` : "<p>この記録への根拠リンクは未登録です。編集上の項目や未判断候補を、文献確認済みとは扱いません。</p>"}<h2>内容と未確認事項</h2><pre>${escape(JSON.stringify({ properties, payload, ...linked }, null, 2))}</pre><small>ビルド時に生成した静的な記録です。調査の網羅性・実試料の同一性を保証しません。参照文献の全文・PDFは同梱しません。</small>`,
        ),
      );
      index.push(
        `<li><a href="../${escape(recordPath(kind, id))}">${escape(recordLabels[kind])} · ${escape(title)}</a></li>`,
      );
    }
  }
  output.set(
    "records/index.html",
    page(
      "公開レコード索引",
      `<a href="../index.html">アプリ</a><h1>公開レコード索引</h1><p>${index.length}件すべて（公開する主要レコード10種類）。対象・文献・主張・操作・分類・候補・模型・資産。JavaScriptやWASMを必要としない静的ページです。</p><ul>${index.join("")}</ul>`,
    ),
  );
  return output;
}
export function atlasSSG(): Plugin {
  let standalone = false;
  return {
    name: "crystal-atlas:ssg",
    config(_, env) {
      standalone = env.mode === "standalone";
    },
    generateBundle() {
      if (standalone) return;
      for (const [fileName, source] of staticRecordPages(knowledgeDataset(DATA)))
        this.emitFile({ type: "asset", fileName, source });
    },
  };
}
