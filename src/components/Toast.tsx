import { useEffect } from "react";
import { useAtlas } from "../store.ts";

export function Toast() {
  const { state, dispatch } = useAtlas();
  const seq = state.toast?.seq;
  useEffect(() => {
    if (seq === undefined) return;
    const timer = setTimeout(() => dispatch({ type: "toastHide" }), 3500);
    return () => clearTimeout(timer);
  }, [seq, dispatch]);
  return (
    <div id="toast" className="toast" role="status" hidden={!state.toast}>
      {state.toast?.msg}
    </div>
  );
}
