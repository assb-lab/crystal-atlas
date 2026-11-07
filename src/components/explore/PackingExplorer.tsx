import * as React from "react";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { DATA } from "../../data/atlas.ts";
import { ROOT_CAPTIONS } from "../../data/packing-plan.ts";
import {
  ancestors, buildPackingAtlas, descendants, lensMatches, lensTitle, projectPacking,
  RELATION_LABELS, ROLE_LABELS, rootOf, searchPacking,
  type PackingLens, type PackingNode,
} from "../../lib/packing.ts";
import { modelFor } from "../../lib/viewer.ts";
import { SIDEBAR_LIMITS, type Side } from "../../state.ts";
import { focusSoon, useAtlas, useNarrow } from "../../store.ts";
import { ModelPanel } from "../ModelPanel.tsx";
import { RefChips } from "../RefChips.tsx";
import { CompareTray } from "./CompareTray.tsx";
import { PackingMap } from "./PackingMap.tsx";
import "../../styles/packing.css";

const ATLAS = buildPackingAtlas(DATA);
const INITIAL_FOLDS = ["nacl", "fluorite", "perov", "spinel", "zns"];
const ROOT_LABELS: Record<string, string> = {
  bcc: "bcc", fcc: "ccp / fcc", hcp: "hcp", "simple-cubic": "単純立方", "simple-hex": "単純六方", "other-roots": "追加の骨格",
};
interface Navigation { selected: string; observed: string; anchor: string; history: string[] }
declare global { interface Window { packingDiagnostics?: () => Record<string, unknown> } }

function Resizer({ side, hidden }: { side: Side; hidden: boolean }) {
  const { state, dispatch } = useAtlas();
  const [min, max] = SIDEBAR_LIMITS[side];
  const width = side === "left" ? state.sidebars.leftWidth : state.sidebars.rightWidth;
  const sign = side === "left" ? 1 : -1;
  const drag = useRef<{ x: number; width: number } | null>(null);
  const resize = (value: number) => dispatch({ type: "sidebarWidth", side, width: value });
  return <div className="sidebarresize" id={`${side}Resize`} hidden={hidden} role="separator" tabIndex={0}
    aria-label={side === "left" ? "分類サイドバーの幅" : "詳細サイドバーの幅"}
    aria-orientation="vertical" aria-valuemin={min} aria-valuemax={max} aria-valuenow={width}
    onPointerDown={(ev) => { if (ev.button === 0) { drag.current = { x: ev.clientX, width }; ev.currentTarget.setPointerCapture(ev.pointerId); ev.preventDefault(); } }}
    onPointerMove={(ev) => { if (drag.current) resize(drag.current.width + sign * (ev.clientX - drag.current.x)); }}
    onPointerUp={() => (drag.current = null)} onPointerCancel={() => (drag.current = null)} onLostPointerCapture={() => (drag.current = null)}
    onKeyDown={(ev) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(ev.key)) return;
      ev.preventDefault(); resize(ev.key === "Home" ? min : ev.key === "End" ? max : width + (ev.key === "ArrowRight" ? 20 : -20) * sign);
    }} />;
}

export function PackingExplorer() {
  const { state, dispatch } = useAtlas();
  const narrow = useNarrow();
  const [nav, setNav] = useState<Navigation>({ selected: state.selected, observed: state.selected, anchor: "fcc", history: [] });
  // A selection made by the existing global search / comparison dialog enters the same hierarchy.
  const external = nav.observed !== state.selected;
  const selected = external ? state.selected : nav.selected;
  const anchor = external ? selected : nav.anchor;
  const [folded, setFolded] = useState<Set<string>>(() => new Set(INITIAL_FOLDS));
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(ATLAS.roots));
  const [query, setQuery] = useState("");
  const [lens, setLens] = useState<PackingLens | null>(null);
  const [lensOnly, setLensOnly] = useState(false);
  const [alternatives, setAlternatives] = useState(false);
  const [storedLinkId, setLinkId] = useState<string | null>(null);
  const linkId = external ? null : storedLinkId;
  const [list, setList] = useState(false);
  const view = useMemo(() => projectPacking(ATLAS, anchor, folded, lens, lensOnly), [anchor, folded, lens, lensOnly]);
  const selectedNode = ATLAS.nodes.get(selected)!;
  const results = useMemo(() => searchPacking(ATLAS, query), [query]);
  const matches = useMemo(() => lensMatches(ATLAS, lens), [lens]);
  const overlay = narrow && (state.sidebars.left || state.sidebars.right);
  const select = (id: string, focus = false) => {
    const n = ATLAS.nodes.get(id);
    if (!n) return;
    setLinkId(null);
    setNav({ selected: id, observed: n.structure ? id : state.selected,
      anchor: focus ? id : anchor, history: focus && anchor !== id ? [...nav.history, anchor] : nav.history });
    if (focus) {
      setQuery(""); setLensOnly(false);
      setFolded((old) => { const next = new Set(old); next.delete(id); return next; });
      setExpanded((old) => new Set([...old, ...ancestors(ATLAS, id)]));
    }
    if (n.structure) dispatch({ type: "selectNode", id, jump: false, narrow: false });
    if (focus && narrow) dispatch({ type: "closeSidebars" });
    else dispatch({ type: "sidebar", side: "right", open: true, narrow });
  };
  const focus = (id: string) => {
    if (id !== "all") { select(id, true); return; }
    setLinkId(null); setLensOnly(false);
    setNav({ selected, observed: state.selected, anchor: "all", history: [...nav.history, anchor] });
    if (narrow) dispatch({ type: "closeSidebars" });
  };
  const fold = (id: string) => setFolded((old) => {
    const next = new Set(old); if (next.has(id)) next.delete(id); else next.add(id); return next;
  });
  const pickLink = (id: string) => {
    setLinkId(id); dispatch({ type: "sidebar", side: "right", open: true, narrow });
  };
  const applyLens = (next: PackingLens | null) => { setLens(next); setLensOnly(false); };

  useEffect(() => {
    window.packingDiagnostics = () => ({
      sourceNodes: DATA.nodes.length, concepts: ATLAS.nodes.size - DATA.nodes.length,
      anchor, selected, ids: view.ids, links: view.links.map((p) => ({ parent: p.parent, child: p.child, kind: p.kind })),
      context: [...view.context], folded: [...view.folded.keys()], highlighted: [...view.highlighted],
      unplaced: ATLAS.unplaced, lens, lensOnly,
    });
    return () => { delete window.packingDiagnostics; };
  }, [anchor, selected, view, lens, lensOnly]);

  const referenceTable = lens?.type === "collection" ? DATA.collections.find((c) => c.id === lens.id)?.table : undefined;
  const title = anchor === "all" ? "基本充填からの全体地図" : ATLAS.nodes.get(anchor)!.title;
  const breadcrumbs = anchor === "all" ? [] : ancestors(ATLAS, anchor);
  const nodeTree = (id: string): React.ReactNode => {
    const n = ATLAS.nodes.get(id)!, kids = ATLAS.children.get(id) ?? [], open = expanded.has(id);
    return <li key={id}>
      <div className={`packing-nav-row${anchor === id ? " active" : ""}`}>
        {kids.length ? <button className="packing-nav-expander" aria-label={`${n.title}の項目を${open ? "閉じる" : "開く"}`} aria-expanded={open}
          onClick={() => setExpanded((old) => { const next = new Set(old); if (open) next.delete(id); else next.add(id); return next; })}>{open ? "▾" : "▸"}</button> : <span className="packing-nav-spacer" />}
        <button data-packing-nav={id} aria-current={anchor === id ? "page" : undefined} onClick={() => focus(id)} title={`${n.title} / ${ROLE_LABELS[n.role]}`}>
          <span>{n.title}</span>{kids.length > 0 && <small>{descendants(ATLAS, id).length - 1}</small>}
        </button>
      </div>
      {open && kids.length > 0 && <ul>{kids.map(nodeTree)}</ul>}
    </li>;
  };
  return <section id="explore" className="tabpage packing-explore" hidden={state.tab !== "explore"}>
    <div className="workspacetools">
      <button id="toggleSidebar" className="small" aria-expanded={state.sidebars.left} aria-controls="structureSidebar"
        onClick={() => dispatch({ type: "sidebar", side: "left", open: !state.sidebars.left, narrow })}>構造をたどる</button>
      <button className="small" id="packingBack" disabled={!nav.history.length} onClick={() => {
        const previous = nav.history.at(-1)!; setLensOnly(false); setLinkId(null);
        setNav({ selected, observed: state.selected, anchor: previous, history: nav.history.slice(0, -1) });
      }}>← 戻る</button>
      <nav className="packing-breadcrumbs" aria-label="表示中の主経路">
        <button onClick={() => focus("all")}>全体</button>
        {breadcrumbs.map((id) => <React.Fragment key={id}><span>›</span><button onClick={() => focus(id)}>{ATLAS.nodes.get(id)!.title}</button></React.Fragment>)}
      </nav>
      <span className="spacer" />
      <button id="toggleInspector" className="small" aria-expanded={state.sidebars.right} aria-controls="inspectorPanel"
        onClick={() => dispatch({ type: "sidebar", side: "right", open: !state.sidebars.right, narrow })}>構造の詳細</button>
    </div>
    <div className="packing-roots" aria-label="出発点となる基本配列">
      {ATLAS.roots.map((id) => <button key={id} data-packing-root={id} className={rootOf(ATLAS, anchor) === id && anchor !== "all" ? "active" : ""}
        onClick={() => focus(id)} title={ROOT_CAPTIONS[id]}><b>{ROOT_LABELS[id]}</b><span>{ROOT_CAPTIONS[id]}</span></button>)}
    </div>
    <div id="workspace" className="workspace packing-workspace" style={{ "--sidebar-width": `${state.sidebars.leftWidth}px`, "--inspector-width": `${state.sidebars.rightWidth}px` } as CSSProperties}>
      <button className="sidebarbackdrop" id="sidebarBackdrop" aria-label="サイドバーを閉じる" hidden={!overlay}
        onClick={() => { dispatch({ type: "closeSidebars" }); focusSoon("toggleSidebar"); }} />
      <aside id="structureSidebar" className="sidebar packing-sidebar" hidden={!state.sidebars.left} aria-label="統一された構造ナビゲーション">
        <label className="packing-search">構造・組成・共通模型を探す
          <input type="search" id="packingSearch" value={query} placeholder="パイロクロア / 1:2 / TiO2…"
            onChange={(ev) => setQuery(ev.target.value)} onKeyDown={(ev) => { if (ev.key === "Enter" && results[0]) select(results[0].id, true); if (ev.key === "Escape") setQuery(""); }} />
        </label>
        {query.trim() ? <div className="packing-search-results" aria-live="polite">
          <small>{results.length}件</small>{results.map((n) => <button key={n.id} data-packing-search={n.id} onClick={() => select(n.id, true)}>
            {n.title}<small>{ROLE_LABELS[n.role]} · {n.formula}</small></button>)}
          {!results.length && <p>該当項目はありません。</p>}
        </div> : <nav className="packing-nav" aria-label="基本配列からの階層">
          <div className="label">基本配列 → 派生・規則型 → 具体例</div>
          <ul>{ATLAS.roots.map(nodeTree)}</ul>
        </nav>}
        <details className="packing-lenses">
          <summary>文献・テーマを同じ地図に重ねる</summary>
          <p>ここでは親子関係・位置は変わりません。該当する項目を強調します。</p>
          <button className="small" onClick={() => applyLens(null)}>強調を解除</button>
          <details><summary>文献</summary><div className="packing-lens-buttons">
            {Object.entries(DATA.sources).map(([id, s]) => <button key={id} data-packing-source={id} aria-pressed={lens?.type === "source" && lens.id === id}
              onClick={() => applyLens({ type: "source", id })}>{s.short}</button>)}
          </div></details>
          <details><summary>岡本の図の範囲</summary><div className="packing-lens-buttons">
            {DATA.flows.map((f) => <button key={f.id} data-packing-flow={f.id} aria-pressed={lens?.type === "flow" && lens.id === f.id}
              onClick={() => applyLens({ type: "flow", id: f.id })}>{f.title}</button>)}
          </div></details>
          <details><summary>横断テーマ・既存分類</summary>
            {[...new Set(DATA.collections.map((c) => c.group))].map((g) => <details key={g}><summary>{g}</summary><div className="packing-lens-buttons">
              {DATA.collections.filter((c) => c.group === g).map((c) => <button key={c.id} data-packing-collection={c.id}
                aria-pressed={lens?.type === "collection" && lens.id === c.id} onClick={() => applyLens({ type: "collection", id: c.id })}>{c.title}</button>)}
            </div></details>)}
          </details>
        </details>
        <p className="packing-small-note">hcpはブラベー格子そのものではなく、hP＋2原子の基底です。縦方向は本アトラスの主経路で、全てが対称性低下ではありません。</p>
      </aside>
      <Resizer side="left" hidden={!state.sidebars.left || narrow} />
      <section className="graphpanel packing-graph" inert={overlay} aria-label="基本充填の構造地図">
        <div className="graphbar"><div><span className="eyebrow">PACKING → DERIVATION → REALIZATION</span><h2 id="packingTitle">{title}</h2></div>
          <span className="spacer" /><div className="segmented"><button className={!list ? "active" : ""} onClick={() => setList(false)}>地図</button><button className={list ? "active" : ""} onClick={() => setList(true)}>一覧</button></div>
        </div>
        <div className="packing-map-toolbar">
          <button className="small" id="packingFocus" onClick={() => focus(selected)}>選択した構造の枝を開く</button>
          <button className="small" id="packingExpandAll" onClick={() => setFolded(new Set())}>全ての枝を展開</button>
          <button className="small" id="packingFoldMain" onClick={() => setFolded(new Set(INITIAL_FOLDS.filter((id) => id !== anchor)))}>主要な枝を畳む</button>
          <label><input type="checkbox" id="packingAlternatives" checked={alternatives} onChange={(ev) => setAlternatives(ev.target.checked)} />別経路・比較を重ねる</label>
        </div>
        {lens && <div className="packing-lens-status" role="status">
          <span>{lensTitle(ATLAS, lens)} · 全体で{matches.size}項目 / 表示中{view.ids.filter((id) => matches.has(id)).length}項目</span>
          <button className="small" id="packingLensOnly" onClick={() => setLensOnly(!lensOnly)}>{lensOnly ? "元の範囲に戻す" : "該当項目と祖先を表示"}</button>
          <button className="small flat" onClick={() => applyLens(null)}>解除</button>
        </div>}
        {referenceTable && <details className="packing-reference-table"><summary>{referenceTable.title}（原分類の参照表）</summary>
          <div className="packing-table-scroll"><table className="structuretable"><thead><tr>{referenceTable.headings.map((h) => <th key={h}>{h}</th>)}</tr></thead><tbody>
            {referenceTable.rows.map((row, i) => <tr key={i}>{row.cells.map((cell, j) => <td key={j}>{cell}{j === row.cells.length - 1 && row.ids.map((id) => <button className="small" key={id} data-packing-table={id} onClick={() => focus(id)}>{ATLAS.nodes.get(id)!.title}</button>)}</td>)}</tr>)}
          </tbody></table></div>
        </details>}
        {list ? <div className="listview"><table className="structuretable"><thead><tr><th>主経路</th><th>構造・模型</th><th>区分</th></tr></thead><tbody>
          {(lensOnly ? view.ids : descendants(ATLAS, anchor)).map((id) => { const n = ATLAS.nodes.get(id)!; return <tr key={id}>
            <td><small>{ancestors(ATLAS, id).slice(0, -1).map((p) => ATLAS.nodes.get(p)!.title).join(" › ")}</small></td>
            <td><button className="small flat" onClick={() => select(id)}>{n.title}</button><small>{n.formula}</small></td><td>{ROLE_LABELS[n.role]}</td>
          </tr>; })}
        </tbody></table></div> : <PackingMap key={`${anchor}:${[...folded].sort().join(",")}:${lensOnly ? JSON.stringify(lens) : ""}`}
          atlas={ATLAS} view={view} selected={selected} alternatives={alternatives}
          onSelect={(id) => select(id)} onFocus={focus} onFold={fold} onLink={pickLink} />}
        <div className="graphfoot" id="packingStatus"><span>表示 {view.ids.length}項目 · {view.links.length}主接続 · 折り畳み{view.folded.size}枝</span>
          <span>元の{DATA.nodes.length}構造を保持 / 案内・共通模型を別区分</span></div>
      </section>
      <Resizer side="right" hidden={!state.sidebars.right || narrow} />
      <section className="inspectorpanel" id="inspectorPanel" hidden={!state.sidebars.right}>
        <div className="inspectorbar"><span>構造・経路の詳細</span><button className="small flat" onClick={() => dispatch({ type: "sidebar", side: "right", open: false })}>閉じる ×</button></div>
        <PackingDetails key={linkId ?? selected} node={selectedNode} linkId={linkId} onFocus={focus} onSelectLink={pickLink} />
      </section>
    </div>
    <CompareTray />
  </section>;
}

function PackingDetails({ node, linkId, onFocus, onSelectLink }: {
  node: PackingNode; linkId: string | null; onFocus: (id: string) => void; onSelectLink: (id: string) => void;
}) {
  const { state, dispatch } = useAtlas();
  const primary = linkId ? [...ATLAS.parent.values()].find((p) => p.id === linkId) : undefined;
  const raw = linkId ? DATA.edges.find((e) => e.id === linkId) : undefined;
  const source = node.structure;
  const model = useMemo(() => source ? modelFor(source.model ?? source.id) : null, [source]);
  const path = ancestors(ATLAS, node.id);
  const links = source ? DATA.edges.filter((e) => e.a === source.id || e.b === source.id) : [];
  if (primary || raw) {
    const a = primary?.parent ?? raw!.a, b = primary?.child ?? raw!.b;
    return <aside id="inspector" className="inspector packing-inspector">
      <div className="inspecthead"><span className="eyebrow">{primary ? RELATION_LABELS[primary.kind] : "出典の別経路・比較"}</span>
        <h2>{primary?.label ?? raw!.label}</h2></div>
      <div className="inspectbody"><div className="packing-path-buttons"><button onClick={() => onFocus(a)}>{ATLAS.nodes.get(a)!.title}</button><span>{raw?.undirected ? "↔" : "→"}</span><button onClick={() => onFocus(b)}>{ATLAS.nodes.get(b)!.title}</button></div>
        <p className="note">{primary?.kind === "instance" ? "構造型を具体的な組成・相で実現した例です。相転移や化学反応ではありません。" : primary?.kind === "organizes" ? "構造を探すための分類・比較上の接続です。直接の構造派生、同型、群–部分群関係は主張しません。" : "原資料に基づく構造記述上の操作です。実際の合成反応・相転移や単調な対称性低下とは限りません。"}</p>
        {raw && <p className="desc">{raw.desc}</p>}
        {primary && <p className="packing-small-note">主経路の選択・共通模型へのまとめ方は本アトラスの編集です。根拠となる元の関係と区別しています。</p>}
        {raw?.warning && <p className="note warn">{raw.warning}</p>}
        <div className="detailsection"><h3>根拠・変換情報</h3>
          {(primary?.strict || raw?.strict) && <p className="note green">元資料で群–部分群関係を確認。指数・基底・位置の転記範囲は元の関係で確認してください。</p>}
          {raw && <div className="facts">{[["指数", raw.index], ["基底・原点", raw.basis], ["サイト対応", raw.split]].filter(([, v]) => v).map(([k, v]) => <div className="fact" key={k}><div className="key">{k}</div><div className="value">{v}</div></div>)}</div>}
          <RefChips refs={primary?.refs ?? raw!.refs} />
          {primary?.evidence.map((id) => { const e = DATA.edges.find((r) => r.id === id)!; return <button className="packing-source-link" key={id} onClick={() => onSelectLink(id)}>{e.label} · 元の記述を読む ↗</button>; })}
        </div>
      </div>
    </aside>;
  }
  return <aside id="inspector" className="inspector packing-inspector" aria-label="選択した構造の詳細">
    <div className="inspecthead"><div className="row"><span className="eyebrow">{ROLE_LABELS[node.role]}</span><span className="spacer" />
      {source && <button className="small flat" data-compare={source.id} onClick={() => dispatch({ type: "toggleCompare", id: source.id })}>{state.comp.includes(source.id) ? "比較から外す" : "＋ 比較"}</button>}
    </div><h2>{node.title}</h2><p className="formula">{node.formula}</p></div>
    <div className="inspectbody">
      <div className="packing-path-buttons">{path.map((id, i) => <React.Fragment key={id}>{i > 0 && <span>›</span>}<button onClick={() => onFocus(id)}>{ATLAS.nodes.get(id)!.title}</button></React.Fragment>)}</div>
      {source && <p className="desc">{source.desc}</p>}
      {node.note && <p className={`note${rootOf(ATLAS, node.id) === "other-roots" ? " warn" : ""}`}>{node.note}</p>}
      {!source && <p className="packing-small-note">案内または共通模型のノードです。実測CIFや独立した結晶相ではありません。具体例を開くと元の構造データを確認できます。</p>}
      {source && model && model.atoms.length > 0 && <ModelPanel key={source.id} node={source} model={model} />}
      {source && <div className="detailsection"><h3>構造の記述</h3><div className="facts">
        {[["空間群・対称性", source.sg], ["基準骨格", source.packing], ["配位", source.coord], ["連結", source.link]].map(([k, v]) => <div className="fact" key={k}><div className="key">{k}</div><div className="value">{v}</div></div>)}
      </div>{source.occ && <p className="packing-small-note">T孔：{source.occ[0]} / O孔：{source.occ[1]}。基準：{source.host}。全T孔2N、全O孔Nが分母です。</p>}</div>}
      {source && DATA.structureLabels[source.id]?.map((label, i) => <div className="detailsection" key={`${label.key}:${i}`}><h3>{label.key}</h3><p>{label.value}</p>{label.detail && <p className="packing-small-note">{label.detail}</p>}<RefChips refs={label.refs} /></div>)}
      <div className="detailsection"><h3>この先の構造・具体例</h3><div className="packing-child-list">{(ATLAS.children.get(node.id) ?? []).map((id) => <button key={id} onClick={() => onFocus(id)}>{ATLAS.nodes.get(id)!.title}<small>{ATLAS.parent.get(id)!.label}</small></button>)}</div>
        {!(ATLAS.children.get(node.id)?.length) && <p className="packing-small-note">この主経路の末端です。下に別物質を接続して詳細度を増やすことはしていません。</p>}
      </div>
      <div className="detailsection"><h3>出典</h3><RefChips refs={node.refs} /></div>
      {links.length > 0 && <details className="detailsection"><summary>別の見方・元資料の関係（{links.length}）</summary><p className="packing-small-note">主階層の親子とは限りません。同じ部分格子・組成でも同型とは限りません。</p>
        {links.map((e) => <button key={e.id} className="packing-source-link" onClick={() => onSelectLink(e.id)}>{e.label}<small>{DATA.nodes.find((n) => n.id === (e.a === node.id ? e.b : e.a))!.name}</small></button>)}
      </details>}
    </div>
  </aside>;
}
