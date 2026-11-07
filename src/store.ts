/** React access to the atlas state; the transitions themselves live in state.ts. */
import { createContext, use, useCallback, useSyncExternalStore, type Dispatch } from "react";
import { DATA } from "./data/atlas.ts";
import { sourcePdfPage } from "./lib/format.ts";
import { NARROW, type Action, type State } from "./state.ts";
import type { Ref } from "./types.ts";

export const AtlasContext = createContext<{ state: State; dispatch: Dispatch<Action> } | null>(
  null,
);

export function useAtlas() {
  const value = use(AtlasContext);
  if (!value) throw new Error("useAtlas must be used inside <AtlasContext>");
  return value;
}

export const isNarrow = () => window.innerWidth <= NARROW;

const narrowQuery = () => matchMedia(`(max-width: ${NARROW}px)`);

/** True while sidebars are overlays (≤ 900 px). */
export function useNarrow() {
  return useSyncExternalStore(
    (notify) => {
      const query = narrowQuery();
      query.addEventListener("change", notify);
      return () => query.removeEventListener("change", notify);
    },
    () => narrowQuery().matches,
  );
}

/** Selects a structure; on narrow screens the detail overlay opens too. */
export function useSelectNode() {
  const { dispatch } = useAtlas();
  return useCallback(
    (id: string, jump = true) => dispatch({ type: "selectNode", id, jump, narrow: isNarrow() }),
    [dispatch],
  );
}

/** Opens a cited page: the public or locally associated PDF, otherwise the source entry in the guide. */
export function useOpenSource() {
  const { state, dispatch } = useAtlas();
  return useCallback(
    (ref: Ref) => {
      const source = DATA.sources[ref.s];
      if (!source || ref.p === undefined) return;
      const pdfPage = sourcePdfPage(source, ref);
      const url = state.pdfs[ref.s] ?? source.url;
      if (url) window.open(`${url.split("#")[0]}#page=${pdfPage}`, "_blank", "noopener");
      else dispatch({ type: "source", id: ref.s, page: ref.p, pdfPage });
    },
    [state.pdfs, dispatch],
  );
}

export const prefersReducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Focus an element after React has committed the current update. */
export const focusSoon = (id: string) =>
  requestAnimationFrame(() => document.getElementById(id)?.focus());
