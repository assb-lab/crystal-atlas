/** React access to the atlas state; the transitions themselves live in state.ts. */
import { createContext, use, useCallback, type Dispatch } from "react";
import { DATA } from "./data/atlas.ts";
import type { Action, State } from "./state.ts";

export const AtlasContext = createContext<{ state: State; dispatch: Dispatch<Action> } | null>(
  null,
);

export function useAtlas() {
  const value = use(AtlasContext);
  if (!value) throw new Error("useAtlas must be used inside <AtlasContext>");
  return value;
}

const MOBILE = "(max-width: 700px)";

/** Selects a structure; on phones the inspector sits below the map, so scroll to it. */
export function useSelectNode() {
  const { dispatch } = useAtlas();
  return useCallback(
    (id: string, jump = true) => {
      dispatch({ type: "selectNode", id, jump });
      if (matchMedia(MOBILE).matches)
        requestAnimationFrame(() =>
          document
            .getElementById("inspector")
            ?.scrollIntoView({ behavior: "smooth", block: "start" }),
        );
    },
    [dispatch],
  );
}

/** Opens a cited page: the public or locally associated PDF, otherwise the source entry in the guide. */
export function useOpenSource() {
  const { state, dispatch } = useAtlas();
  return useCallback(
    (id: string, page: number) => {
      const src = DATA.sources[id];
      if (!src) return;
      const url = state.pdfs[id] ?? src.url;
      if (url) window.open(`${url.split("#")[0]}#page=${page + src.offset}`, "_blank", "noopener");
      else dispatch({ type: "source", id, page });
    },
    [state.pdfs, dispatch],
  );
}

export const prefersReducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
