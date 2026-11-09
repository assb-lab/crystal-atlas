import type { RecordReference } from "./knowledge/navigation.ts";
/** Application state and its transitions. Pure (no DOM), so every interaction rule is unit-testable. */
import { DATA } from "./data/atlas.ts";
import type { AtlasMode } from "./knowledge/schema.ts";
import { LABPRESETS, OCCPRESETS } from "./data/presets.ts";
import {
  ALL,
  edge,
  findCollection,
  findFlow,
  hasStrictRelation,
  N,
  node,
  scopeGraph,
} from "./lib/atlas.ts";

export type Tab = "explore" | "lab" | "guide";
export type View = "map" | "list";
export type Side = "left" | "right";
export type Modal = { kind: "compare" } | { kind: "routes" } | null;

export interface Exploration {
  /** "overview": the whole scope; "focus": the anchor's ancestors, descendants and comparisons. */
  mode: "overview" | "focus";
  anchor: string;
  /** Structures whose exclusively-reachable descendants are folded away. */
  collapsed: string[];
  /** Previous focus anchors, for "← 戻る". */
  history: string[];
}

export interface Sidebars {
  left: boolean;
  right: boolean;
  leftWidth: number;
  rightWidth: number;
}

export const SIDEBAR_LIMITS: Record<Side, [number, number]> = {
  left: [170, 320],
  right: [280, 480],
};
/** At or below this width the sidebars become dismissible overlays, one at a time. */
export const NARROW = 900;

export interface State {
  tab: Tab;
  atlasMode: AtlasMode;
  knowledgeAssertion: string | null;
  knowledgeTarget: { mode: AtlasMode; id: string; assertionId?: string; seq: number } | null;
  recordReference: RecordReference | null;
  /** Family id, or "all". Ignored while a flow or classification is open. */
  family: string;
  /** Source derivation flow id. */
  flow: string | null;
  /** Classification (collection) id. */
  collection: string | null;
  selected: string;
  /** Selected relation (the inspector shows it instead of the structure). */
  edge: string | null;
  strict: boolean;
  view: View;
  exploration: Exploration;
  sidebars: Sidebars;
  /** Up to two structures queued for side-by-side comparison. */
  comp: string[];
  modal: Modal;
  searchOpen: boolean;
  lab: string;
  subVisible: boolean[];
  t: number;
  o: number;
  occPreset: string | null;
  toast: { msg: string; seq: number } | null;
  /** Bumped when the map should move its camera to the selection ("選択位置へ"). */
  mapSeq: number;
  /** Citation the guide should reveal. */
  sourceFocus: { id: string; page: number | null; pdfPage: number; seq: number } | null;
  /** Object URLs of PDFs the reader associated locally, per source id. */
  pdfs: Record<string, string>;
}

export const COMPARE_MAX = 2;

export function initialState(sidebars: Partial<Sidebars> = {}): State {
  return {
    tab: "explore",
    atlasMode: "derivation",
    knowledgeAssertion: null,
    knowledgeTarget: null,
    recordReference: null,
    family: "fcc",
    flow: null,
    collection: null,
    selected: "fcc",
    edge: null,
    strict: false,
    view: "map",
    exploration: { mode: "overview", anchor: "fcc", collapsed: [], history: [] },
    sidebars: { left: true, right: false, leftWidth: 205, rightWidth: 320, ...sidebars },
    comp: [],
    modal: null,
    searchOpen: false,
    lab: "heusler",
    subVisible: [true, true, true, true],
    t: 0.125,
    o: 0.5,
    occPreset: "spinel",
    toast: null,
    mapSeq: 0,
    sourceFocus: null,
    pdfs: {},
  };
}

export type Action =
  | { type: "atlasMode"; mode: AtlasMode; assertionId?: string; focusId?: string }
  | { type: "recordReference"; reference: RecordReference | null }
  | { type: "tab"; tab: Tab }
  | { type: "family"; id: string }
  | { type: "classification"; id: string }
  | { type: "flow"; id: string }
  | { type: "selectNode"; id: string; jump?: boolean; narrow?: boolean }
  | { type: "selectEdge"; id: string; narrow?: boolean }
  | { type: "strict"; on: boolean }
  | { type: "view"; view: View }
  | { type: "overview" }
  | { type: "focusSelection" }
  | { type: "fold" }
  | { type: "unfoldAll" }
  | { type: "openGroup"; key: string }
  | { type: "back" }
  | { type: "readMap" }
  | { type: "sidebar"; side: Side; open: boolean; narrow?: boolean }
  | { type: "sidebarWidth"; side: Side; width: number }
  | { type: "closeSidebars" }
  | { type: "toggleCompare"; id: string }
  | { type: "clearCompare" }
  | { type: "comparePair"; a: string; b: string }
  | { type: "modal"; modal: Modal }
  | { type: "pathNode"; id: string; narrow?: boolean }
  | { type: "searchOpen"; open: boolean }
  | { type: "searchPick"; id: string; narrow?: boolean }
  | { type: "lab"; id: string; open?: boolean }
  | { type: "sub"; index: number; on: boolean }
  | { type: "occPreset"; key: string }
  | { type: "occ"; t: number; o: number }
  | { type: "toast"; msg: string }
  | { type: "toastHide" }
  | { type: "source"; id: string; page: number | null; pdfPage: number }
  | { type: "pdf"; id: string; url: string };

const toast = (s: State, msg: string): State["toast"] => ({ msg, seq: (s.toast?.seq ?? 0) + 1 });
const moveMap = (s: State): State => ({ ...s, mapSeq: s.mapSeq + 1 });

function resetExploration(s: State, mode: Exploration["mode"] = "overview"): State {
  return { ...s, exploration: { mode, anchor: s.selected, collapsed: [], history: [] } };
}

/** On narrow screens only one overlay sidebar is open at a time. */
function setSidebar(s: State, side: Side, open: boolean, narrow = false): State {
  const sidebars = { ...s.sidebars, [side]: open };
  if (open && narrow) sidebars[side === "left" ? "right" : "left"] = false;
  return { ...s, sidebars };
}

function openFamily(s: State, id: string): State {
  const members = DATA.nodes.filter((n) => id === ALL || n.family === id);
  const selected = members.some((n) => n.id === s.selected)
    ? s.selected
    : (members.find((n) => n.id === id)?.id ?? members[0]?.id ?? s.selected);
  return moveMap(
    resetExploration({ ...s, flow: null, collection: null, family: id, edge: null, selected }),
  );
}

function selectNode(s: State, id: string, jump = true, narrow = false): State {
  if (!N.has(id)) return s;
  let next: State = { ...s, selected: id, edge: null };
  if (s.strict && !hasStrictRelation(id))
    next = {
      ...next,
      strict: false,
      toast: toast(s, "この構造の関係を表示するため、絞り込みを解除しました。"),
    };
  if (jump) {
    const leaves =
      next.flow || next.collection
        ? !scopeGraph(next).nodes.some((n) => n.id === id)
        : next.family !== ALL && node(id).family !== next.family;
    if (leaves) next = { ...next, flow: null, collection: null, family: node(id).family };
    next = moveMap(resetExploration(next, next.exploration.mode));
  }
  if (next.tab !== "explore") next = moveMap({ ...next, tab: "explore" });
  return narrow ? setSidebar(next, "right", true, true) : next;
}

/** Keeps the focus anchor inside the current scope (the first structure otherwise). */
function normalizeAnchor(s: State): State {
  const nodes = scopeGraph(s).nodes;
  if (nodes.some((n) => n.id === s.exploration.anchor)) return s;
  const anchor = nodes[0]?.id;
  return anchor ? { ...s, exploration: { ...s.exploration, anchor } } : s;
}

function step(s: State, a: Action): State {
  switch (a.type) {
    case "atlasMode":
      return {
        ...s,
        tab: "explore",
        atlasMode: a.mode,
        knowledgeAssertion: a.assertionId ?? null,
        knowledgeTarget:
          a.focusId || a.assertionId
            ? {
                mode: a.mode,
                id: a.focusId ?? s.selected,
                ...(a.assertionId ? { assertionId: a.assertionId } : {}),
                seq: (s.knowledgeTarget?.seq ?? 0) + 1,
              }
            : s.knowledgeTarget,
      };
    case "recordReference":
      return { ...s, searchOpen: false, recordReference: a.reference };
    case "tab":
      return a.tab === "explore"
        ? moveMap({ ...s, tab: a.tab, atlasMode: "derivation", knowledgeAssertion: null })
        : { ...s, tab: a.tab };

    case "family":
      return openFamily(s, a.id);

    case "classification": {
      const c = findCollection(a.id);
      if (!c?.ids[0]) return openFamily(s, s.family);
      const next: State = {
        ...s,
        collection: c.id,
        flow: null,
        selected: c.ids[0],
        edge: null,
        strict: false,
      };
      return moveMap({ ...resetExploration(next), view: "map" });
    }

    case "flow": {
      const f = findFlow(a.id);
      if (!f?.edges[0]) return openFamily(s, s.family);
      const next: State = {
        ...s,
        flow: f.id,
        collection: null,
        selected: edge(f.edges[0]).a,
        edge: null,
        strict: false,
      };
      return moveMap({ ...resetExploration(next), view: "map" });
    }

    case "selectNode":
      return selectNode(s, a.id, a.jump ?? true, a.narrow);

    case "selectEdge":
      return setSidebar({ ...s, edge: a.id }, "right", true, a.narrow);

    case "strict":
      return moveMap({ ...s, strict: a.on, edge: null });

    case "view":
      return a.view === "map" ? moveMap({ ...s, view: a.view }) : { ...s, view: a.view };

    case "overview":
      return moveMap({ ...s, exploration: { ...s.exploration, mode: "overview", collapsed: [] } });

    case "focusSelection": {
      const { anchor, history } = s.exploration;
      return moveMap({
        ...s,
        edge: null,
        exploration: {
          mode: "focus",
          anchor: s.selected,
          collapsed: [],
          history: anchor !== s.selected ? [...history, anchor] : history,
        },
      });
    }

    case "fold": {
      const collapsed = [...new Set([...s.exploration.collapsed, s.selected])];
      return moveMap({ ...s, edge: null, exploration: { ...s.exploration, collapsed } });
    }

    case "unfoldAll":
      return moveMap({ ...s, exploration: { ...s.exploration, collapsed: [] } });

    case "openGroup":
      return moveMap({
        ...s,
        exploration: {
          ...s.exploration,
          collapsed: s.exploration.collapsed.filter((id) => id !== a.key),
        },
      });

    case "back": {
      const id = s.exploration.history.at(-1);
      if (!id) return s;
      return moveMap({
        ...s,
        selected: id,
        edge: null,
        exploration: {
          mode: "focus",
          anchor: id,
          collapsed: [],
          history: s.exploration.history.slice(0, -1),
        },
      });
    }

    case "readMap":
      return moveMap(s);

    case "sidebar":
      return setSidebar(s, a.side, a.open, a.narrow);

    case "sidebarWidth": {
      const [min, max] = SIDEBAR_LIMITS[a.side];
      const width = Math.max(min, Math.min(max, a.width));
      return {
        ...s,
        sidebars: { ...s.sidebars, [a.side === "left" ? "leftWidth" : "rightWidth"]: width },
      };
    }

    case "closeSidebars":
      return { ...s, sidebars: { ...s.sidebars, left: false, right: false } };

    case "toggleCompare":
      if (s.comp.includes(a.id)) return { ...s, comp: s.comp.filter((id) => id !== a.id) };
      if (s.comp.length >= COMPARE_MAX)
        return { ...s, toast: toast(s, "比較は２構造までです。トレイから一つ外してください。") };
      return { ...s, comp: [...s.comp, a.id] };

    case "clearCompare":
      return { ...s, comp: [] };

    case "comparePair":
      return { ...s, comp: [a.a, a.b], modal: { kind: "compare" } };

    case "modal":
      return { ...s, modal: a.modal };

    case "pathNode": {
      if (!N.has(a.id)) return s;
      const opened = openFamily(
        selectNode({ ...s, modal: null, strict: false }, a.id, true, a.narrow),
        node(a.id).family,
      );
      return selectNode(opened, a.id, false, a.narrow);
    }

    case "searchOpen":
      return { ...s, searchOpen: a.open };

    case "searchPick": {
      let next: State = { ...s, searchOpen: false, modal: null };
      if (next.family === ALL && !next.flow && !next.collection)
        next = openFamily(next, node(a.id).family);
      return selectNode(next, a.id, true, a.narrow);
    }

    case "lab": {
      const id = LABPRESETS.some((p) => p.id === a.id) ? a.id : s.lab;
      return { ...s, lab: id, subVisible: [true, true, true, true], tab: a.open ? "lab" : s.tab };
    }

    case "sub":
      return { ...s, subVisible: s.subVisible.map((v, i) => (i === a.index ? a.on : v)) };

    case "occPreset": {
      const p = OCCPRESETS[a.key];
      return p ? { ...s, occPreset: a.key, t: p.t, o: p.o } : s;
    }

    case "occ":
      return { ...s, t: a.t, o: a.o, occPreset: null };

    case "toast":
      return { ...s, toast: toast(s, a.msg) };

    case "toastHide":
      return { ...s, toast: null };

    case "source":
      return {
        ...s,
        modal: null,
        tab: "guide",
        sourceFocus: {
          id: a.id,
          page: a.page,
          pdfPage: a.pdfPage,
          seq: (s.sourceFocus?.seq ?? 0) + 1,
        },
      };

    case "pdf":
      return { ...s, pdfs: { ...s.pdfs, [a.id]: a.url } };
  }
}

export function reducer(s: State, a: Action): State {
  const next = step(s, a);
  return next === s ? s : normalizeAnchor(next);
}
