import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { DATA } from "../../data/atlas.ts";
import { KINDS } from "../../data/presets.ts";
import {
  ALL,
  crossFamilyCount,
  findCollection,
  findFlow,
  familyOf,
  N,
  node,
  scopeGraph,
  type Graph,
} from "../../lib/atlas.ts";
import { derivationGraph, relationshipCurve, type DerivationView } from "../../lib/flow-layout.ts";
import { frac } from "../../lib/format.ts";
import { focusSoon, isNarrow, useAtlas, useSelectNode } from "../../store.ts";
import type { KindId } from "../../types.ts";
import { RefChips } from "../RefChips.tsx";

const CARD = { w: 220, h: 86 };

interface Derived {
  scope: Graph;
  view: DerivationView;
  /** Relations on the selected structure's lineage. */
  highlighted: Set<string>;
}

function useDerived(): Derived {
  const { state } = useAtlas();
  const { family, flow, collection, strict, selected } = state;
  const { mode, anchor, collapsed } = state.exploration;
  const scope = useMemo(
    () => scopeGraph({ family, flow, collection, strict }),
    [family, flow, collection, strict],
  );
  const view = useMemo(
    () =>
      derivationGraph(
        scope.nodes,
        scope.edges,
        mode === "focus" ? anchor : null,
        new Set(collapsed),
      ),
    [scope, mode, anchor, collapsed],
  );
  const highlighted = useMemo(
    () => new Set(derivationGraph(view.nodes, view.edges, selected).edges.map((e) => e.id)),
    [view, selected],
  );
  return { scope, view, highlighted };
}

export function GraphPanel({ inert }: { inert: boolean }) {
  const { state, dispatch } = useAtlas();
  const derived = useDerived();
  const { scope, view } = derived;
  return (
    <section className="graphpanel" aria-label="結晶構造関係グラフ" inert={inert}>
      <div className="graphbar">
        <GraphTitle />
        <span className="spacer" />
        <div className="segmented" aria-label="表示形式">
          <button
            id="mapMode"
            className={state.view === "map" ? "active" : ""}
            onClick={() => dispatch({ type: "view", view: "map" })}
          >
            地図
          </button>
          <button
            id="listMode"
            className={state.view === "list" ? "active" : ""}
            onClick={() => dispatch({ type: "view", view: "list" })}
          >
            一覧
          </button>
        </div>
      </div>
      <ExplorationBar view={view} />
      <ClassificationInfo />
      <MapStage derived={derived} hidden={state.view !== "map"} />
      <ListView scope={scope} hidden={state.view !== "list"} />
      <div className="graphfoot">
        <span id="graphStatus">
          表示 {view.nodes.length} 構造 / {view.edges.length} 関係
          {view.groups.length ? ` · ${view.groups.length} 枝を折り畳み中` : ""} · 範囲内{" "}
          {scope.nodes.length} 構造
        </span>
        <span className="second">分類は一つの見方。横断的な関係は詳細からたどれます。</span>
      </div>
    </section>
  );
}

function GraphTitle() {
  const { state } = useAtlas();
  const selection = findFlow(state.flow) ?? findCollection(state.collection);
  if (selection)
    return (
      <div>
        <h2 id="familyTitle">{selection.title}</h2>
        <div className="subtitle" id="familySubtitle">
          <details className="scopedescription" key={selection.id}>
            <summary>説明・出典</summary>
            {selection.desc} <RefChips refs={selection.refs} inline />
          </details>
        </div>
      </div>
    );
  const all = state.family === ALL;
  return (
    <div>
      <h2 id="familyTitle">{all ? "全構造の派生フロー" : familyOf(state.family).name}</h2>
      <div className="subtitle" id="familySubtitle">
        {all
          ? "親構造を上段に配置し、ファミリー間の派生も下向きに表示。"
          : familyOf(state.family).subtitle}
      </div>
    </div>
  );
}

function ExplorationBar({ view }: { view: DerivationView }) {
  const { state, dispatch } = useAtlas();
  const { mode, anchor, collapsed } = state.exploration;
  const openGroup = (key: string) => {
    dispatch({ type: "openGroup", key });
    focusSoon("foldBranch");
  };
  return (
    <>
      <div className="explorationbar" id="explorationBar">
        <span id="explorationTitle">
          {mode === "focus"
            ? `${N.get(anchor)?.name ?? "該当構造なし"} の祖先・子孫（世代制限なし）`
            : "全世代のツリー · 枝を選んで折り畳めます"}
        </span>
        <button
          id="foldBranch"
          className="small"
          disabled={!view.edges.some((e) => !e.undirected && e.a === state.selected)}
          onClick={() => dispatch({ type: "fold" })}
        >
          この枝を畳む
        </button>
        <button
          id="collapseGroups"
          className="small"
          hidden={!collapsed.length}
          onClick={() => {
            dispatch({ type: "unfoldAll" });
            focusSoon("focusGraph");
          }}
        >
          全ての枝を開く
        </button>
      </div>
      <div id="explorationGroups" className="explorationgroups" hidden={!view.groups.length}>
        {view.groups.map((group) => (
          <button
            key={group.key}
            className="small"
            data-branch={group.key}
            onClick={() => openGroup(group.key)}
          >
            {node(group.parent).name} の先を開く ({group.count})
          </button>
        ))}
      </div>
    </>
  );
}

/** Related classifications and the comparison table of the open classification. */
function ClassificationInfo() {
  const { state, dispatch } = useAtlas();
  const selectNode = useSelectNode();
  const collection = findCollection(state.collection);
  const parent = DATA.collections.find((c) => c.id === collection?.parent);
  const children = collection ? DATA.collections.filter((c) => c.parent === collection.id) : [];
  const links = [...(parent ? [parent] : []), ...children];
  const table = collection?.table;
  return (
    <div
      id="classificationInfo"
      className="classificationinfo"
      hidden={!collection || (!links.length && !table)}
      key={collection?.id ?? "none"}
    >
      {links.length > 0 && (
        <details className="classificationnavigation">
          <summary>関連する分類（{links.length}）</summary>
          <div className="row">
            {links.map((c) => (
              <button
                key={c.id}
                className="small"
                data-classification={c.id}
                onClick={() => dispatch({ type: "classification", id: c.id })}
              >
                {c.short ?? c.title}
              </button>
            ))}
          </div>
        </details>
      )}
      {table && (
        <details>
          <summary>{table.title}</summary>
          <div className="tablewrap">
            <table>
              <thead>
                <tr>
                  {table.headings.map((heading) => (
                    <th scope="col" key={heading}>
                      {heading}
                    </th>
                  ))}
                  <th scope="col">収録例</th>
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, i) => (
                  <tr key={i}>
                    {row.cells.map((cell, j) => (
                      <td key={j}>{cell}</td>
                    ))}
                    <td>
                      {row.ids.length
                        ? row.ids.map((id) => (
                            <button
                              key={id}
                              className="small flat"
                              data-jump={id}
                              onClick={() => selectNode(id)}
                            >
                              {node(id).name}
                            </button>
                          ))
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </div>
  );
}

interface Cam {
  x: number;
  y: number;
  k: number;
}

const onActivate = (fn: () => void) => (ev: KeyboardEvent) => {
  if (ev.key === "Enter" || ev.key === " ") {
    ev.preventDefault();
    fn();
  }
};

function MapStage({ derived, hidden }: { derived: Derived; hidden: boolean }) {
  const { state, dispatch } = useAtlas();
  const selectNode = useSelectNode();
  const { view, highlighted } = derived;
  const svg = useRef<SVGSVGElement>(null);
  const viewport = useRef<SVGGElement>(null);
  const [cam, setCam] = useState<Cam>({ x: 0, y: 0, k: 1 });
  const camRef = useRef(cam);
  const [dragging, setDragging] = useState(false);
  const gesture = useRef({
    pointers: new Map<number, { x: number; y: number }>(),
    panStart: null as { x: number; y: number; cx: number; cy: number } | null,
    /** True right after a drag, so the click that ends it does not select anything. */
    moved: false,
    pinch: null as { dist: number; x: number; y: number } | null,
  });
  const active = state.tab === "explore" && state.view === "map";

  const apply = useCallback((c: Cam) => {
    camRef.current = c;
    setCam(c);
  }, []);

  /** Frame the selection at a readable zoom: whole tree if it fits vertically, else around the selection. */
  const readMap = useCallback(() => {
    const rect = svg.current?.getBoundingClientRect();
    if (!active || !rect?.width || !view.nodes.length) return;
    const points = [...view.positions.values()];
    const left = Math.min(...points.map((p) => p.x)) - 175;
    const right = Math.max(...points.map((p) => p.x)) + 175;
    const k = Math.max(0.7, Math.min(1.05, (rect.width / (right - left)) * 0.96));
    const selected = view.positions.get(state.selected);
    const center = selected ?? view.positions.get(state.exploration.anchor);
    const top = Math.min(...points.map((p) => p.y)) - 60;
    const bottom = Math.max(...points.map((p) => p.y)) + 60;
    const y =
      (bottom - top) * k <= rect.height - 130
        ? (rect.height - 30) / 2 - ((top + bottom) / 2) * k
        : Math.min(
            60 - top * k,
            Math.max(rect.height - 90 - bottom * k, 130 - (selected?.y ?? top) * k),
          );
    apply({ k, x: rect.width / 2 - (center?.x ?? (left + right) / 2) * k, y });
  }, [active, view, state.selected, state.exploration.anchor, apply]);

  /** Fit everything drawn (cards, curves and fold summaries). */
  const fitMap = useCallback(() => {
    const r = svg.current?.getBoundingClientRect();
    if (!active || !r?.width || !r.height) return;
    if (!view.positions.size || !viewport.current) {
      apply({ x: r.width / 2, y: r.height / 2, k: 1 });
      return;
    }
    const b = viewport.current.getBBox();
    const x1 = b.x - 25;
    const x2 = b.x + b.width + 25;
    const y1 = b.y - 55;
    const y2 = b.y + b.height + 85;
    const k = Math.min(r.width / (x2 - x1), r.height / (y2 - y1), 1.25) * 0.96;
    apply({ k, x: r.width / 2 - ((x1 + x2) / 2) * k, y: r.height / 2 - ((y1 + y2) / 2) * k });
  }, [active, view, apply]);

  const readRef = useRef(readMap);
  const activeRef = useRef(active);
  useLayoutEffect(() => {
    readRef.current = readMap;
    activeRef.current = active;
  });

  useEffect(() => {
    const id = requestAnimationFrame(() => readRef.current());
    return () => cancelAnimationFrame(id);
  }, [state.mapSeq]);

  // Sidebar toggles and resizes keep the camera centre: shift by half the size change.
  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const size = { previous: null as { width: number; height: number } | null };
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height || !activeRef.current) return;
      const { previous } = size;
      if (previous) {
        const c = camRef.current;
        apply({
          ...c,
          x: c.x + (rect.width - previous.width) / 2,
          y: c.y + (rect.height - previous.height) / 2,
        });
      }
      size.previous = { width: rect.width, height: rect.height };
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [apply]);

  const zoom = useCallback(
    (f: number, cx?: number, cy?: number) => {
      const r = svg.current?.getBoundingClientRect();
      if (!r) return;
      const c = camRef.current;
      const x = cx ?? r.width / 2;
      const y = cy ?? r.height / 2;
      const k = Math.max(0.05, Math.min(3.8, c.k * f));
      apply({ k, x: x - ((x - c.x) * k) / c.k, y: y - ((y - c.y) * k) / c.k });
    },
    [apply],
  );

  // Wheel zoom needs a non-passive listener to stop page scrolling.
  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const onWheel = (ev: WheelEvent) => {
      ev.preventDefault();
      const r = el.getBoundingClientRect();
      zoom(Math.exp(-ev.deltaY * 0.0013), ev.clientX - r.left, ev.clientY - r.top);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoom]);

  const local = (ev: ReactPointerEvent) => {
    const r = svg.current!.getBoundingClientRect();
    return { x: ev.clientX - r.left, y: ev.clientY - r.top };
  };

  const onPointerDown = (ev: ReactPointerEvent<SVGSVGElement>) => {
    const g = gesture.current;
    g.pointers.set(ev.pointerId, local(ev));
    g.moved = false;
    if (g.pointers.size === 2) {
      const [a, b] = [...g.pointers.values()] as [
        { x: number; y: number },
        { x: number; y: number },
      ];
      g.pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      g.panStart = null;
      ev.preventDefault();
      return;
    }
    if ((ev.target as Element).closest(".node,.edgehit")) return;
    g.panStart = { x: ev.clientX, y: ev.clientY, cx: camRef.current.x, cy: camRef.current.y };
    ev.currentTarget.setPointerCapture(ev.pointerId);
    setDragging(true);
  };

  const onPointerMove = (ev: ReactPointerEvent<SVGSVGElement>) => {
    const g = gesture.current;
    if (!g.pointers.has(ev.pointerId)) return;
    g.pointers.set(ev.pointerId, local(ev));
    if (g.pointers.size === 2 && g.pinch) {
      const [a, b] = [...g.pointers.values()] as [
        { x: number; y: number },
        { x: number; y: number },
      ];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const x = (a.x + b.x) / 2;
      const y = (a.y + b.y) / 2;
      zoom(dist / g.pinch.dist, x, y);
      const c = camRef.current;
      apply({ ...c, x: c.x + x - g.pinch.x, y: c.y + y - g.pinch.y });
      g.pinch = { dist, x, y };
      g.moved = true;
      return;
    }
    if (!g.panStart) return;
    const dx = ev.clientX - g.panStart.x;
    const dy = ev.clientY - g.panStart.y;
    if (Math.hypot(dx, dy) > 3) g.moved = true;
    apply({ ...camRef.current, x: g.panStart.cx + dx, y: g.panStart.cy + dy });
  };

  const endPointer = (ev: ReactPointerEvent<SVGSVGElement>) => {
    const g = gesture.current;
    g.pointers.delete(ev.pointerId);
    if (g.pointers.size < 2) g.pinch = null;
    g.panStart = null;
    setDragging(false);
    setTimeout(() => (g.moved = false), 100);
  };

  const pan = (dx: number, dy: number) => {
    const c = camRef.current;
    apply({ ...c, x: c.x + dx, y: c.y + dy });
  };

  const openGroup = (key: string) => {
    if (gesture.current.moved) return;
    dispatch({ type: "openGroup", key });
    focusSoon("foldBranch");
  };

  const cross = crossFamilyCount(state.selected, state.strict);
  const pos = (id: string) => view.positions.get(id)!;

  return (
    <div className="graphstage" id="graphStage" hidden={hidden}>
      <div className="graphtopnote" id="graphNote">
        <span>親 → 子 → 孫へ、世代を保って上から下に表示</span>
        {state.strict && <span>確認済みの群–部分群関係のみ</span>}
        {cross > 0 && state.family !== ALL && !state.flow && (
          <span>領域をまたぐ関係 {cross} 件 ↗ 詳細から探索</span>
        )}
      </div>
      <svg
        id="map"
        ref={svg}
        className={dragging ? "dragging" : undefined}
        role="img"
        aria-label="インタラクティブ構造関係図。構造を選択すると詳細が表示されます。"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
      >
        <defs id="mapDefs">
          {(Object.entries(KINDS) as [KindId, (typeof KINDS)[KindId]][]).map(([key, k]) => (
            <marker
              key={key}
              id={`arrow-${key}`}
              viewBox="0 0 10 10"
              refX={9}
              refY={5}
              markerWidth={7}
              markerHeight={7}
              orient="auto-start-reverse"
            >
              <path d="M0 0L10 5L0 10Z" fill={k.color} />
            </marker>
          ))}
        </defs>
        <g id="viewport" ref={viewport} transform={`translate(${cam.x},${cam.y}) scale(${cam.k})`}>
          <g id="clusterLayer">
            {view.groups.map((group) => (
              <path
                key={group.id}
                d={relationshipCurve(pos(group.parent), pos(group.id), view.positions).d}
                className="groupconnector"
              />
            ))}
          </g>
          <g id="edgeLayer">
            {view.edges.map((e, i) => {
              const a = node(e.a);
              const b = node(e.b);
              const curve = relationshipCurve(pos(e.a), pos(e.b), view.positions, i % 9);
              const hi = state.edge ? state.edge === e.id : highlighted.has(e.id);
              const k = KINDS[e.kind];
              const select = () => dispatch({ type: "selectEdge", id: e.id, narrow: isNarrow() });
              return (
                <g key={e.id}>
                  <path
                    d={curve.d}
                    className={`edge${hi ? " highlight" : ""}${state.edge === e.id ? " selected" : ""}`}
                    stroke={k.color}
                    strokeDasharray={k.dash || undefined}
                    markerEnd={e.undirected ? undefined : `url(#arrow-${e.kind})`}
                  />
                  <path
                    d={curve.d}
                    className="edgehit"
                    data-edge={e.id}
                    tabIndex={0}
                    role="button"
                    aria-label={`${a.name} と ${b.name}: ${e.label}`}
                    onClick={select}
                    onKeyDown={onActivate(select)}
                  >
                    <title>{`${a.name} ${e.undirected ? "↔" : "→"} ${b.name}\n${e.label}`}</title>
                  </path>
                </g>
              );
            })}
          </g>
          <g id="nodeLayer">
            {view.groups.map((group) => {
              const p = pos(group.id);
              const parent = node(group.parent).name;
              return (
                <g
                  key={group.id}
                  className="node groupnode"
                  transform={`translate(${p.x - CARD.w / 2},${p.y - CARD.h / 2})`}
                  data-group={group.key}
                  tabIndex={0}
                  role="button"
                  aria-label={`${parent}から先の${group.count}構造を再表示`}
                  onClick={() => openGroup(group.key)}
                  onKeyDown={onActivate(() => {
                    dispatch({ type: "openGroup", key: group.key });
                    focusSoon("foldBranch");
                  })}
                >
                  <rect width={CARD.w} height={CARD.h} rx={12} className="main" />
                  <NodeLabel y={14} kind="title" text={`${parent} の続き`} />
                  <NodeLabel y={39} kind="formula" text={`${group.count}構造を折り畳み中`} />
                  <NodeLabel y={61} kind="sg" text="この枝を再表示 ＋" />
                </g>
              );
            })}
            {view.nodes.map((n) => {
              const p = pos(n.id);
              const compareAt = state.comp.indexOf(n.id);
              const anchor =
                state.exploration.mode === "focus" && state.exploration.anchor === n.id;
              const pick = () => selectNode(n.id, false);
              return (
                <g
                  key={n.id}
                  className={`node${state.selected === n.id && !state.edge ? " selected" : ""}${anchor ? " anchor" : ""}`}
                  transform={`translate(${p.x - CARD.w / 2},${p.y - CARD.h / 2})`}
                  data-node={n.id}
                  tabIndex={0}
                  role="button"
                  aria-label={`${n.name} ${n.formula}`}
                  onClick={() => {
                    if (!gesture.current.moved) pick();
                  }}
                  onKeyDown={onActivate(pick)}
                >
                  <rect width={CARD.w} height={CARD.h} rx={9} className="main" />
                  <rect
                    x={0}
                    y={14}
                    width={3}
                    height={24}
                    rx={1.5}
                    fill={familyOf(n.family).color}
                    className="familystripe"
                  />
                  <NodeLabel y={12} kind="title" text={n.name} width={compareAt >= 0 ? 179 : 192} />
                  <NodeLabel y={35} kind="formula" text={n.formula} />
                  <NodeLabel y={57} kind="sg" text={n.sg} />
                  {compareAt >= 0 && (
                    <>
                      <circle cx={207} cy={12} r={7} className="comparecircle" />
                      <text x={207} y={15} textAnchor="middle" fill="#a7efd7" fontSize={9}>
                        {compareAt + 1}
                      </text>
                    </>
                  )}
                  <title>{`${n.name}\n${n.formula}\n${n.sg}`}</title>
                </g>
              );
            })}
          </g>
          <g id="edgeLabels">
            {state.edge &&
              view.edges
                .filter((e) => e.id === state.edge)
                .map((e) => {
                  const i = view.edges.indexOf(e);
                  const curve = relationshipCurve(pos(e.a), pos(e.b), view.positions, i % 9);
                  const width = Math.max(80, e.label.length * 11 + 14);
                  return (
                    <g key={e.id}>
                      <rect
                        x={curve.mx - width / 2}
                        y={curve.my - 12}
                        width={width}
                        height={24}
                        rx={5}
                        className="edgelabelbg"
                      />
                      <text x={curve.mx} y={curve.my + 4} textAnchor="middle" className="edgelabel">
                        {e.label}
                      </text>
                    </g>
                  );
                })}
          </g>
        </g>
      </svg>
      <div className="graphcontrols">
        <button id="zoomIn" aria-label="拡大" onClick={() => zoom(1.25)}>
          ＋
        </button>
        <span className="zoomtext" id="zoomText">
          {Math.round(cam.k * 100)}%
        </span>
        <button id="zoomOut" aria-label="縮小" onClick={() => zoom(0.8)}>
          −
        </button>
        <button id="fitMap" onClick={fitMap}>
          全体に合わせる
        </button>
        <button id="readMap" onClick={readMap}>
          選択位置へ
        </button>
        <button
          id="mapLeft"
          aria-label="左の構造へ"
          onClick={() => pan((svg.current?.clientWidth ?? 0) * 0.6, 0)}
        >
          ←
        </button>
        <button
          id="mapUp"
          aria-label="上の構造へ"
          onClick={() => pan(0, (svg.current?.clientHeight ?? 0) * 0.65)}
        >
          ↑
        </button>
        <button
          id="mapDown"
          aria-label="下の構造へ"
          onClick={() => pan(0, -(svg.current?.clientHeight ?? 0) * 0.65)}
        >
          ↓
        </button>
        <button
          id="mapRight"
          aria-label="右の構造へ"
          onClick={() => pan(-(svg.current?.clientWidth ?? 0) * 0.6, 0)}
        >
          →
        </button>
      </div>
      <div className="maphint">ドラッグで移動 · ホイール／ピンチで拡縮</div>
    </div>
  );
}

/** HTML label inside the SVG card, so long names ellipsize instead of being squeezed. */
function NodeLabel({
  y,
  kind,
  text,
  width = 192,
}: {
  y: number;
  kind: string;
  text: string;
  width?: number;
}) {
  return (
    <foreignObject x={14} y={y} width={width} height={20}>
      <div className={`nodelabel ${kind}`}>{text}</div>
    </foreignObject>
  );
}

function ListView({ scope, hidden }: { scope: Graph; hidden: boolean }) {
  const { state } = useAtlas();
  const selectNode = useSelectNode();
  return (
    <div className="listview" id="listView" hidden={hidden}>
      <table className="structuretable">
        <thead>
          <tr>
            <th>構造・代表組成</th>
            <th>対称性／結晶系</th>
            <th>占有率 T / O</th>
          </tr>
        </thead>
        <tbody>
          {scope.nodes.map((n) => (
            <tr
              key={n.id}
              data-listnode={n.id}
              tabIndex={0}
              className={state.selected === n.id ? "selected" : ""}
              onClick={() => selectNode(n.id, false)}
              onKeyDown={(ev) => {
                if (ev.key === "Enter") selectNode(n.id, false);
              }}
            >
              <td>
                {n.name}
                <small>{n.formula}</small>
              </td>
              <td>{n.sg}</td>
              <td className="mono">{n.occ ? n.occ.map(frac).join(" / ") : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
