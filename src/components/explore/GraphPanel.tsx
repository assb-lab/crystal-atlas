import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { DATA } from "../../data/atlas.ts";
import { KINDS } from "../../data/presets.ts";
import { frac } from "../../lib/format.ts";
import {
  ALL,
  arrowFrom,
  crossEdgesOf,
  family as familyOf,
  isCross,
  node,
  nodeBounds,
  overviewBounds,
  visibleGraph,
  type Visible,
} from "../../lib/graph.ts";
import type { Side } from "../../state.ts";
import { useAtlas, useSelectNode } from "../../store.ts";
import type { KindId } from "../../types.ts";
import { FamilyMap, OverviewMap } from "./MapLayers.tsx";

export function GraphPanel() {
  const { state, dispatch } = useAtlas();
  const visible = useMemo(
    () => visibleGraph(state.family, state.strict),
    [state.family, state.strict],
  );
  const overview = state.family === ALL;
  const fam = overview ? null : familyOf(state.family);
  const cross = visible.edges.filter(isCross).length;

  return (
    <section className="graphpanel" aria-label="結晶構造関係グラフ">
      <div className="graphbar">
        <PanelToggle side="left" />
        <div className="graphtitle">
          <h2 id="familyTitle">
            {fam ? (
              <>
                <button
                  className="crumb"
                  title="全体地図へ戻る"
                  onClick={() => dispatch({ type: "family", id: ALL })}
                >
                  全体地図
                </button>
                <span className="crumbsep" aria-hidden="true">
                  ›
                </span>
                {fam.name}
              </>
            ) : (
              "構造ファミリーの全体地図"
            )}
          </h2>
          <div className="subtitle" id="familySubtitle">
            {fam
              ? fam.subtitle
              : `${Object.keys(DATA.families).length} つのファミリーと、その間をつなぐ関係`}
          </div>
        </div>
        <span className="spacer" />
        <div className="segmented" aria-label="表示形式">
          <button
            id="mapMode"
            className={state.view === "map" ? "active" : ""}
            aria-pressed={state.view === "map"}
            onClick={() => dispatch({ type: "view", view: "map" })}
          >
            地図
          </button>
          <button
            id="listMode"
            className={state.view === "list" ? "active" : ""}
            aria-pressed={state.view === "list"}
            onClick={() => dispatch({ type: "view", view: "list" })}
          >
            一覧
          </button>
        </div>
        <PanelToggle side="right" />
      </div>
      <MapStage visible={visible} hidden={state.view !== "map"} />
      <ListView visible={visible} hidden={state.view !== "list"} />
      <div className="graphfoot">
        <span id="graphStatus">
          表示 {visible.nodes.length} 構造 / {visible.edges.length} 関係
          {overview && ` · 領域をまたぐ関係 ${cross}`}
        </span>
        <span className="second">分類は一つの見方。横断的な関係は詳細からたどれます。</span>
      </div>
    </section>
  );
}

const PANEL_LABEL: Record<Side, string> = { left: "検索・絞り込み", right: "詳細" };

function PanelToggle({ side }: { side: Side }) {
  const { state, dispatch } = useAtlas();
  const open = state.panels[side];
  const divider = side === "left" ? 7.5 : 12.5;
  const fillX = side === "left" ? 3.5 : 13.2;
  return (
    <button
      id={side === "left" ? "toggleLeft" : "toggleRight"}
      className={`paneltoggle${open ? " active" : ""}`}
      aria-controls={side === "left" ? "exploreSidebar" : "inspector"}
      aria-expanded={open}
      title={`${PANEL_LABEL[side]}パネルを${open ? "隠す" : "表示"} ( ${side === "left" ? "[" : "]"} )`}
      onClick={() => dispatch({ type: "panel", side, open: !open })}
    >
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <rect
          x="2.5"
          y="3.5"
          width="15"
          height="13"
          rx="2.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path d={`M${divider} 3.5v13`} stroke="currentColor" strokeWidth="1.4" />
        <rect
          className="fillbar"
          x={fillX}
          y="4.5"
          width="3.3"
          height="11"
          rx="1"
          fill="currentColor"
        />
      </svg>
      <span className="sr-only">{PANEL_LABEL[side]}パネルの表示切替</span>
    </button>
  );
}

interface Cam {
  x: number;
  y: number;
  k: number;
}

interface Gesture {
  pointers: Map<number, { x: number; y: number }>;
  panStart: { x: number; y: number; cx: number; cy: number } | null;
  /** True right after a drag, so the click that ends it does not select anything. */
  moved: boolean;
  pinch: { dist: number; x: number; y: number } | null;
  /** Overview tile under the pointer at pointerdown; opened on release if the pointer did not drag. */
  tile: string | null;
}

/** Screen space kept free for the note chips above and the zoom controls below. */
const BAND = { top: 40, overviewTop: 44, overviewBottom: 64 };

function MapStage({ visible, hidden }: { visible: Visible; hidden: boolean }) {
  const { state, dispatch } = useAtlas();
  const stage = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const [cam, setCam] = useState<Cam>({ x: 0, y: 0, k: 1 });
  const camRef = useRef(cam);
  const [dragging, setDragging] = useState(false);
  const gesture = useRef<Gesture>({
    pointers: new Map(),
    panStart: null,
    moved: false,
    pinch: null,
    tile: null,
  });
  const overview = state.family === ALL;

  const apply = useCallback((c: Cam) => {
    camRef.current = c;
    setCam(c);
  }, []);

  const fit = useCallback(() => {
    const r = svg.current?.getBoundingClientRect();
    if (!r?.width || !r.height) return;
    if (overview) {
      const b = overviewBounds();
      const pad = 30;
      const h = r.height - BAND.overviewTop - BAND.overviewBottom;
      const k = Math.min((r.width - pad * 2) / (b.x2 - b.x1), (h - pad) / (b.y2 - b.y1), 1.25);
      apply({
        k,
        x: r.width / 2 - ((b.x1 + b.x2) / 2) * k,
        y: BAND.overviewTop + h / 2 - ((b.y1 + b.y2) / 2) * k,
      });
      return;
    }
    const b = nodeBounds(visible.nodes);
    if (!b) {
      apply({ x: r.width / 2, y: r.height / 2, k: 1 });
      return;
    }
    const h = r.height - BAND.top;
    const k = Math.min(r.width / (b.x2 - b.x1), h / (b.y2 - b.y1), 1.25) * 0.96;
    apply({
      k,
      x: r.width / 2 - ((b.x1 + b.x2) / 2) * k,
      y: BAND.top + h / 2 - ((b.y1 + b.y2) / 2) * k,
    });
  }, [overview, visible.nodes, apply]);

  const fitRef = useRef(fit);
  useLayoutEffect(() => {
    fitRef.current = fit;
  });

  // Re-fit when the state asks for it (family, filter, view or tab changes) and when the stage resizes.
  useEffect(() => {
    const id = requestAnimationFrame(() => fitRef.current());
    return () => cancelAnimationFrame(id);
  }, [state.fitSeq]);

  useEffect(() => {
    if (!stage.current) return;
    const ro = new ResizeObserver(() => requestAnimationFrame(() => fitRef.current()));
    ro.observe(stage.current);
    return () => ro.disconnect();
  }, []);

  const zoom = useCallback(
    (f: number, cx?: number, cy?: number) => {
      const r = svg.current?.getBoundingClientRect();
      if (!r) return;
      const c = camRef.current;
      const x = cx ?? r.width / 2;
      const y = cy ?? r.height / 2;
      const k = Math.max(0.13, Math.min(3.8, c.k * f));
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
      g.tile = null;
      ev.preventDefault();
      return;
    }
    const target = ev.target as Element;
    g.tile = target.closest("[data-tile]")?.getAttribute("data-tile") ?? null;
    if (target.closest(".node,.edgehit,.bundlehit")) return;
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
    const tile = g.tile;
    const moved = g.moved;
    g.tile = null;
    g.pointers.delete(ev.pointerId);
    if (g.pointers.size < 2) g.pinch = null;
    g.panStart = null;
    setDragging(false);
    setTimeout(() => (g.moved = false), 100);
    if (ev.type === "pointerup" && tile && !moved) dispatch({ type: "family", id: tile });
  };

  const wasDrag = useCallback(() => gesture.current.moved, []);
  const layers = useMemo(
    () =>
      overview ? (
        <OverviewMap visible={visible} />
      ) : (
        <FamilyMap visible={visible} wasDrag={wasDrag} />
      ),
    [overview, visible, wasDrag],
  );

  return (
    <div className="graphstage" id="graphStage" ref={stage} hidden={hidden}>
      <GraphNote />
      <CrossDock />
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
        <g id="viewport" transform={`translate(${cam.x},${cam.y}) scale(${cam.k})`}>
          {layers}
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
        <button id="fitMap" onClick={fit}>
          全体に合わせる
        </button>
      </div>
      <div className="maphint">ドラッグで移動 · ホイール／ピンチで拡縮</div>
    </div>
  );
}

function GraphNote() {
  const { state } = useAtlas();
  const notes =
    state.family === ALL
      ? [
          ...(state.strict ? ["群–部分群の確認済み関係のみ"] : []),
          "ファミリーをクリックして中へ",
          "線の数字は領域をまたぐ関係の本数",
        ]
      : [state.strict ? "群–部分群の確認済み関係のみ" : "構造・矢印をクリックして詳細"];
  return (
    <div className="graphtopnote" id="graphNote">
      {notes.map((n) => (
        <span key={n}>{n}</span>
      ))}
    </div>
  );
}

/** Neighbours of the selected structure that live in other families; one click jumps there. */
function CrossDock() {
  const { state } = useAtlas();
  const selectNode = useSelectNode();
  const list = state.family === ALL ? [] : crossEdgesOf(state.selected, state.strict);
  const from = node(state.selected);
  return (
    <nav
      className="crossdock"
      id="crossDock"
      aria-label="他のファミリーとのつながり"
      hidden={!list.length}
    >
      <span className="crosslabel">
        他のファミリーへ <b id="crossCount">{list.length}</b>
      </span>
      <div className="crosslist" id="crossList">
        {list.map((e) => {
          const other = node(e.a === state.selected ? e.b : e.a);
          const f = familyOf(other.family);
          const arrow = arrowFrom(e, state.selected);
          return (
            <button
              key={e.id}
              className="crossitem"
              data-jump={other.id}
              title={`${from.name} ${arrow} ${other.name}：${e.label}（${f.short} へ移動）`}
              onClick={() => selectNode(other.id)}
            >
              <span className="crossarrow" style={{ color: KINDS[e.kind].color }}>
                {arrow}
              </span>
              {other.name}
              <i className="dot" style={{ background: f.color }} aria-hidden="true" />
              <small>{f.short}</small>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function ListView({ visible, hidden }: { visible: Visible; hidden: boolean }) {
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
          {visible.nodes.map((n) => (
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
