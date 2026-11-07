import { useEffect, useMemo, useState } from "react";
import { DATA } from "../../data/atlas.ts";
import { KINDS } from "../../data/presets.ts";
import { normalize } from "../../lib/format.ts";
import { ALL } from "../../lib/graph.ts";
import type { KindId } from "../../types.ts";
import { useAtlas, useSelectNode } from "../../store.ts";

const lineStyle = (id: KindId) =>
  id === "symmetry" ? "solid" : id === "analogy" ? "dotted" : "dashed";

function Search() {
  const selectNode = useSelectNode();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const hits = useMemo(() => {
    const q = normalize(query);
    if (!q) return [];
    const nameHit = (name: string) => (normalize(name).includes(q) ? 1 : 0);
    return DATA.nodes
      .filter((n) => normalize([n.name, n.formula, n.aliases, n.sg, n.desc].join(" ")).includes(q))
      .sort((a, b) => nameHit(b.name) - nameHit(a.name))
      .slice(0, 14);
  }, [query]);

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const pick = (id: string) => {
    setOpen(false);
    selectNode(id);
  };

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
          onChange={(ev) => {
            setQuery(ev.target.value);
            setOpen(true);
          }}
          onKeyDown={(ev) => {
            if (ev.key === "Enter" && hits[0]) pick(hits[0].id);
          }}
        />
      </div>
      <div id="searchResults" className="searchresults">
        {open &&
          query.trim() !== "" &&
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

export function Sidebar() {
  const { state, dispatch } = useAtlas();
  const families: [string, { short: string; color: string }][] = [
    [ALL, { short: "すべてのファミリー", color: "#93a9ba" }],
    ...Object.entries(DATA.families),
  ];
  const strictCount = DATA.edges.filter((e) => e.strict).length;
  return (
    <aside className="sidebar" id="exploreSidebar" aria-label="構造の検索と絞り込み">
      <Search />
      <div className="familyzone">
        <div className="label">構造ファミリー</div>
        <div className="familylist" id="families">
          {families.map(([id, f]) => (
            <button
              key={id}
              className={`familybutton${state.family === id ? " active" : ""}`}
              data-family={id}
              aria-pressed={state.family === id}
              onClick={() => dispatch({ type: "family", id })}
            >
              <i className="dot" style={{ background: f.color }} />
              <span>{f.short}</span>
              <span className="num">
                {id === ALL ? DATA.nodes.length : DATA.nodes.filter((n) => n.family === id).length}
              </span>
            </button>
          ))}
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
          <span id="strictCount">{strictCount}</span>本の矢印に限定。未転記の変換情報は詳細で明示。
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
        <div className="sidestats" aria-label="収録データ">
          <span>
            <b>{DATA.nodes.length}</b>構造
          </span>
          <span>
            <b>{DATA.edges.length}</b>関係
          </span>
          <span>
            <b>{Object.keys(DATA.sources).length}</b>資料
          </span>
        </div>
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
