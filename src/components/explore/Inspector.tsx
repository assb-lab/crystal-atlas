import { Fragment, useEffect, useMemo, useRef } from "react";
import { DATA } from "../../data/atlas.ts";
import { KINDS, LABPRESETS } from "../../data/presets.ts";
import { arrowFrom, edge as edgeOf, familyOf, node, relationsOf } from "../../lib/atlas.ts";
import { frac } from "../../lib/format.ts";
import { modelFor } from "../../lib/viewer.ts";
import { isNarrow, useAtlas, useSelectNode } from "../../store.ts";
import type { AtlasEdge, AtlasNode } from "../../types.ts";
import { ModelPanel } from "../ModelPanel.tsx";
import { RefChips } from "../RefChips.tsx";

export function Inspector() {
  const { state } = useAtlas();
  const box = useRef<HTMLElement>(null);

  useEffect(() => {
    if (state.edge && box.current) box.current.scrollTop = 0;
  }, [state.edge]);

  return (
    <aside
      className="inspector"
      id="inspector"
      ref={box}
      aria-label="選択した構造の詳細"
      aria-live="polite"
    >
      {state.edge ? <EdgeDetail e={edgeOf(state.edge)} /> : <NodeDetail n={node(state.selected)} />}
    </aside>
  );
}

function Fact({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="fact">
      <div className="key">{label}</div>
      <div className={`value${mono ? " mono" : ""}`}>{value}</div>
    </div>
  );
}

/** Classification labels (Glazer system, stacking type, …) with their citations. */
function ClassificationFacts({ id }: { id: string }) {
  const labels = DATA.structureLabels[id];
  if (!labels?.length) return null;
  return (
    <div className="classificationfacts">
      {labels.map((label, i) => (
        <Fragment key={i}>
          <p>
            <strong>{label.key}</strong>　{label.value}
          </p>
          {label.detail && <p className="smalltext muted">{label.detail}</p>}
          <RefChips refs={label.refs} />
        </Fragment>
      ))}
    </div>
  );
}

function NodeDetail({ n }: { n: AtlasNode }) {
  const { state, dispatch } = useAtlas();
  const f = familyOf(n.family);
  const relations = relationsOf(n.id, state.strict);
  const model = useMemo(() => modelFor(n.model ?? n.id), [n]);
  return (
    <>
      <div className="inspecthead">
        <div className="row">
          <button
            className="small flat mobilenavnote"
            onClick={() => dispatch({ type: "sidebar", side: "right", open: false })}
          >
            地図へ ↑
          </button>
          <span className="eyebrow" style={{ color: f.color }}>
            {f.short} / STRUCTURE
          </span>
          <span className="spacer" />
          <button
            className="small flat"
            data-compare={n.id}
            onClick={() => dispatch({ type: "toggleCompare", id: n.id })}
          >
            {state.comp.includes(n.id) ? "比較から外す" : "＋ 比較"}
          </button>
        </div>
        <h2>{n.name}</h2>
        <div className="formula">{n.formula}</div>
      </div>
      <div className="inspectbody">
        <p className="desc">{n.desc}</p>
        <ClassificationFacts id={n.id} />
        {model.atoms.length > 0 && <ModelPanel key={n.id} node={n} model={model} />}
        <div className="detailsection">
          <h3>構造を記述する</h3>
          <div className="facts">
            <Fact label="空間群・対称性" value={n.sg} mono />
            <Fact label="基準となる骨格" value={n.packing} />
            <Fact label="配位環境" value={n.coord} />
            <Fact label="多面体・部分構造の連結" value={n.link} />
          </div>
        </div>
        {n.occ && (
          <div className="detailsection">
            <h3>全空隙を分母にした占有率</h3>
            <div className="occgrid">
              {n.occ.map((o, i) => (
                <div className="occrow" key={i}>
                  <span>{i ? "O" : "T"}孔</span>
                  <div className="occbar">
                    <i style={{ width: `${o * 100}%` }} />
                  </div>
                  <span className="mono">{frac(o)}</span>
                </div>
              ))}
            </div>
            <div className="occbase">基準粒子：{n.host}。T孔2N個・O孔N個を分母に数えます。</div>
          </div>
        )}
        {n.note && (
          <div className="detailsection">
            <div className="note">{n.note}</div>
          </div>
        )}
        <div className="detailsection">
          <h3>
            つながる構造 <span className="muted">/ 矢印の詳細へ</span>
          </h3>
          <div className="relationlist">
            {relations.length ? (
              relations.map((e) => <RelationItem key={e.id} e={e} from={n} />)
            ) : (
              <p className="smalltext muted">この絞り込みでは接続がありません。</p>
            )}
          </div>
        </div>
        <div className="detailsection">
          <h3>参考資料</h3>
          <RefChips refs={n.refs} />
        </div>
        {LABPRESETS.some((p) => p.id === n.id) && (
          <button
            data-openlab={n.id}
            className="small"
            style={{ marginTop: 18, width: "100%" }}
            onClick={() => dispatch({ type: "lab", id: n.id, open: true })}
          >
            ４副格子の模型で見る ↗
          </button>
        )}
      </div>
    </>
  );
}

function RelationItem({ e, from }: { e: AtlasEdge; from: AtlasNode }) {
  const { dispatch } = useAtlas();
  const other = node(e.a === from.id ? e.b : e.a);
  return (
    <button
      className="relationitem"
      data-relation={e.id}
      onClick={() => dispatch({ type: "selectEdge", id: e.id, narrow: isNarrow() })}
    >
      <div>
        <span style={{ color: KINDS[e.kind].color }}>{arrowFrom(e, from.id)}</span> {other.name}
        {other.family !== from.family && <span style={{ color: "#8ac0ce" }}> ↗</span>}
        <small>{e.label}</small>
      </div>
      <span className="relarr">›</span>
    </button>
  );
}

function EdgeDetail({ e }: { e: AtlasEdge }) {
  const { state, dispatch } = useAtlas();
  const selectNode = useSelectNode();
  const a = node(e.a);
  const b = node(e.b);
  const k = KINDS[e.kind];
  return (
    <>
      <div className="inspecthead">
        <div className="eyebrow" style={{ color: k.color }}>
          RELATION / {k.name}
        </div>
        <h2 style={{ fontSize: 19 }}>{e.label}</h2>
        <div className="row" style={{ marginTop: 11 }}>
          <button className="small" data-jump={a.id} onClick={() => selectNode(a.id)}>
            {a.name}
          </button>
          <span>{e.undirected ? "↔" : "→"}</span>
          <button className="small" data-jump={b.id} onClick={() => selectNode(b.id)}>
            {b.name}
          </button>
        </div>
      </div>
      <div className="inspectbody">
        <p className="desc">{e.desc}</p>
        {e.strict ? (
          <>
            <div className="detailsection">
              <span className="badge good">文献で確認した群–部分群関係</span>
            </div>
            <div className="detailsection">
              <div className="facts">
                <Fact label="対称性の対応" value={`${a.sg} → ${b.sg}`} mono />
                <Fact label="部分群の種類と指数" value={e.index ?? ""} mono />
                <Fact label="基底・原点・セル" value={e.basis ?? ""} />
                <Fact label="サイト・Wyckoff位置の対応" value={e.split ?? ""} />
              </div>
            </div>
          </>
        ) : (
          <div className="detailsection">
            <div className="note">
              {`この線は「${k.name}」を示します。本版では群–部分群指数、基底・原点、全原子位置の変換を検証した矢印としては扱いません。`}
            </div>
          </div>
        )}
        {e.warning && (
          <div className="detailsection">
            <div className="note warn">{e.warning}</div>
          </div>
        )}
        <div className="detailsection">
          <div className="note warn">
            構造の関係と、実際の反応・相転移は別です。矢印の向きは記述上の派生方向であり、実行可能な変換や安定性を保証しません。
          </div>
        </div>
        <div className="detailsection">
          <h3>この関係の出典</h3>
          <RefChips refs={e.refs} />
        </div>
        <button
          className="small"
          data-comparepair={`${a.id},${b.id}`}
          style={{ marginTop: 18, width: "100%" }}
          onClick={() => dispatch({ type: "comparePair", a: a.id, b: b.id })}
        >
          ２つの構造を比較する →
        </button>
        <button
          className="small flat"
          data-jump={state.selected}
          style={{ marginTop: 8, width: "100%" }}
          onClick={() => selectNode(state.selected)}
        >
          構造カードに戻る
        </button>
      </div>
    </>
  );
}
