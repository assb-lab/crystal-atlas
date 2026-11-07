/** Application state and its transitions. Pure (no DOM), so every interaction rule is unit-testable. */
import { DATA } from "./data/atlas.ts";
import { LABPRESETS, OCCPRESETS } from "./data/presets.ts";
import { ALL, hasStrictRelation, N, node } from "./lib/graph.ts";

export type Tab = "explore" | "lab" | "guide";
export type View = "map" | "list";
export type Side = "left" | "right";
export type Modal = { kind: "compare" } | { kind: "routes" } | null;

export interface State {
  tab: Tab;
  /** Family id, or "all" for the overview. */
  family: string;
  selected: string;
  /** Selected relation (inspector shows it instead of the structure). */
  edge: string | null;
  /** Selected cross-family bundle key, e.g. "fcc|fluorite". */
  bundle: string | null;
  strict: boolean;
  view: View;
  /** Up to two structures queued for side-by-side comparison. */
  comp: string[];
  panels: Record<Side, boolean>;
  modal: Modal;
  lab: string;
  subVisible: boolean[];
  t: number;
  o: number;
  occPreset: string | null;
  toast: { msg: string; seq: number } | null;
  /** Bumped whenever the map should re-fit its camera. */
  fitSeq: number;
  /** Source and printed page the guide should reveal. */
  sourceFocus: { id: string; page: number; seq: number } | null;
  /** Object URLs of PDFs the reader associated locally, per source id. */
  pdfs: Record<string, string>;
}

export const COMPARE_MAX = 2;

export function initialState(panels: Record<Side, boolean> = { left: true, right: true }): State {
  return {
    tab: "explore",
    family: "fcc",
    selected: "fcc",
    edge: null,
    bundle: null,
    strict: false,
    view: "map",
    comp: [],
    panels,
    modal: null,
    lab: "heusler",
    subVisible: [true, true, true, true],
    t: 0.125,
    o: 0.5,
    occPreset: "spinel",
    toast: null,
    fitSeq: 0,
    sourceFocus: null,
    pdfs: {},
  };
}

export type Action =
  | { type: "tab"; tab: Tab }
  | { type: "family"; id: string }
  | { type: "selectNode"; id: string; jump?: boolean }
  | { type: "selectEdge"; id: string }
  | { type: "selectBundle"; key: string }
  | { type: "strict"; on: boolean }
  | { type: "view"; view: View }
  | { type: "toggleCompare"; id: string }
  | { type: "clearCompare" }
  | { type: "comparePair"; a: string; b: string }
  | { type: "modal"; modal: Modal }
  | { type: "pathNode"; id: string }
  | { type: "panel"; side: Side; open: boolean }
  | { type: "lab"; id: string; open?: boolean }
  | { type: "sub"; index: number; on: boolean }
  | { type: "occPreset"; key: string }
  | { type: "occ"; t: number; o: number }
  | { type: "toast"; msg: string }
  | { type: "toastHide" }
  | { type: "source"; id: string; page: number }
  | { type: "pdf"; id: string; url: string };

const toast = (s: State, msg: string): State["toast"] => ({ msg, seq: (s.toast?.seq ?? 0) + 1 });
const revealInspector = (s: State): State["panels"] => ({ ...s.panels, right: true });

export function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "tab":
      return { ...s, tab: a.tab, fitSeq: a.tab === "explore" ? s.fitSeq + 1 : s.fitSeq };

    case "family": {
      const members = DATA.nodes.filter((n) => a.id === ALL || n.family === a.id);
      const selected = members.some((n) => n.id === s.selected)
        ? s.selected
        : (members.find((n) => n.id === a.id)?.id ?? members[0]?.id ?? s.selected);
      return { ...s, family: a.id, selected, edge: null, bundle: null, fitSeq: s.fitSeq + 1 };
    }

    case "selectNode": {
      if (!N.has(a.id)) return s;
      let next: State = {
        ...s,
        selected: a.id,
        edge: null,
        bundle: null,
        panels: revealInspector(s),
      };
      if (s.strict && !hasStrictRelation(a.id))
        next = {
          ...next,
          strict: false,
          toast: toast(s, "この構造の関係を表示するため、絞り込みを解除しました。"),
        };
      const home = node(a.id).family;
      if ((a.jump ?? true) && s.family !== ALL && home !== s.family)
        next = { ...next, family: home, fitSeq: next.fitSeq + 1 };
      if (s.tab !== "explore") next = { ...next, tab: "explore", fitSeq: next.fitSeq + 1 };
      return next;
    }

    case "selectEdge":
      return { ...s, edge: a.id, bundle: null, panels: revealInspector(s) };

    case "selectBundle":
      return { ...s, bundle: a.key, edge: null, panels: revealInspector(s) };

    case "strict":
      return { ...s, strict: a.on, edge: null, bundle: null, fitSeq: s.fitSeq + 1 };

    case "view":
      return { ...s, view: a.view, fitSeq: a.view === "map" ? s.fitSeq + 1 : s.fitSeq };

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
      return {
        ...s,
        modal: null,
        strict: false,
        tab: "explore",
        family: node(a.id).family,
        selected: a.id,
        edge: null,
        bundle: null,
        panels: revealInspector(s),
        fitSeq: s.fitSeq + 1,
      };
    }

    case "panel":
      return { ...s, panels: { ...s.panels, [a.side]: a.open } };

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
        sourceFocus: { id: a.id, page: a.page, seq: (s.sourceFocus?.seq ?? 0) + 1 },
      };

    case "pdf":
      return { ...s, pdfs: { ...s.pdfs, [a.id]: a.url } };
  }
}
