import { COMPARE_MAX } from "../../state.ts";
import { node } from "../../lib/atlas.ts";
import { useAtlas } from "../../store.ts";

export function CompareTray() {
  const { state, dispatch } = useAtlas();
  return (
    <div className="comparetray" id="compareTray" hidden={!state.comp.length}>
      <span>比較する構造</span>
      <div className="trayitems" id="trayItems">
        {state.comp.map((id, i) => (
          <span className="pill" key={id}>
            {i + 1} {node(id).name}
            <button
              data-compare={id}
              aria-label="比較から外す"
              onClick={() => dispatch({ type: "toggleCompare", id })}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <button
        className="small primary"
        id="compareOpen"
        disabled={state.comp.length !== COMPARE_MAX}
        onClick={() => dispatch({ type: "modal", modal: { kind: "compare" } })}
      >
        比較を開く
      </button>
      <button
        className="small flat"
        id="compareClear"
        onClick={() => dispatch({ type: "clearCompare" })}
      >
        クリア
      </button>
    </div>
  );
}
