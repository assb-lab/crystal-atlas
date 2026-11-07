import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { DATA } from "../../data/atlas.ts";
import { LABPRESETS } from "../../data/presets.ts";
import { ROOT_LABELS, ROOT_NOTES } from "../../data/packing.ts";
import { searchMatches } from "../../lib/atlas.ts";
import { modelFor } from "../../lib/viewer.ts";
import { ancestors, buildPackingTree, descendants, lensMembers, LINK_LABELS, overlayRelations, packingPositions, packingView, ROLE_LABELS, type Lens, type PackingLink, type PackingPoint, type PackingView } from "../../lib/packing.ts";
import { SIDEBAR_LIMITS, type Side } from "../../state.ts";
import { focusSoon, useAtlas, useNarrow } from "../../store.ts";
import type { AtlasEdge, AtlasNode, Collection } from "../../types.ts";
import { ModelPanel } from "../ModelPanel.tsx";
import { RefChips } from "../RefChips.tsx";
import { CompareTray } from "./CompareTray.tsx";
import "../../styles/packing.css";

const TREE = buildPackingTree(DATA);
const COLORS: Record<string, string> = { bcc: "#edb877", fcc: "#7fcee8", hcp: "#b5a1ed", "@aux": "#b2c6bd" };
const colorOf = (id: string) => COLORS[ancestors(TREE, id)[0]] ?? COLORS["@aux"];
const titleOf = (id: string) => ROOT_LABELS[id] ?? TREE.entries.get(id)?.title ?? "基本充填から探索";
const counts = new Map([...TREE.entries.keys()].map((id) => [id, descendants(TREE, id).filter((key) => TREE.entries.get(key)?.structure).length]));
const CARD_W = 242;
const CARD_H = 96;
interface Camera { x: number; y: number; scale: number }
interface Place { focus: string; lens: Lens }
type Selection = { kind: "entry"; id: string } | { kind: "hierarchy"; link: PackingLink } | { kind: "source"; edge: AtlasEdge };

declare global {
  interface Window { packingDiagnostics?: () => Record<string, unknown> }
}

/** All navigation changes share one primary hierarchy; citations never create a new taxonomy. */
export function PackingExplorer() {
  const { state, dispatch } = useAtlas();
  const narrow = useNarrow();
  const [place, setPlace] = useState<Place>({ focus: "@all", lens: null });
  const [history, setHistory] = useState<Place[]>([]);
  const [selection, setSelection] = useState<Selection>({ kind: "entry", id: state.selected });
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set(TREE.roots));
  const [source, setSource] = useState("");
  const [overlay, setOverlay] = useState(false);
  const [strict, setStrict] = useState(false);
  const [query, setQuery] = useState("");
  const [indexQuery, setIndexQuery] = useState("");
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [fitSeq, setFitSeq] = useState(0);
  const latestSelection = useRef(state.selected);
  const previousExternal = useRef({ mapSeq: state.mapSeq, search: state.searchOpen, modal: !!state.modal });
  const currentPlace = useRef(place);
  const currentView = useRef<PackingView | null>(null);
  currentPlace.current = place;

  const members = useMemo(() => lensMembers(DATA, place.lens), [place.lens]);
  const view = useMemo(() => packingView(TREE, place.focus, members, collapsed), [place, members, collapsed]);
  const positions = useMemo(() => packingPositions(TREE, view), [view]);
  currentView.current = view;
  const sourceEdges = useMemo(() => overlay || strict || place.lens?.kind === "flow"
    ? overlayRelations(DATA, view, { source, strict, flow: place.lens?.kind === "flow" ? place.lens.id : undefined }) : [], [view, overlay, strict, source, place.lens]);
  const sourceMatched = useMemo(() => new Set(view.entries.filter((entry) => entry.refs.some((r) => r.s === source)
    || TREE.parent.get(entry.id)?.refs.some((r) => r.s === source)).map((e) => e.id)), [source, view]);
  const selectedId = selection.kind === "entry" ? selection.id : null;
  const selectedEntry = selectedId ? TREE.entries.get(selectedId) : undefined;
  const selectedPath = selectedId ? ancestors(TREE, selectedId) : [];
  const scopePath = place.focus === "@all" ? [] : ancestors(TREE, place.focus);
  const lensObject = place.lens?.kind === "collection" ? DATA.collections.find((c) => c.id === place.lens?.id)
    : place.lens?.kind === "flow" ? DATA.flows.find((f) => f.id === place.lens?.id) : null;
  const hits = useMemo(() => query.trim() ? searchMatches(query) : [], [query]);
  const [navExpanded, setNavExpanded] = useState<Set<string>>(new Set(TREE.roots));
  const activeOverlay = narrow && (state.sidebars.left || state.sidebars.right);
  const classificationTable = place.lens?.kind === "collection" ? (lensObject as Collection | undefined)?.table : undefined;

  function navigate(next: Place) {
    setHistory((old) => [...old, place]);
    setPlace(next);
    setCollapsed(new Set());
    setFitSeq((n) => n + 1);
    setNavExpanded((old) => new Set([...old, ...ancestors(TREE, next.focus)]));
    if (next.focus !== "@all") setSelection({ kind: "entry", id: next.focus });
    if (narrow) dispatch({ type: "closeSidebars" });
  }
  function pick(id: string, reveal = false) {
    setSelection({ kind: "entry", id });
    if (TREE.entries.get(id)?.structure) {
      latestSelection.current = id;
      dispatch({ type: "selectNode", id, jump: false });
    }
    if (reveal) {
      const parent = TREE.parent.get(id)?.parent;
      navigate({ focus: TREE.children.get(id)?.length ? id : parent ?? id, lens: null });
      setSelection({ kind: "entry", id });
      setQuery("");
    }
    dispatch({ type: "sidebar", side: "right", open: true, narrow });
  }
  function toggleFold(id: string) {
    setCollapsed((old) => { const next = new Set(old); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }
  // Global search, comparison paths and learning routes still select canonical structure IDs.
  useEffect(() => {
    const previous = previousExternal.current;
    previousExternal.current = { mapSeq: state.mapSeq, search: state.searchOpen, modal: !!state.modal };
    const externalPick = state.mapSeq !== previous.mapSeq && ((previous.search && !state.searchOpen) || (previous.modal && !state.modal));
    if (state.selected === latestSelection.current && !externalPick) return;
    latestSelection.current = state.selected;
    const id = state.selected;
    setSelection({ kind: "entry", id });
    setNavExpanded((old) => new Set([...old, ...ancestors(TREE, id)]));
    setCollapsed((old) => new Set([...old].filter((key) => !ancestors(TREE, id).includes(key))));
    if (!currentView.current?.entries.some((e) => e.id === id)) {
      const focus = TREE.children.get(id)?.length ? id : TREE.parent.get(id)?.parent ?? id;
      setHistory((old) => [...old, currentPlace.current]);
      setPlace({ focus, lens: null });
    }
    dispatch({ type: "sidebar", side: "right", open: true, narrow });
    setFitSeq((n) => n + 1);
  }, [state.selected, state.mapSeq, state.searchOpen, state.modal, dispatch, narrow]);

  useEffect(() => {
    window.packingDiagnostics = () => ({
      hierarchy: "packing", focus: place.focus, lens: place.lens,
      selected: selectedId, shownNodes: view.entries.length, shownEdges: view.links.length,
      shownIds: view.entries.map((e) => e.id), contextIds: [...view.context],
      groups: view.folds.size, unassigned: [...TREE.unassigned], overlayEdges: sourceEdges.length,
      ranks: Object.fromEntries([...positions].map(([id, p]) => [id, p.rank])),
    });
    return () => { delete window.packingDiagnostics; };
  }, [place, selectedId, view, positions, sourceEdges]);

  function navBranch(id: string, depth = 0) {
    const children = TREE.children.get(id) ?? [];
    const isOpen = navExpanded.has(id);
    return <div key={id} className="packing-navbranch" style={{ "--depth": depth } as CSSProperties}>
      <div className={`packing-navrow${place.focus === id && !place.lens ? " active" : ""}`}>
        <button className="packing-expander" aria-label={`${titleOf(id)}の階層を${isOpen ? "閉じる" : "開く"}`} disabled={!children.length} aria-expanded={children.length ? isOpen : undefined}
          onClick={() => setNavExpanded((old) => { const next = new Set(old); if (isOpen) next.delete(id); else next.add(id); return next; })}>{children.length ? isOpen ? "−" : "+" : "·"}</button>
        <button data-packing-nav={id} aria-current={place.focus === id && !place.lens ? "page" : undefined} onClick={() => navigate({ focus: id, lens: null })}>
          <span className="packing-navdot" style={{ background: colorOf(id) }} /><span>{titleOf(id)}</span><small>{counts.get(id)}</small>
        </button>
      </div>
      {isOpen && children.map((child) => navBranch(child, depth + 1))}
    </div>;
  }

  return <section id="explore" className="tabpage packing-explore" hidden={state.tab !== "explore"}>
    <div className="workspacetools">
      <button id="toggleSidebar" className={`small${state.sidebars.left ? " active" : ""}`} aria-controls="structureSidebar" aria-expanded={state.sidebars.left}
        onClick={() => dispatch({ type: "sidebar", side: "left", open: !state.sidebars.left, narrow })}>系統・検索</button>
      <button className="small" id="exploreBack" disabled={!history.length} onClick={() => {
        const previous = history.at(-1); if (!previous) return;
        setPlace(previous); setHistory((old) => old.slice(0, -1)); setCollapsed(new Set()); setFitSeq((n) => n + 1);
      }}>← 戻る</button>
      <nav className="packing-breadcrumb" aria-label="基本充填からの経路">
        <button onClick={() => navigate({ focus: "@all", lens: null })}>全体</button>
        {scopePath.map((id) => <span key={id}><span aria-hidden="true"> / </span><button onClick={() => navigate({ focus: id, lens: null })}>{titleOf(id)}</button></span>)}
        {lensObject && <span> / {lensObject.title}</span>}
      </nav>
      <span className="spacer" />
      <button id="toggleInspector" className={`small${state.sidebars.right ? " active" : ""}`} aria-controls="inspectorPanel" aria-expanded={state.sidebars.right}
        onClick={() => dispatch({ type: "sidebar", side: "right", open: !state.sidebars.right, narrow })}>構造の詳細</button>
    </div>
    <div id="workspace" className="workspace" style={{ "--sidebar-width": `${state.sidebars.leftWidth}px`, "--inspector-width": `${state.sidebars.rightWidth}px` } as CSSProperties}>
      <button id="sidebarBackdrop" className="sidebarbackdrop" aria-label="サイドバーを閉じる" hidden={!activeOverlay} onClick={() => dispatch({ type: "closeSidebars" })} />
      <aside id="structureSidebar" className="sidebar packing-sidebar" hidden={!state.sidebars.left} aria-label="統一された構造系統">
        <div className="packing-search"><label htmlFor="packingSearch">構造・組成を探す</label><input id="packingSearch" type="search" placeholder="パイロクロア・LiCoO₂…" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && hits[0]) pick(hits[0].id, true); if (e.key === "Escape") setQuery(""); }} />
          {query.trim() && <div className="packing-hits" role="region" aria-label="検索結果">{hits.length ? hits.map((n) => <button key={n.id} data-packing-result={n.id} onClick={() => pick(n.id, true)}>{n.name}<small>{ancestors(TREE, n.id).slice(0, -1).map(titleOf).join(" › ")}</small></button>) : <p>一致する構造はありません。</p>}</div>}
        </div>
        <div className="label">基本充填 → 派生 → 具体物質</div>
        <div className="packing-tree">{TREE.roots.map((id) => navBranch(id))}</div>
        <details className="packing-index"><summary>横断索引・文献の説明経路</summary>
          <p>別の分類体系へ移動せず、同じ系統上で対象とその祖先を表示します。</p>
          <input type="search" aria-label="索引・文献ルートを検索" placeholder="Glazer、パイロクロア、NiAs…" value={indexQuery} onChange={(e) => setIndexQuery(e.target.value)} />
          {[...new Set(DATA.collections.map((c) => c.group))].map((group) => {
            const entries = DATA.collections.filter((c) => c.group === group && `${c.title} ${c.desc}`.toLowerCase().includes(indexQuery.toLowerCase()));
            return entries.length ? <details key={group} open={!!indexQuery}><summary>{group}</summary>{entries.map((c) => <button key={c.id} data-packing-index={c.id} className={place.lens?.id === c.id ? "active" : ""} onClick={() => navigate({ focus: "@all", lens: { kind: "collection", id: c.id } })}><span>索引</span>{c.title}</button>)}</details> : null;
          })}
          <details open={!!indexQuery}><summary>岡本資料の説明経路</summary>{DATA.flows.filter((f) => `${f.title} ${f.desc}`.toLowerCase().includes(indexQuery.toLowerCase())).map((f) => <button key={f.id} data-packing-flow={f.id} className={place.lens?.id === f.id ? "active" : ""} onClick={() => navigate({ focus: "@all", lens: { kind: "flow", id: f.id } })}><span>文献経路</span>{f.title}</button>)}</details>
        </details>
        <p className="packing-footnote">原データ {DATA.nodes.length} 構造を保持。親経路未検証 {TREE.unassigned.length} 件。色は導出の入口、空間群は各構造の詳細を参照。</p>
      </aside>
      <PackingResizer side="left" hidden={!state.sidebars.left || narrow} />
      <section className="graphpanel packing-graph" aria-label="基本充填からの派生マップ" inert={activeOverlay}>
        <div className="graphbar"><div><span className="eyebrow">PACKING → DERIVATION → REALIZATION</span><h2 id="familyTitle">{lensObject?.title ?? titleOf(place.focus)}</h2></div><span className="spacer" />
          <div className="segmented"><button id="mapMode" className={viewMode === "map" ? "active" : ""} onClick={() => setViewMode("map")}>地図</button><button id="listMode" className={viewMode === "list" ? "active" : ""} onClick={() => setViewMode("list")}>一覧</button></div>
        </div>
        <div className="packing-toolbar">
          <button className="small" id="packingFocus" disabled={!selectedId} onClick={() => { if (selectedId) navigate({ focus: selectedId, lens: null }); }}>選択から展開</button>
          <button className="small" id="packingFold" disabled={!selectedId || !TREE.children.get(selectedId)?.length} onClick={() => { if (selectedId) toggleFold(selectedId); }}>{selectedId && collapsed.has(selectedId) ? "枝を再表示" : "この枝を畳む"}</button>
          <button className="small" id="packingExpandAll" disabled={!collapsed.size} onClick={() => setCollapsed(new Set())}>全世代を展開</button>
          <span className="spacer" /><label><input type="checkbox" checked={overlay} onChange={(e) => setOverlay(e.target.checked)} />別経路を重ねる</label>
        </div>
        <div className="packing-sourcebar"><label>出典を強調 <select aria-label="出典を強調" value={source} onChange={(e) => setSource(e.target.value)}><option value="">すべて</option>{Object.entries(DATA.sources).map(([id, s]) => <option key={id} value={id}>{s.short}</option>)}</select></label>
          <label><input type="checkbox" checked={strict} onChange={(e) => setStrict(e.target.checked)} />重ねる関係を群–部分群に限定</label>
        </div>
        <div className="packing-caption">{lensObject ? <>{lensObject.desc}<RefChips refs={lensObject.refs} inline /> <strong>薄いノードは経路を保つための祖先です。</strong></> : ROOT_NOTES[place.focus] ?? TREE.entries.get(place.focus)?.description ?? "bcc・ccp・hcpから派生を辿る。最初は入口を折り畳んで表示しています。各カードの件数で展開、または左の系統を選択。案内の枝と構造変換を区別します。"}</div>
        {classificationTable && <details className="packing-classification" id="classificationInfo"><summary>{classificationTable.title}（比較表）</summary><div className="packing-table-scroll"><table className="structuretable"><thead><tr>{classificationTable.headings.map((h) => <th key={h}>{h}</th>)}<th>構造を見る</th></tr></thead><tbody>{classificationTable.rows.map((row, i) => <tr key={i}>{row.cells.map((cell, j) => <td key={j}>{cell}</td>)}<td>{row.ids.map((id) => <button key={id} className="small" data-jump={id} onClick={() => pick(id)}>{titleOf(id)}</button>)}</td></tr>)}</tbody></table></div></details>}
        {viewMode === "map" ? <PackingCanvas view={view} positions={positions} selectedId={selectedId} overlays={sourceEdges} source={source} sourceMatched={sourceMatched} fitSeq={fitSeq} focusId={place.focus} onPick={pick} onFocus={(id) => navigate({ focus: id, lens: null })} onLink={(link) => { setSelection({ kind: "hierarchy", link }); dispatch({ type: "sidebar", side: "right", open: true, narrow }); }} onSource={(edge) => { setSelection({ kind: "source", edge }); dispatch({ type: "sidebar", side: "right", open: true, narrow }); }} onUnfold={toggleFold} />
          : <div className="listview"><table className="structuretable"><thead><tr><th>構造・整理の枝</th><th>種別</th><th>基本配列からの経路</th></tr></thead><tbody>{view.entries.map((entry) => <tr key={entry.id}><td><button className="small flat" onClick={() => pick(entry.id)}>{entry.title}</button><small>{entry.structure?.formula}</small></td><td>{ROLE_LABELS[entry.role]}</td><td>{ancestors(TREE, entry.id).slice(0, -1).map(titleOf).join(" › ")}</td></tr>)}</tbody></table></div>}
        <div className="graphfoot"><span>{view.entries.filter((e) => e.structure).length} 構造 + {view.entries.filter((e) => !e.structure).length} 整理の枝 / {view.links.length} 主経路 · {sourceEdges.length} 重ねた関係</span><span>実線: 記述・具体化 / 点線: 案内 / 紫: 文献の別経路</span></div>
      </section>
      <PackingResizer side="right" hidden={!state.sidebars.right || narrow} />
      <section id="inspectorPanel" className="inspectorpanel" hidden={!state.sidebars.right}>
        <div className="inspectorbar"><span>構造・経路の詳細</span><button id="closeInspector" className="small" onClick={() => { dispatch({ type: "sidebar", side: "right", open: false }); focusSoon("toggleInspector"); }}>閉じる ×</button></div>
        <aside id="inspector" className="inspector packing-inspector" aria-label="選択した構造の詳細" aria-live="polite">
          {selectedEntry ? <>
            <div className="inspecthead"><span className="eyebrow">{ROLE_LABELS[selectedEntry.role]}</span><h2>{selectedEntry.title}</h2><p className="packing-path">{selectedPath.map(titleOf).join(" › ")}</p>
              <button className="small" onClick={() => navigate({ focus: selectedEntry.id, lens: null })}>この構造から先を表示</button></div>
            {selectedEntry.structure ? <StructureDetail node={selectedEntry.structure} /> : <div className="inspectbody"><p className="desc">{selectedEntry.description}</p><div className="note">これは説明用の整理ノードです。実在する結晶相・空間群・CIFを割り当てていません。</div><RefChips refs={selectedEntry.refs} /></div>}
            <div className="inspectbody"><h3>主系統のつながり</h3>{TREE.parent.has(selectedEntry.id) && <button className="packing-detail-link" onClick={() => pick(TREE.parent.get(selectedEntry.id)!.parent)}>↑ {titleOf(TREE.parent.get(selectedEntry.id)!.parent)}</button>}
              {(TREE.children.get(selectedEntry.id) ?? []).map((id) => <button className="packing-detail-link" key={id} onClick={() => pick(id, true)}>↓ {titleOf(id)}<small>{TREE.parent.get(id)?.label}</small></button>)}
              {selectedEntry.structure && <details className="packing-related"><summary>文献に記録された別経路・比較</summary><p>ここは主系統の親子関係ではありません。部分網の一致と結晶全体の派生を区別します。</p>{DATA.edges.filter((e) => e.a === selectedEntry.id || e.b === selectedEntry.id).map((e) => <button className="packing-detail-link" key={e.id} data-relation={e.id} onClick={() => setSelection({ kind: "source", edge: e })}>{titleOf(e.a)} {e.undirected ? "↔" : "→"} {titleOf(e.b)}<small>{e.label}</small></button>)}</details>}
            </div>
          </> : selection.kind === "hierarchy" ? <div className="inspectbody"><span className="eyebrow">{LINK_LABELS[selection.link.kind]}</span><h2>{titleOf(selection.link.parent)} → {titleOf(selection.link.child)}</h2><p>{selection.link.label}</p><div className="note">主経路は読む順序です。具体化は対称性低下と同じではなく、実際の反応・相転移を意味しません。</div><RefChips refs={selection.link.refs} /></div>
            : selection.kind === "source" ? <div className="inspectbody"><span className="eyebrow">文献の関係 / 主系統の順位には不使用</span><h2>{titleOf(selection.edge.a)} {selection.edge.undirected ? "↔" : "→"} {titleOf(selection.edge.b)}</h2><p>{selection.edge.label}</p><p>{selection.edge.desc}</p>{selection.edge.strict && <div className="note green">文献確認済み群–部分群 · {selection.edge.index}<br />{selection.edge.basis}<br />{selection.edge.split}</div>}{selection.edge.warning && <div className="note warn">{selection.edge.warning}</div>}<RefChips refs={selection.edge.refs} /><div className="row"><button data-comparepair={`${selection.edge.a},${selection.edge.b}`} onClick={() => dispatch({ type: "comparePair", a: selection.edge.a, b: selection.edge.b })}>両構造を比較</button><button onClick={() => pick(selection.edge.a, true)}>始点を見る</button><button onClick={() => pick(selection.edge.b, true)}>終点を見る</button></div></div> : null}
        </aside>
      </section>
    </div>
    <CompareTray />
  </section>;
}

function StructureDetail({ node }: { node: AtlasNode }) {
  const { state, dispatch } = useAtlas();
  const model = useMemo(() => modelFor(node.model ?? node.id), [node]);
  return <div className="inspectbody"><div className="row"><span className="mono">{node.formula}</span><span className="spacer" /><button className="small" data-compare={node.id} onClick={() => dispatch({ type: "toggleCompare", id: node.id })}>{state.comp.includes(node.id) ? "比較から外す" : "＋ 比較"}</button></div><p className="desc">{node.desc}</p>
    {LABPRESETS.some((p) => p.id === (node.model ?? node.id)) && <button className="small" data-openlab={node.id} onClick={() => dispatch({ type: "lab", id: node.model ?? node.id, open: true })}>4副格子の模型で見る</button>}
    {model.atoms.length > 0 && <ModelPanel key={node.id} node={node} model={model} />}
    <dl className="packing-facts"><dt>空間群・対称性</dt><dd>{node.sg}</dd><dt>基準となる骨格</dt><dd>{node.packing}</dd><dt>配位</dt><dd>{node.coord}</dd><dt>連結</dt><dd>{node.link}</dd></dl>
    {node.note && <div className="note warn">{node.note}</div>}
    {(DATA.structureLabels[node.id] ?? []).map((l, i) => <div className="detailsection" key={i}><h3>{l.key}</h3><p>{l.value}</p>{l.detail && <p className="muted">{l.detail}</p>}<RefChips refs={l.refs} /></div>)}<div className="detailsection"><h3>出典</h3><RefChips refs={node.refs} /></div>
  </div>;
}

interface CanvasProps {
  view: PackingView; positions: Map<string, PackingPoint>; selectedId: string | null;
  overlays: AtlasEdge[]; source: string; sourceMatched: Set<string>; fitSeq: number; focusId: string;
  onPick: (id: string) => void; onFocus: (id: string) => void;
  onLink: (link: PackingLink) => void; onSource: (edge: AtlasEdge) => void; onUnfold: (id: string) => void;
}
function PackingCanvas({ view, positions, selectedId, overlays, source, sourceMatched, fitSeq, focusId, onPick, onFocus, onLink, onSource, onUnfold }: CanvasProps) {
  const svg = useRef<SVGSVGElement>(null);
  const [camera, setCamera] = useState<Camera>({ x: 500, y: 50, scale: 0.6 });
  const drag = useRef<{ x: number; y: number; camera: Camera; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const fit = (readable = false) => {
    const box = svg.current?.getBoundingClientRect(); if (!box?.width || !box.height || !positions.size) return;
    const points = [...positions.values()];
    const minX = Math.min(...points.map((p) => p.x)) - CARD_W / 2 - 40;
    const maxX = Math.max(...points.map((p) => p.x)) + CARD_W / 2 + 40;
    const minY = Math.min(...points.map((p) => p.y)) - CARD_H / 2 - 30;
    const maxY = Math.max(...points.map((p) => p.y)) + CARD_H / 2 + 65;
    const scale = Math.min(1, box.width / (maxX - minX), box.height / (maxY - minY));
    if (readable && scale < 0.45) {
      const anchor = positions.get(focusId) ?? (selectedId ? positions.get(selectedId) : null) ?? points[0];
      const readableScale = box.width < 600 ? 0.6 : 0.8;
      setCamera({ x: box.width / 2 - anchor.x * readableScale, y: 85 - anchor.y * readableScale, scale: readableScale });
    } else setCamera({ x: (box.width - (maxX + minX) * scale) / 2, y: (box.height - (maxY + minY) * scale) / 2, scale });
  };
  const fitRef = useRef(fit); fitRef.current = fit;
  useEffect(() => { fitRef.current(true); }, [positions, fitSeq]);
  const viewportSize = useRef<{ width: number; height: number } | null>(null);
  useEffect(() => {
    if (!svg.current) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (!width || !height) return;
      const previous = viewportSize.current;
      if (previous) setCamera((c) => ({ ...c, x: c.x + (width - previous.width) / 2, y: c.y + (height - previous.height) / 2 }));
      else fitRef.current(true);
      viewportSize.current = { width, height };
    });
    observer.observe(svg.current);
    return () => observer.disconnect();
  }, []);
  const zoom = (factor: number) => {
    const box = svg.current?.getBoundingClientRect(); if (!box) return;
    setCamera((c) => { const scale = Math.max(0.015, Math.min(2.5, c.scale * factor)); const f = scale / c.scale;
      return { x: box.width / 2 + (c.x - box.width / 2) * f, y: box.height / 2 + (c.y - box.height / 2) * f, scale }; });
  };
  const showSelected = () => {
    const p = selectedId ? positions.get(selectedId) : null; const box = svg.current?.getBoundingClientRect();
    if (p && box) setCamera({ x: box.width / 2 - p.x, y: box.height / 2 - p.y, scale: 1 });
  };
  const connector = (a: PackingPoint, b: PackingPoint) => `M ${a.x} ${a.y + CARD_H / 2} C ${a.x} ${(a.y + b.y) / 2} ${b.x} ${(a.y + b.y) / 2} ${b.x} ${b.y - CARD_H / 2}`;
  const validClick = (fn: () => void) => { if (!suppressClick.current) fn(); };
  return <div className="graphstage packing-stage">
    <svg id="map" ref={svg} aria-label="上から下へ具体化する主系統図" onPointerDown={(e) => {
      if (e.button !== 0) return; suppressClick.current = false;
      drag.current = { x: e.clientX, y: e.clientY, camera, moved: false };
    }} onPointerMove={(e) => {
      const d = drag.current; if (!d) return;
      const dx = e.clientX - d.x, dy = e.clientY - d.y;
      if (Math.hypot(dx, dy) > 5) { d.moved = true; suppressClick.current = true; }
      if (d.moved) { e.currentTarget.setPointerCapture(e.pointerId); setCamera({ ...d.camera, x: d.camera.x + dx, y: d.camera.y + dy }); }
    }} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }}
      onWheel={(e) => { e.stopPropagation(); zoom(e.deltaY < 0 ? 1.12 : 1 / 1.12); }}>
      <defs><marker id="packing-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10" fill="#789da9" /></marker><marker id="packing-source-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10" fill="#caa9f0" /></marker></defs>
      <g id="packingViewport" transform={`translate(${camera.x} ${camera.y}) scale(${camera.scale})`}>
        {view.links.map((link) => {
          const a = positions.get(link.parent)!, b = positions.get(link.child)!;
          const d = connector(a, b);
          return <g key={link.id} className={`packing-link ${link.kind}`}>
            <path d={d} markerEnd={link.kind !== "topic" ? "url(#packing-arrow)" : undefined} />
            <path className="packing-link-hit" d={d} role="button" tabIndex={0} aria-label={`${titleOf(link.parent)}から${titleOf(link.child)}: ${link.label}`} onClick={() => validClick(() => onLink(link))} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onLink(link); } }} />
          </g>;
        })}
        {overlays.map((edge, i) => {
          const a = positions.get(edge.a)!, b = positions.get(edge.b)!;
          const side = Math.min(a.x, b.x) - 165 - (i % 5) * 22;
          const d = `M ${a.x - CARD_W / 2} ${a.y} C ${side} ${a.y - 75} ${side} ${b.y - 75} ${b.x - CARD_W / 2} ${b.y}`;
          return <g key={edge.id} className="packing-overlay"><path d={d} markerEnd={edge.undirected ? undefined : "url(#packing-source-arrow)"} /><path className="packing-link-hit" d={d} role="button" tabIndex={0} aria-label={`文献関係: ${edge.label}`} onClick={() => validClick(() => onSource(edge))} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSource(edge); } }} /></g>;
        })}
        {view.entries.map((entry) => {
          const p = positions.get(entry.id)!;
          const count = view.folds.get(entry.id);
          const faded = source && !sourceMatched.has(entry.id);
          return <g key={entry.id} data-packing-node={entry.id} data-rank={p.rank} data-role={entry.role} data-context={view.context.has(entry.id) || undefined}
            className={`packing-node${selectedId === entry.id ? " selected" : ""}${faded ? " source-muted" : ""}${entry.role === "topic" ? " topic" : ""}`} transform={`translate(${p.x} ${p.y})`}>
            <g role="button" tabIndex={0} aria-label={`${entry.title} · ${ROLE_LABELS[entry.role]}`} onClick={() => validClick(() => onPick(entry.id))} onDoubleClick={() => onFocus(entry.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPick(entry.id); } }}>
              <title>{entry.title}\n{TREE.parent.get(entry.id)?.label}\n{entry.description}</title>
              <rect className="packing-card" x={-CARD_W / 2} y={-CARD_H / 2} width={CARD_W} height={CARD_H} rx="10" />
              <rect x={-CARD_W / 2 + 1} y={-CARD_H / 2 + 12} width="3" height={CARD_H - 24} fill={colorOf(entry.id)} />
              <text x={-CARD_W / 2 + 14} y="-27" className="packing-card-role">{ROLE_LABELS[entry.role]}</text>
              <text x={-CARD_W / 2 + 14} y="-5" className="packing-card-title">{entry.title.length > 19 ? `${entry.title.slice(0, 18)}…` : entry.title}</text>
              <text x={-CARD_W / 2 + 14} y="16" className="packing-card-sub">{(entry.structure?.formula ?? "説明用の整理ノード").slice(0, 27)}</text>
              <text x={-CARD_W / 2 + 14} y="34" className="packing-card-op">{(TREE.parent.get(entry.id)?.label ?? "基本的な出発配列").slice(0, 25)}</text>
            </g>
            {count && <g className="packing-fold" role="button" tabIndex={0} aria-label={`${entry.title}の${count}項目を展開`} onClick={() => validClick(() => onUnfold(entry.id))} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onUnfold(entry.id); } }} transform={`translate(0 ${CARD_H / 2 + 17})`}><rect x="-96" y="-12" width="192" height="24" rx="6" /><text textAnchor="middle" y="4">＋ {count}項目を展開</text></g>}
          </g>;
        })}
      </g>
    </svg>
    {!view.entries.length && <div className="packing-empty">この索引に表示対象がありません。系統ナビゲーションから別の枝を選択してください。</div>}
    <div className="graphcontrols"><button aria-label="拡大" onClick={() => zoom(1.3)}>＋</button><button aria-label="縮小" onClick={() => zoom(1 / 1.3)}>−</button><span className="zoomtext">{Math.round(camera.scale * 100)}%</span><button id="packingFit" onClick={() => fit()}>全体に合わせる</button><button id="packingCenter" onClick={showSelected} disabled={!selectedId || !positions.has(selectedId)}>選択を等倍で</button></div>
    <div className="maphint">クリック: 詳細 / ダブルクリック: この先 / ドラッグ: 移動</div>
  </div>;
}

function PackingResizer({ side, hidden }: { side: Side; hidden: boolean }) {
  const { state, dispatch } = useAtlas();
  const [min, max] = SIDEBAR_LIMITS[side];
  const width = side === "left" ? state.sidebars.leftWidth : state.sidebars.rightWidth;
  const sign = side === "left" ? 1 : -1;
  const drag = useRef<{ x: number; width: number } | null>(null);
  const resize = (value: number) => dispatch({ type: "sidebarWidth", side, width: value });
  return <div id={`${side}Resize`} className="sidebarresize" role="separator" tabIndex={0} aria-label={side === "left" ? "分類サイドバーの幅" : "詳細サイドバーの幅"} aria-orientation="vertical" aria-valuemin={min} aria-valuemax={max} aria-valuenow={width} hidden={hidden}
    onPointerDown={(e: PointerEvent<HTMLDivElement>) => { if (e.button !== 0) return; drag.current = { x: e.clientX, width }; e.currentTarget.setPointerCapture(e.pointerId); e.preventDefault(); }}
    onPointerMove={(e) => { if (drag.current) resize(drag.current.width + sign * (e.clientX - drag.current.x)); }} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }}
    onKeyDown={(e) => { if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return; e.preventDefault(); resize(e.key === "Home" ? min : e.key === "End" ? max : width + (e.key === "ArrowRight" ? 20 : -20) * sign); }} />;
}
