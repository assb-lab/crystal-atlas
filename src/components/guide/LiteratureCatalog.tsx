import { useEffect, useState } from "react";
import { DATA } from "../../data/atlas.ts";
import { CHANNELS, type CatalogAsset, type CoverageRange } from "../../knowledge/catalog.ts";
import { getKnowledgeDB, resetKnowledgeDB } from "../../knowledge/client.ts";
import { CATALOG_QUERY, COVERAGE_QUERY } from "../../knowledge/queries.ts";
import "../../styles/catalog.css";

const channelNames = { body: "本文", figures: "図", tables: "表", index: "索引" };
const states = {
  not_started: "未調査",
  in_progress: "調査中",
  reviewed: "照合済み",
  not_applicable: "対象なし（確認済み）",
};
const identificationFields = {
  title_authors: "タイトル・著者",
  publication: "出版・版情報",
  doi: "DOI",
  document_part: "資料の区分",
  series: "シリーズ",
  identity_limits: "識別上の制限",
};
interface Entry {
  id: string;
  asset: CatalogAsset;
}
export function LiteratureCatalog() {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState("");
  const [rangeResult, setRangeResult] = useState<{ id: string; ranges: CoverageRange[] } | null>(
    null,
  );
  const ranges = rangeResult?.id === selected ? rangeResult.ranges : null;
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!open) return;
    let active = true;
    void getKnowledgeDB()
      .then((db) => db.query(CATALOG_QUERY))
      .then((rows) => {
        if (!active) return;
        const items = rows.map((r) => ({
          id: String(r.id),
          asset: JSON.parse(String(r.payload)) as CatalogAsset,
        }));
        items.sort((a, b) => a.asset.locations[0]!.path.localeCompare(b.asset.locations[0]!.path));
        setError("");
        setEntries(items);
        setLoaded(true);
        setSelected((id) => (items.some((entry) => entry.id === id) ? id : (items[0]?.id ?? "")));
      })
      .catch((e: unknown) => {
        if (active) setError(String(e));
      });
    return () => {
      active = false;
    };
  }, [open, attempt]);
  useEffect(() => {
    if (!open || !selected || !entries.length) return;
    let active = true;
    void getKnowledgeDB()
      .then((db) => db.query(COVERAGE_QUERY, { id: selected }))
      .then((rows) => {
        if (active)
          setRangeResult({
            id: selected,
            ranges: rows
              .map((r) => JSON.parse(String(r.payload)) as CoverageRange)
              .sort((a, b) => a.from - b.from),
          });
      })
      .catch((e: unknown) => {
        if (active) setError(String(e));
      });
    return () => {
      active = false;
    };
  }, [open, selected, entries]);
  const current = entries.find((entry) => entry.id === selected)?.asset;
  const knownPages = entries.reduce((n, entry) => n + (entry.asset.pageCount ?? 0), 0);
  const unknown = entries.filter((entry) => entry.asset.pageCount === null).length;
  return (
    <section className="literature-catalog panel" aria-label="文献目録と調査台帳">
      <details open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
        <summary>文献目録とページ調査台帳</summary>
        <div className="panelbody">
          <p>
            ファイルの役割は名前・配置による初期ラベルです。ファイルの確認と構造の抽出・照合は別の作業です。本文・図・表・索引を個別に記録します。初期台帳は全範囲が未調査で、文献網羅率を示すものではありません。
          </p>
          {error ? (
            <div role="alert">
              <p>{error}</p>
              <button
                onClick={() => {
                  setError("");
                  setEntries([]);
                  setLoaded(false);
                  setRangeResult(null);
                  void resetKnowledgeDB()
                    .then(() => setAttempt((n) => n + 1))
                    .catch((e: unknown) => setError(String(e)));
                }}
              >
                再試行
              </button>
            </div>
          ) : !loaded ? (
            <p role="status">目録を読み込み中…</p>
          ) : !entries.length ? (
            <p>目録にPDF資産は登録されていません。</p>
          ) : (
            <>
              <p data-testid="catalog-ready">
                {entries.length} 資産 ／ {entries.reduce((n, e) => n + e.asset.locations.length, 0)}{" "}
                ファイル配置 ／ ページ数判明分 {knownPages.toLocaleString()} ページ ／ ページ数不明{" "}
                {unknown} 資産
              </p>
              <label htmlFor="catalogAsset">資料ファイル</label>
              <select
                id="catalogAsset"
                value={selected}
                onChange={(event) => setSelected(event.target.value)}
              >
                {entries.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.asset.locations[0]!.path}
                  </option>
                ))}
              </select>
              {current && (
                <article data-testid="catalog-detail">
                  <h3>{current.locations[0]!.path}</h3>
                  <p>
                    {current.readState === "readable"
                      ? "PDFページ数取得済み"
                      : "読取不能・ページ数未確認"}{" "}
                    ·{" "}
                    {current.pageCount === null
                      ? "総ページ数不明"
                      : `${current.pageCount} PDFページ`}{" "}
                    · {current.bytes.toLocaleString()} bytes
                  </p>
                  <p>
                    SHA-256: <code>{current.sha256}</code>
                  </p>
                  <ul>
                    {current.locations.map((location) => (
                      <li key={location.path}>
                        {location.path} —{" "}
                        {location.roles
                          .map(
                            (r) =>
                              ({
                                primary: "主資料",
                                supplement: "補足資料",
                                curation: "curation配置",
                              })[r],
                          )
                          .join(" / ")}
                      </li>
                    ))}
                  </ul>
                  <p>
                    {current.mapping.state === "confirmed"
                      ? "書誌対応確認済み（照合範囲は下記）"
                      : current.mapping.state === "candidate"
                        ? "ファイル名による書誌候補（版の対応は未確認）"
                        : "書誌未対応"}
                  </p>
                  {current.mapping.documentIds.map((id) => (
                    <p key={id}>
                      <a href={`#source-${id}`}>
                        [{id}] {DATA.sources[id]?.title}
                      </a>
                    </p>
                  ))}
                  {current.mapping.basis && (
                    <p className="muted">対応根拠: {current.mapping.basis}</p>
                  )}
                  {current.identification && (
                    <section aria-label="書誌識別の確認記録">
                      <h4>書誌識別の確認記録</h4>
                      <p>
                        {current.identification.reviewedOn} · {current.identification.reviewer} ·{" "}
                        {current.identification.method === "page_image"
                          ? "ページ画像を確認"
                          : "テキストとページ画像を確認"}
                      </p>
                      <p>
                        {
                          {
                            main: "資料区分：本体",
                            supplement: "資料区分：補足資料（主論文とは別PDF）",
                            excerpt: "資料区分：本文抜粋（書誌未解決）",
                          }[current.identification.documentPart]
                        }
                      </p>
                      <ul>
                        {current.identification.checks.map((check, i) => (
                          <li key={i}>
                            <strong>
                              {identificationFields[check.field]} · PDF {check.pdfPages.join(", ")}
                            </strong>
                            <p>{check.finding}</p>
                          </li>
                        ))}
                      </ul>
                      {current.identification.limitations.length > 0 && (
                        <>
                          <h4>未確認・適用範囲</h4>
                          <ul>
                            {current.identification.limitations.map((limitation) => (
                              <li key={limitation}>{limitation}</li>
                            ))}
                          </ul>
                        </>
                      )}
                      <p>
                        これは書誌の識別記録です。これらのページの構造情報を抽出・照合済みとする記録ではありません。
                      </p>
                    </section>
                  )}
                  <p>
                    PDFページは1始まりです。印刷ページとの対応は、各範囲で別途確認します。既存の出典リンクにあるページ換算を、この資産の確認結果として引き継いではいません。
                  </p>
                  {ranges === null ? (
                    <p role="status">調査範囲を照会中…</p>
                  ) : (
                    <div className="catalog-ranges">
                      {ranges.map((range) => (
                        <div className="catalog-range" key={range.from}>
                          <strong>
                            PDF {range.from}–{range.to ?? "終端不明"}
                          </strong>
                          <dl>
                            {CHANNELS.map((channel) => (
                              <div key={channel}>
                                <dt>{channelNames[channel]}</dt>
                                <dd>{states[range.channels[channel]]}</dd>
                              </div>
                            ))}
                          </dl>
                          <p>
                            {range.printedPageMapping
                              ? `印刷頁対応: ${range.printedPageMapping}`
                              : "印刷頁対応: 未確認"}
                          </p>
                          {range.note && <p>{range.note}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              )}
            </>
          )}
        </div>
      </details>
    </section>
  );
}
