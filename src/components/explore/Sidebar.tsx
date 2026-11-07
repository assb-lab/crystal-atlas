import { useEffect, useMemo, useRef, useState } from "react";
import { DATA } from "../../data/atlas.ts";
import { KINDS } from "../../data/presets.ts";
import { ALL, searchMatches } from "../../lib/atlas.ts";
import { normalize } from "../../lib/format.ts";
import { useAtlas, useSelectNode } from "../../store.ts";
import type { KindId } from "../../types.ts";

const lineStyle = (id: KindId) =>
  id === "symmetry" ? "solid" : id === "analogy" ? "dotted" : "dashed";
const GROUPS = [...new Set(DATA.collections.map((c) => c.group))];

function Search() {
  const { state } = useAtlas();
  const selectNode = useSelectNode();
  const [query, setQuery] = useState("");
  // The list belongs to the selection it was opened under, so any selection closes it.
  const [openFor, setOpenFor] = useState<string | null>(null);
  const open = openFor === state.selected;
  const show = () => setOpenFor(state.selected);
  const pick = (id: string) => {
    setOpenFor(null);
    selectNode(id);
  };
  const hits = useMemo(() => (normalize(query) ? searchMatches(query) : []), [query]);

  // Escape (outside the global search dialog) clears the result list.
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape" && !state.searchOpen) setOpenFor(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [state.searchOpen]);

  return (
    <div className="searchzone">
      <div className="label">構造を探す</div>
      <div className="searchbox">
        <span className="symbol">⌕</span>
        <input
          id="search"
          type="search"
          autoComplete="off"
          placeholder="構造名・組成・L2₁…"
          aria-label="構造検索"
          value={query}
          onChange={(ev) => setQuery(ev.target.value)}
          // Any input or focus reopens the list, including re-entering the same query.
          onInput={show}
          onFocus={show}
          onKeyDown={(ev) => {
            if (ev.key === "Enter" && hits[0]) pick(hits[0].id);
          }}
        />
      </div>
      <div id="searchResults" className="searchresults">
        {open &&
          normalize(query) !== "" &&
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
    </div>
  );
}

export function Sidebar({ hidden }: { hidden: boolean }) {
  const { state, dispatch } = useAtlas();
  const box = useRef<HTMLElement>(null);
  const families: [string, { short: string; color: string }][] = [
    [ALL, { short: "すべてのファミリー", color: "#93a9ba" }],
    ...Object.entries(DATA.families),
  ];

  useEffect(() => {
    if (state.collection && box.current) box.current.scrollTop = 0;
  }, [state.collection]);

  return (
    <aside
      className="sidebar"
      id="structureSidebar"
      ref={box}
      aria-label="構造の検索と絞り込み"
      hidden={hidden}
    >
      <Search />
      <div className="familyzone">
        <label className="flowpicker" htmlFor="classification">
          構造の分類
          <select
            id="classification"
            value={state.collection ?? ""}
            onChange={(ev) => dispatch({ type: "classification", id: ev.target.value })}
          >
            <option value="">分類を選択</option>
            {GROUPS.map((group) => (
              <optgroup label={group} key={group}>
                {DATA.collections
                  .filter((c) => c.group === group)
                  .map((c) => (
                    <option value={c.id} key={c.id}>
                      {c.title}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </label>
        <label className="flowpicker" htmlFor="sourceFlow">
          岡本佳比古の派生図
          <select
            id="sourceFlow"
            value={state.flow ?? ""}
            onChange={(ev) => dispatch({ type: "flow", id: ev.target.value })}
          >
            <option value="">図を選択</option>
            {DATA.flows.map((flow) => (
              <option value={flow.id} key={flow.id}>
                {flow.title}
              </option>
            ))}
          </select>
        </label>
        <div className="label">構造ファミリー</div>
        <div className="familylist" id="families">
          {families.map(([id, f]) => {
            const active = !state.flow && !state.collection && state.family === id;
            return (
              <button
                key={id}
                className={`familybutton${active ? " active" : ""}`}
                data-family={id}
                aria-pressed={active}
                onClick={() => dispatch({ type: "family", id })}
              >
                <i className="dot" style={{ background: f.color }} />
                <span>{f.short}</span>
                <span className="num">
                  {id === ALL
                    ? DATA.nodes.length
                    : DATA.nodes.filter((n) => n.family === id).length}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="filters">
        <label className="checklabel">
          <input
            type="checkbox"
            id="strictFilter"
            checked={state.strict}
            onChange={(ev) => dispatch({ type: "strict", on: ev.target.checked })}
          />
          <span>群–部分群の確認済み関係</span>
        </label>
        <div className="filterhelp">
          <span id="strictCount">{DATA.edges.filter((e) => e.strict).length}</span>
          本の矢印に限定。変換情報の詳細は出典を参照。
        </div>
      </div>
      <div className="legendzone">
        <div className="label">矢印の読み方</div>
        <div id="legend" className="legend">
          {(Object.entries(KINDS) as [KindId, (typeof KINDS)[KindId]][]).map(([id, k]) => (
            <div className="legenditem" key={id}>
              <span
                className="linemark"
                style={{ borderColor: k.color, borderTopStyle: lineStyle(id) }}
              />
              {k.name}
            </div>
          ))}
        </div>
      </div>
      <div className="sidebarbottom">
        <button
          id="sidebarRoute"
          className="small flat"
          style={{ width: "100%" }}
          onClick={() => dispatch({ type: "modal", modal: { kind: "routes" } })}
        >
          どこから読む？ →
        </button>
        <p>矢印は構造の記述上の関係です。実際の反応・相転移経路とは限りません。</p>
      </div>
    </aside>
  );
}
