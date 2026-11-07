import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { ROUTES } from "../data/presets.ts";
import { DATA } from "../data/atlas.ts";
import { frac, shortestPath } from "../lib/format.ts";
import { node } from "../lib/graph.ts";
import { useAtlas } from "../store.ts";
import type { AtlasNode } from "../types.ts";
import { RefChips } from "./RefChips.tsx";

const FOCUSABLE = 'button,a,input,select,[tabindex="0"]';

/** Accessible dialog: Escape closes, Tab is trapped, focus returns to the opener. */
function Dialog({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const backdrop = useRef<HTMLDivElement>(null);
  const close = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    close.current?.focus();
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") onClose();
      if (ev.key !== "Tab" || !backdrop.current) return;
      const items = [...backdrop.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => !(el as HTMLButtonElement).disabled,
      );
      const first = items[0];
      const last = items.at(-1);
      if (ev.shiftKey && document.activeElement === first) {
        ev.preventDefault();
        last?.focus();
      } else if (!ev.shiftKey && document.activeElement === last) {
        ev.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      opener?.focus();
    };
  }, [onClose]);

  return (
    <div
      className="modalbackdrop"
      id="modalBackdrop"
      ref={backdrop}
      onClick={(ev) => {
        if (ev.target === ev.currentTarget) onClose();
      }}
    >
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
        <div className="modalheader">
          <h2 id="modalTitle">{title}</h2>
          <span className="spacer" />
          <button
            id="closeModal"
            ref={close}
            className="small flat"
            aria-label="閉じる"
            onClick={onClose}
          >
            閉じる ×
          </button>
        </div>
        <div className="modalbody" id="modalBody">
          {children}
        </div>
      </section>
    </div>
  );
}

export function ModalHost() {
  const { state, dispatch } = useAtlas();
  const onClose = useCallback(() => dispatch({ type: "modal", modal: null }), [dispatch]);
  if (state.modal?.kind === "compare") {
    const [a, b] = state.comp;
    if (!a || !b) return null;
    return (
      <Dialog title="構造を並べて比較" onClose={onClose}>
        <Compare a={node(a)} b={node(b)} />
      </Dialog>
    );
  }
  if (state.modal?.kind === "routes")
    return (
      <Dialog title="構造をたどる６つの学習ルート" onClose={onClose}>
        <Routes />
      </Dialog>
    );
  return null;
}

const ROWS: [string, keyof Pick<AtlasNode, "sg" | "packing" | "coord" | "link" | "desc">][] = [
  ["対称性", "sg"],
  ["骨格", "packing"],
  ["配位環境", "coord"],
  ["連結", "link"],
  ["要点", "desc"],
];

function PathButton({ id }: { id: string }) {
  const { dispatch } = useAtlas();
  return (
    <button data-pathnode={id} onClick={() => dispatch({ type: "pathNode", id })}>
      {node(id).name}
    </button>
  );
}

function Compare({ a, b }: { a: AtlasNode; b: AtlasNode }) {
  const { state } = useAtlas();
  const path = shortestPath(DATA.edges, a.id, b.id, state.strict);
  return (
    <>
      <table className="comparetable">
        <tbody>
          <tr>
            <th>構造</th>
            {[a, b].map((n) => (
              <td key={n.id}>
                <div className="comptitle">{n.name}</div>
                <div className="mono muted">{n.formula}</div>
              </td>
            ))}
          </tr>
          {ROWS.map(([label, key]) => (
            <tr key={key}>
              <th>{label}</th>
              <td>{a[key]}</td>
              <td>{b[key]}</td>
            </tr>
          ))}
          <tr>
            <th>
              T / O孔
              <br />
              占有率
            </th>
            {[a, b].map((n) => (
              <td key={n.id}>
                {n.occ ? (
                  <>
                    <b className="mono">{n.occ.map(frac).join(" / ")}</b>
                    <br />
                    <span className="muted">基準：{n.host}</span>
                  </>
                ) : (
                  "この記述では未設定"
                )}
              </td>
            ))}
          </tr>
          <tr>
            <th>出典</th>
            {[a, b].map((n) => (
              <td key={n.id}>
                <RefChips refs={n.refs} />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      <div style={{ marginTop: 22 }}>
        <h3>地図上の接続経路 {state.strict && <span className="badge">群–部分群のみ</span>}</h3>
        <div className="pathsteps">
          {path
            ? path.map((id, i) => (
                <span key={id} style={{ display: "contents" }}>
                  {i > 0 && <span className="arrow">—</span>}
                  <PathButton id={id} />
                </span>
              ))
            : "このデータと絞り込み条件では接続経路がありません。"}
        </div>
        <p className="note">
          関係の向きを問わず、このアトラス内の最短接続列を探しています。相転移経路、共通のaristotype、実際の原子移動を示すものではありません。
        </p>
      </div>
    </>
  );
}

function Routes() {
  const { dispatch } = useAtlas();
  return (
    <>
      <p className="muted smalltext" style={{ marginBottom: 17 }}>
        各構造名からカードへ移動します。学習の順番であって、連続した相転移の順番ではありません。
      </p>
      <div className="routecards">
        {ROUTES.map((r) => (
          <div className="routecard" key={r.title}>
            <h3>{r.title}</h3>
            <p>{r.desc}</p>
            <div className="row">
              {r.ids.map((id) => (
                <button
                  key={id}
                  data-pathnode={id}
                  onClick={() => dispatch({ type: "pathNode", id })}
                >
                  {node(id).name} ↗
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
