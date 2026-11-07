import { useCallback, useEffect, useMemo, useRef, type ReactNode } from "react";
import { DATA } from "../data/atlas.ts";
import { KINDS, ROUTES } from "../data/presets.ts";
import { node } from "../lib/atlas.ts";
import { frac, shortestPath } from "../lib/format.ts";
import { defaultCamera, modelFor, type CrystalView } from "../lib/viewer.ts";
import { isNarrow, useAtlas } from "../store.ts";
import type { AtlasNode } from "../types.ts";
import { ModelPanel } from "./ModelPanel.tsx";
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
  const { state } = useAtlas();
  const searchOpen = useRef(state.searchOpen);

  useEffect(() => {
    searchOpen.current = state.searchOpen;
  });

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    close.current?.focus();
    const onKey = (ev: KeyboardEvent) => {
      if (searchOpen.current) return;
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
      <Dialog title={`構造をたどる${ROUTES.length}の学習ルート`} onClose={onClose}>
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

function PathButton({ id, children }: { id: string; children: ReactNode }) {
  const { dispatch } = useAtlas();
  return (
    <button
      data-pathnode={id}
      onClick={() => dispatch({ type: "pathNode", id, narrow: isNarrow() })}
    >
      {children}
    </button>
  );
}

function Compare({ a, b }: { a: AtlasNode; b: AtlasNode }) {
  const { state } = useAtlas();
  const pair = [a, b];
  const models = useMemo(() => [a, b].map((n) => modelFor(n.model ?? n.id)), [a, b]);
  // One camera object shared by both views keeps rotation and zoom in sync.
  const camera = useMemo(() => defaultCamera(), []);
  const views = useRef<(CrystalView | null)[]>([null, null]);
  const redrawPeer = useCallback((changed: CrystalView) => {
    for (const view of views.current) if (view && view !== changed) view.draw();
  }, []);
  const path = shortestPath(DATA.edges, a.id, b.id, state.strict);
  const direct = DATA.edges.filter(
    (e) =>
      ((e.a === a.id && e.b === b.id) || (e.a === b.id && e.b === a.id)) &&
      (!state.strict || e.strict),
  );
  return (
    <>
      <div className="comparisoncontrols">
        <div>
          <h3>単位胞を比較</h3>
          <p className="muted smalltext">
            回転・ズームを同期。表示倍率とサイトの色は単位胞ごとに設定しています。
          </p>
        </div>
        <button className="small" id="compareReset" onClick={() => views.current[0]?.reset()}>
          視点を戻す
        </button>
      </div>
      <div className="comparisonmodels">
        {pair.map((n, i) => (
          <ModelPanel
            key={n.id}
            node={n}
            model={models[i]!}
            comparison
            camera={camera}
            onCameraChange={redrawPeer}
            onView={(view) => {
              views.current[i] = view;
            }}
          />
        ))}
      </div>
      <table className="comparetable">
        <tbody>
          <tr>
            <th scope="row">構造</th>
            {pair.map((n) => (
              <td key={n.id}>
                <div className="comptitle">{n.name}</div>
                <div className="mono muted">{n.formula}</div>
              </td>
            ))}
          </tr>
          {ROWS.map(([label, key]) => (
            <tr key={key}>
              <th scope="row">{label}</th>
              <td>{a[key]}</td>
              <td>{b[key]}</td>
            </tr>
          ))}
          <tr>
            <th scope="row">
              T / O孔
              <br />
              占有率
            </th>
            {pair.map((n) => (
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
            <th scope="row">出典</th>
            {pair.map((n) => (
              <td key={n.id}>
                <RefChips refs={n.refs} />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      {direct.length > 0 && (
        <section className="comparisonrelations">
          <h3>直接の関係</h3>
          {direct.map((e) => (
            <article key={e.id}>
              <span className="badge">{KINDS[e.kind].name}</span>
              <h4>
                {node(e.a).name} {e.undirected ? "↔" : "→"} {node(e.b).name}
              </h4>
              <p>{e.desc}</p>
              {e.strict && (
                <p className="smalltext muted">
                  {e.index} · {e.split}
                </p>
              )}
              <RefChips refs={e.refs} />
            </article>
          ))}
        </section>
      )}
      <section className="comparisonrelations">
        <h3>地図上の接続経路 {state.strict && <span className="badge">群–部分群のみ</span>}</h3>
        <div className="pathsteps">
          {path
            ? path.map((id, i) => (
                <span key={id} style={{ display: "contents" }}>
                  {i > 0 && <span className="arrow">—</span>}
                  <PathButton id={id}>{node(id).name}</PathButton>
                </span>
              ))
            : "このデータと絞り込み条件では接続経路がありません。"}
        </div>
        <p className="note">
          接続列は矢印の向きを問わない地図上の最短経路です。各関係の結晶学的な意味は、矢印の詳細に記載しています。
        </p>
      </section>
    </>
  );
}

function Routes() {
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
                <PathButton key={id} id={id}>
                  {node(id).name} ↗
                </PathButton>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
