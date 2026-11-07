import { useEffect, useReducer, useRef } from "react";
import { DATA } from "./data/atlas.ts";
import { Explore } from "./components/explore/Explore.tsx";
import { Guide } from "./components/guide/Guide.tsx";
import { Lab } from "./components/lab/Lab.tsx";
import { ModalHost } from "./components/Modal.tsx";
import { Toast } from "./components/Toast.tsx";
import { Hero, Topbar } from "./components/Topbar.tsx";
import { visibleGraph } from "./lib/graph.ts";
import { initialState, reducer, type Side, type State } from "./state.ts";
import { AtlasContext } from "./store.ts";

declare global {
  interface Window {
    /** Read-only diagnostics used by the E2E test to validate the embedded dataset. */
    atlasDiagnostics?: () => Record<string, unknown>;
  }
}

const PANEL_KEY = "crystal-atlas:panels";

/** Collapsed side panels are a per-viewer convenience; storage may be unavailable. */
function loadPanels(): Record<Side, boolean> {
  try {
    const saved = JSON.parse(localStorage.getItem(PANEL_KEY) ?? "{}") as Partial<
      Record<Side, unknown>
    >;
    return { left: saved.left !== false, right: saved.right !== false };
  } catch {
    return { left: true, right: true };
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, () => initialState(loadPanels()));
  const latest = useRef<State>(state);

  useEffect(() => {
    latest.current = state;
  });

  useEffect(() => {
    document.body.dataset.page = state.tab;
  }, [state.tab]);

  useEffect(() => {
    try {
      localStorage.setItem(PANEL_KEY, JSON.stringify(state.panels));
    } catch {
      /* private mode or blocked storage */
    }
  }, [state.panels]);

  useEffect(() => {
    window.atlasDiagnostics = () => {
      const s = latest.current;
      const shown = visibleGraph(s.family, s.strict);
      return {
        nodes: DATA.nodes.length,
        edges: DATA.edges.length,
        strict: DATA.edges.filter((e) => e.strict).length,
        shownNodes: shown.nodes.length,
        shownEdges: shown.edges.length,
        selected: s.selected,
        family: s.family,
        tab: s.tab,
        models: DATA.nodes.filter((n) => n.model).length,
      };
    };
    return () => {
      delete window.atlasDiagnostics;
    };
  }, []);

  return (
    <AtlasContext value={{ state, dispatch }}>
      <Topbar />
      <Hero />
      <main>
        <Explore />
        <Lab />
        <Guide />
        <footer className="footer">
          <span>CURATED REFERENCE ATLAS · 2026.11 · v1.0</span>
          <span>データ・描画を内蔵 / オフラインで動作</span>
        </footer>
      </main>
      <ModalHost />
      <Toast />
    </AtlasContext>
  );
}
