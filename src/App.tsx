import { RecordInspector } from "./components/RecordInspector.tsx";
import { parseReference, referenceHash } from "./knowledge/navigation.ts";
import { useEffect, useReducer, useRef } from "react";
import { Explore } from "./components/explore/Explore.tsx";
import { GlobalSearch } from "./components/GlobalSearch.tsx";
import { Guide } from "./components/guide/Guide.tsx";
import { Lab } from "./components/lab/Lab.tsx";
import { ModalHost } from "./components/Modal.tsx";
import { Toast } from "./components/Toast.tsx";
import { Hero, Topbar } from "./components/Topbar.tsx";
import { DATA } from "./data/atlas.ts";
import { derivationGraph } from "./lib/flow-layout.ts";
import { hasModel, scopeGraph } from "./lib/atlas.ts";
import {
  initialState,
  NARROW,
  reducer,
  SIDEBAR_LIMITS,
  type Sidebars,
  type State,
} from "./state.ts";
import { AtlasContext, isNarrow } from "./store.ts";

declare global {
  interface Window {
    /** Read-only diagnostics used by the E2E test to validate the embedded dataset. */
    atlasDiagnostics?: () => Record<string, unknown>;
  }
}

const WORKSPACE_KEY = "atlas-workspace";

/** Sidebar widths always restore; open/closed only on wide screens. Storage is optional (file://, private mode). */
function loadSidebars(): Partial<Sidebars> {
  const wide = window.innerWidth > NARROW;
  const result: Partial<Sidebars> = { left: wide, right: false };
  try {
    const saved = JSON.parse(localStorage.getItem(WORKSPACE_KEY) ?? "{}") as Record<
      string,
      unknown
    >;
    for (const [key, [min, max]] of [
      ["leftWidth", SIDEBAR_LIMITS.left],
      ["rightWidth", SIDEBAR_LIMITS.right],
    ] as const) {
      const value = saved[key];
      if (typeof value === "number" && Number.isFinite(value))
        result[key] = Math.max(min, Math.min(max, value));
    }
    if (wide)
      for (const side of ["left", "right"] as const)
        if (typeof saved[side] === "boolean") result[side] = saved[side];
  } catch {
    /* Optional preference. */
  }
  return result;
}

function diagnostics(s: State) {
  const scope = scopeGraph(s);
  const { mode, anchor, collapsed } = s.exploration;
  const view = derivationGraph(
    scope.nodes,
    scope.edges,
    mode === "focus" ? anchor : null,
    new Set(collapsed),
  );
  return {
    nodes: DATA.nodes.length,
    edges: DATA.edges.length,
    strict: DATA.edges.filter((e) => e.strict).length,
    shownNodes: view.nodes.length,
    shownEdges: view.edges.length,
    collection: s.collection,
    selected: s.selected,
    exploration: mode,
    anchor,
    groups: view.groups.length,
    family: s.family,
    tab: s.tab,
    models: DATA.nodes.filter(hasModel).length,
  };
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    ...initialState(loadSidebars()),
    recordReference: parseReference(location.hash),
  }));
  const latest = useRef(state);

  useEffect(() => {
    latest.current = state;
  });

  useEffect(() => {
    try {
      localStorage.setItem(WORKSPACE_KEY, JSON.stringify(state.sidebars));
    } catch {
      /* Optional preference. */
    }
  }, [state.sidebars]);

  useEffect(() => {
    const onHash = () => {
      if (location.hash.startsWith("#atlas?"))
        dispatch({ type: "recordReference", reference: parseReference(location.hash) });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => {
    if (state.recordReference) history.replaceState(null, "", referenceHash(state.recordReference));
    else if (state.knowledgeTarget)
      history.replaceState(
        null,
        "",
        referenceHash({
          kind: state.knowledgeTarget.assertionId ? "assertion" : "entity",
          id: state.knowledgeTarget.assertionId ?? state.knowledgeTarget.id,
          mode: state.knowledgeTarget.mode,
        }),
      );
  }, [state.recordReference, state.knowledgeTarget]);

  // Crossing into the narrow layout closes both overlays; any resize re-centres the map.
  useEffect(() => {
    let wasNarrow = isNarrow();
    const onResize = () => {
      const narrow = isNarrow();
      if (narrow !== wasNarrow) {
        if (narrow) dispatch({ type: "closeSidebars" });
        wasNarrow = narrow;
      }
      requestAnimationFrame(() => dispatch({ type: "readMap" }));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ⌘K / Ctrl+K opens the global search from every tab; Escape closes narrow overlays.
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (
        (ev.metaKey || ev.ctrlKey) &&
        !ev.altKey &&
        !ev.shiftKey &&
        ev.key.toLowerCase() === "k"
      ) {
        ev.preventDefault();
        if (latest.current.searchOpen) {
          const query = document.getElementById("globalQuery") as HTMLInputElement | null;
          query?.focus();
          query?.select();
        } else dispatch({ type: "searchOpen", open: true });
        return;
      }
      const s = latest.current;
      if (
        ev.key === "Escape" &&
        isNarrow() &&
        !s.searchOpen &&
        !s.modal &&
        (s.sidebars.left || s.sidebars.right)
      )
        dispatch({ type: "closeSidebars" });
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    window.atlasDiagnostics = () => diagnostics(latest.current);
    return () => {
      delete window.atlasDiagnostics;
    };
  }, []);

  return (
    <AtlasContext value={{ state, dispatch }}>
      <Topbar />
      <Hero />
      <main>
        <RecordInspector />
        <Explore />
        <Lab />
        <Guide />
        <footer className="footer">
          <span>CURATED REFERENCE ATLAS · 2026.11 · v{DATA.version}</span>
          <span>データ・描画を内蔵 / オフラインで動作</span>
        </footer>
      </main>
      <GlobalSearch />
      <ModalHost />
      <Toast />
    </AtlasContext>
  );
}
