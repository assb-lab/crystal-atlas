import { useMemo, useRef, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { scopeGraph } from "../../lib/atlas.ts";
import { SIDEBAR_LIMITS, type Side } from "../../state.ts";
import { focusSoon, useAtlas, useNarrow } from "../../store.ts";
import { CompareTray } from "./CompareTray.tsx";
import { GraphPanel } from "./GraphPanel.tsx";
import { Inspector } from "./Inspector.tsx";
import { Sidebar } from "./Sidebar.tsx";

const TOGGLE: Record<Side, string> = { left: "toggleSidebar", right: "toggleInspector" };

/** Map scope and exploration controls above the workspace. */
function WorkspaceTools() {
  const { state, dispatch } = useAtlas();
  const narrow = useNarrow();
  const { left, right } = state.sidebars;
  const focus = state.exploration.mode === "focus";
  const scope = useMemo(() => scopeGraph(state), [state]);
  const canExplore = scope.nodes.some((n) => n.id === state.selected);
  const toggle = (side: Side, open: boolean) =>
    dispatch({ type: "sidebar", side, open: !open, narrow });
  return (
    <div className="workspacetools">
      <button
        id={TOGGLE.left}
        className={`small${left ? " active" : ""}`}
        aria-controls="structureSidebar"
        aria-expanded={left}
        onClick={() => toggle("left", left)}
      >
        分類・検索
      </button>
      <div className="segmented" aria-label="マップの範囲">
        <button
          id="overviewGraph"
          className={focus ? "" : "active"}
          aria-pressed={!focus}
          onClick={() => dispatch({ type: "overview" })}
        >
          全世代ツリー
        </button>
        <button
          id="focusGraph"
          className={focus ? "active" : ""}
          aria-pressed={focus}
          onClick={() => {
            if (canExplore) dispatch({ type: "focusSelection" });
          }}
        >
          選択系統
        </button>
      </div>
      <button
        id="exploreBack"
        className="small"
        disabled={!state.exploration.history.length}
        aria-label="前の探索の中心に戻る"
        onClick={() => dispatch({ type: "back" })}
      >
        ← 戻る
      </button>
      <button
        id="exploreSelection"
        className="small"
        disabled={!canExplore}
        onClick={() => dispatch({ type: "focusSelection" })}
      >
        この系統を表示
      </button>
      <span className="spacer" />
      <button
        id={TOGGLE.right}
        className={`small${right ? " active" : ""}`}
        aria-controls="inspectorPanel"
        aria-expanded={right}
        onClick={() => toggle("right", right)}
      >
        構造の詳細
      </button>
    </div>
  );
}

/** Drag or arrow-key handle for a sidebar's width. */
function Resizer({ side, hidden }: { side: Side; hidden: boolean }) {
  const { state, dispatch } = useAtlas();
  const [min, max] = SIDEBAR_LIMITS[side];
  const width = side === "left" ? state.sidebars.leftWidth : state.sidebars.rightWidth;
  const sign = side === "left" ? 1 : -1;
  const drag = useRef<{ x: number; width: number } | null>(null);
  const resize = (value: number) => dispatch({ type: "sidebarWidth", side, width: value });
  return (
    <div
      id={`${side}Resize`}
      className="sidebarresize"
      role="separator"
      tabIndex={0}
      aria-label={side === "left" ? "分類サイドバーの幅" : "詳細サイドバーの幅"}
      aria-orientation="vertical"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={width}
      aria-controls={side === "left" ? "structureSidebar" : "inspectorPanel"}
      hidden={hidden}
      onPointerDown={(ev: PointerEvent<HTMLDivElement>) => {
        if (ev.button !== 0) return;
        drag.current = { x: ev.clientX, width };
        ev.currentTarget.setPointerCapture(ev.pointerId);
        ev.preventDefault();
      }}
      onPointerMove={(ev) => {
        if (drag.current) resize(drag.current.width + sign * (ev.clientX - drag.current.x));
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
      onLostPointerCapture={() => (drag.current = null)}
      onKeyDown={(ev: KeyboardEvent) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(ev.key)) return;
        ev.preventDefault();
        resize(
          ev.key === "Home"
            ? min
            : ev.key === "End"
              ? max
              : width + (ev.key === "ArrowRight" ? 20 : -20) * sign,
        );
      }}
    />
  );
}

export function Explore() {
  const { state, dispatch } = useAtlas();
  const narrow = useNarrow();
  const { left, right, leftWidth, rightWidth } = state.sidebars;
  const overlay = narrow && (left || right);
  const closeOverlays = () => {
    const toggle = right ? TOGGLE.right : TOGGLE.left;
    dispatch({ type: "closeSidebars" });
    focusSoon(toggle);
  };
  return (
    <section id="explore" className="tabpage" hidden={state.tab !== "explore"}>
      <WorkspaceTools />
      <div
        className="workspace"
        id="workspace"
        style={
          {
            "--sidebar-width": `${leftWidth}px`,
            "--inspector-width": `${rightWidth}px`,
          } as CSSProperties
        }
      >
        <button
          id="sidebarBackdrop"
          className="sidebarbackdrop"
          aria-label="サイドバーを閉じる"
          hidden={!overlay}
          onClick={closeOverlays}
        />
        <Sidebar hidden={!left} />
        <Resizer side="left" hidden={!left || narrow} />
        <GraphPanel inert={overlay} />
        <Resizer side="right" hidden={!right || narrow} />
        <section id="inspectorPanel" className="inspectorpanel" hidden={!right}>
          <div className="inspectorbar">
            <span>構造・関係の詳細</span>
            <button
              id="closeInspector"
              className="small flat"
              aria-label="詳細を閉じる"
              onClick={() => {
                dispatch({ type: "sidebar", side: "right", open: false });
                focusSoon(TOGGLE.right);
              }}
            >
              閉じる ×
            </button>
          </div>
          <Inspector />
        </section>
      </div>
      <CompareTray />
    </section>
  );
}
