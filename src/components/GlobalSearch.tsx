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
  const hits = useMemo(
    () => (state.searchOpen ? searchMatches(query) : []),
    [state.searchOpen, query],
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
        <h2 id="globalSearchTitle">全構造を検索</h2>
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
        onChange={(ev) => setQuery(ev.target.value)}
      />
      <p id="globalCount" className="muted smalltext" aria-live="polite">
        {state.searchOpen ? `${hits.length} / ${DATA.nodes.length} 件` : ""}
      </p>
      <div id="globalResults" className="searchresults" ref={results}>
        {state.searchOpen &&
          (hits.length ? (
            hits.map((n) => (
              <button key={n.id} data-searchnode={n.id} onClick={() => pick(n.id)}>
                {n.name}
                <small>
                  {n.formula} · {DATA.families[n.family]?.short}
                </small>
              </button>
            ))
          ) : (
            <p className="smalltext muted" style={{ padding: 10 }}>
              一致する構造はありません。
            </p>
          ))}
      </div>
    </dialog>
  );
}
