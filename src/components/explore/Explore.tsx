import { useEffect } from "react";
import { useAtlas } from "../../store.ts";
import { CompareTray } from "./CompareTray.tsx";
import { GraphPanel } from "./GraphPanel.tsx";
import { Inspector } from "./Inspector.tsx";
import { Sidebar } from "./Sidebar.tsx";

export function Explore() {
  const { state, dispatch } = useAtlas();
  const { left, right } = state.panels;

  // [ and ] toggle the side panels while exploring (not while typing or in a dialog).
  useEffect(() => {
    if (state.tab !== "explore" || state.modal) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
      if ((ev.target as Element | null)?.closest?.("input,select,textarea,[contenteditable]"))
        return;
      if (ev.key === "[") dispatch({ type: "panel", side: "left", open: !left });
      else if (ev.key === "]") dispatch({ type: "panel", side: "right", open: !right });
      else return;
      ev.preventDefault();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [state.tab, state.modal, left, right, dispatch]);

  return (
    <section id="explore" className="tabpage" hidden={state.tab !== "explore"}>
      <div className={`workspace${left ? "" : " hide-left"}${right ? "" : " hide-right"}`}>
        <Sidebar />
        <GraphPanel />
        <Inspector />
      </div>
      <CompareTray />
    </section>
  );
}
