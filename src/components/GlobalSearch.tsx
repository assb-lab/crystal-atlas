import { getKnowledgeDB, resetKnowledgeDB } from "../knowledge/client.ts";
import { recordKinds, type RecordKind } from "../knowledge/navigation.ts";
import { recordQuery, recordLabels } from "../knowledge/records.ts";
import { normalize } from "../lib/format.ts";
import { useEffect, useMemo, useRef, useState } from "react";
import { DATA } from "../data/atlas.ts";
import { searchMatches } from "../lib/atlas.ts";
import { isNarrow, useAtlas } from "../store.ts";

/** ⌘K dialog over all structures, with arrow-key navigation. Results exist only while open. */
export function GlobalSearch() {
  const { state, dispatch } = useAtlas();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const results = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("all");
  const [graph, setGraph] = useState<
    { kind: RecordKind; id: string; title: string; text: string }[] | null
  >(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [shown, setShown] = useState(50);
  useEffect(() => {
    if (!state.searchOpen || graph) return;
    let live = true;
    void getKnowledgeDB()
      .then(async (db) => {
        const groups = await Promise.all(
          recordKinds.map(async (kind) =>
            (await db.query(recordQuery(kind, true))).map((r) => ({
              kind,
              id: String(r.id),
              title: String(r.title),
              text: normalize(JSON.stringify(r)),
            })),
          ),
        );
        if (live) {
          setError("");
          setGraph(groups.flat());
        }
      })
      .catch((e) => {
        if (live) setError(String(e));
      });
    return () => {
      live = false;
    };
  }, [state.searchOpen, graph, attempt]);
  const graphHits = useMemo(
    () =>
      graph?.filter(
        (r) =>
          (scope === "all" || scope === r.kind) &&
          !(r.kind === "entity" && DATA.nodes.some((n) => n.id === r.id)) &&
          r.text.includes(normalize(query)),
      ) ?? [],
    [graph, scope, query],
  );
  const hits = useMemo(
    () => (state.searchOpen && (scope === "all" || scope === "entity") ? searchMatches(query) : []),
    [state.searchOpen, query, scope],
  );
  const close = () => dispatch({ type: "searchOpen", open: false });

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (state.searchOpen && !d.open) {
      setQuery("");
      d.showModal();
      input.current?.focus();
    } else if (!state.searchOpen && d.open) d.close();
  }, [state.searchOpen]);

  useEffect(() => {
    if (results.current) results.current.scrollTop = 0;
  }, [query]);

  const pick = (id: string) => dispatch({ type: "searchPick", id, narrow: isNarrow() });

  return (
    <dialog
      id="globalSearch"
      ref={dialog}
      className="searchdialog"
      aria-labelledby="globalSearchTitle"
      onCancel={(ev) => {
        ev.preventDefault();
        close();
      }}
      onKeyDown={(ev) => {
        if (ev.key === "Escape") {
          ev.preventDefault();
          ev.stopPropagation();
          close();
          return;
        }
        const buttons = [...(results.current?.querySelectorAll("button") ?? [])];
        if (!buttons.length) return;
        const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
        if (ev.key === "Enter" && ev.target === input.current) {
          ev.preventDefault();
          buttons[0]?.click();
        }
        if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
          ev.preventDefault();
          const next = index + (ev.key === "ArrowDown" ? 1 : -1);
          if (next < 0) input.current?.focus();
          else buttons[Math.min(next, buttons.length - 1)]?.focus();
        }
      }}
    >
      <form
        method="dialog"
        className="searchdialogheader"
        onSubmit={(ev) => {
          ev.preventDefault();
          close();
        }}
      >
        <h2 id="globalSearchTitle">全構造・知識グラフを検索</h2>
        <button className="small flat" value="close" aria-label="検索を閉じる">
          Esc
        </button>
      </form>
      <input
        ref={input}
        type="search"
        id="globalQuery"
        autoComplete="off"
        placeholder="構造名・組成・空間群…"
        aria-label="全構造を検索"
        value={query}
        onChange={(ev) => {
          setQuery(ev.target.value);
          setShown(50);
        }}
      />
      <label htmlFor="searchScope">検索対象</label>
      <select
        id="searchScope"
        value={scope}
        onChange={(e) => {
          setScope(e.target.value);
          setShown(50);
        }}
      >
        <option value="all">全検索対象（10種類）</option>
        {recordKinds.map((kind) => (
          <option key={kind} value={kind}>
            {recordLabels[kind]}
          </option>
        ))}
      </select>
      {error && (
        <p role="alert">
          {error}
          <button
            onClick={() =>
              void resetKnowledgeDB().then(() => {
                setError("");
                setAttempt((n) => n + 1);
              })
            }
          >
            検索を再試行
          </button>
        </p>
      )}
      {!graph && state.searchOpen && (
        <p role="status">知識グラフの索引を照会中… 構造カードは先に検索できます。</p>
      )}
      <p id="globalCount" className="muted smalltext" aria-live="polite">
        {state.searchOpen
          ? `${hits.length + graphHits.length} 件${graph ? "" : "（グラフ照会中）"} / 先頭 ${Math.min(shown, hits.length + graphHits.length)} 件を表示`
          : ""}
      </p>
      <div id="globalResults" className="searchresults" ref={results}>
        {state.searchOpen &&
          (hits.length ? (
            hits.slice(0, shown).map((n) => (
              <button key={n.id} data-searchnode={n.id} onClick={() => pick(n.id)}>
                {n.name}
                <small>
                  {n.formula} · {DATA.families[n.family]?.short}
                </small>
              </button>
            ))
          ) : graph && !graphHits.length ? (
            <p className="smalltext muted" style={{ padding: 10 }}>
              一致するレコードはありません。
            </p>
          ) : null)}
        {state.searchOpen &&
          graphHits.slice(0, Math.max(0, shown - hits.length)).map((r) => (
            <button
              key={`${r.kind}:${r.id}`}
              data-searchrecord={`${r.kind}:${r.id}`}
              onClick={() =>
                dispatch({ type: "recordReference", reference: { kind: r.kind, id: r.id } })
              }
            >
              {r.title}
              <small>
                {recordLabels[r.kind]} · {r.id}
              </small>
            </button>
          ))}
        {state.searchOpen && shown < hits.length + graphHits.length && (
          <button onClick={() => setShown((n) => n + 50)}>
            さらに50件表示（残り {hits.length + graphHits.length - shown}件）
          </button>
        )}
      </div>
    </dialog>
  );
}
