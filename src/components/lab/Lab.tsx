import { useMemo, useState } from "react";
import { LABPRESETS, OCCPRESETS } from "../../data/presets.ts";
import { frac } from "../../lib/format.ts";
import { fourFCC, SITE_COLORS } from "../../lib/viewer.ts";
import { useAtlas, useSelectNode } from "../../store.ts";
import { CrystalCanvas } from "../CrystalCanvas.tsx";
import { RefChips } from "../RefChips.tsx";

const SITE_COORDS = ["(0, 0, 0)", "(½, ½, ½)", "(¼, ¼, ¼)", "(¾, ¾, ¾)"];

export function Lab() {
  const { state } = useAtlas();
  return (
    <section id="lab" className="tabpage" hidden={state.tab !== "lab"}>
      <div className="pageintro">
        <div>
          <div className="eyebrow">01 / Sublattice laboratory</div>
          <h2>４つのfcc副格子から、構造を見る。</h2>
          <p>
            同じ立方セルの４つの位置集合に、原子と空孔を配る。ホイスラー・蛍石・岩塩・閃亜鉛鉱を共通の座標系で比べます。
          </p>
        </div>
      </div>
      <SublatticeLab />
      <Occupancy />
    </section>
  );
}

function SublatticeLab() {
  const { state, dispatch } = useAtlas();
  const selectNode = useSelectNode();
  const [labels, setLabels] = useState(false);
  const [resetSeq, setResetSeq] = useState(0);
  const p = LABPRESETS.find((l) => l.id === state.lab) ?? LABPRESETS[0]!;
  const model = useMemo(() => fourFCC(p, true), [p]);
  const counts = new Map<string, number>();
  for (const el of p.els) if (el) counts.set(el, (counts.get(el) ?? 0) + 4);
  const total = p.els.filter(Boolean).length * 4;

  return (
    <div className="labgrid">
      <div className="panel">
        <div className="panelhead">
          <h3>副格子の重ね合わせ</h3>
          <span className="spacer" />
          <select
            id="labSelect"
            aria-label="副格子模型を選ぶ"
            value={p.id}
            onChange={(ev) => dispatch({ type: "lab", id: ev.target.value })}
          >
            {LABPRESETS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label} — {l.formula}
              </option>
            ))}
          </select>
        </div>
        <div className="labvisual">
          <CrystalCanvas
            id="labcanvas"
            aria-label="回転できる理想化された原子配置の模型"
            model={model}
            large
            visible={state.subVisible}
            labels={labels}
            resetSeq={resetSeq}
          />
          <div className="canvasoverlay">
            <strong id="labModelName">{p.label}</strong>
            <p id="labModelFormula">{p.formula}</p>
          </div>
          <div className="canvascontrols">
            <button id="labReset" className="small flat" onClick={() => setResetSeq((n) => n + 1)}>
              視点を戻す
            </button>
            <label className="checklabel" style={{ margin: 0, fontSize: 10 }}>
              <input
                type="checkbox"
                id="labLabels"
                checked={labels}
                onChange={(ev) => setLabels(ev.target.checked)}
              />
              記号
            </label>
            <span className="caption">ドラッグで回転 · ホイール／ピンチで拡縮</span>
          </div>
        </div>
        <div id="labPresets" className="labpresets">
          {LABPRESETS.map((l) => (
            <button
              key={l.id}
              data-labpreset={l.id}
              className={p.id === l.id ? "active" : ""}
              onClick={() => dispatch({ type: "lab", id: l.id })}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
      <div className="panel">
        <div className="panelhead">
          <h3>原子を置く場所</h3>
          <span className="spacer" />
          <span className="badge">A / B / C / D</span>
        </div>
        <div className="panelbody">
          <div className="sitelegend" id="siteLegend">
            {p.els.map((el, i) => (
              <div className={`sitecard${state.subVisible[i] ? "" : " off"}`} key={i}>
                <header>
                  <label>
                    <input
                      type="checkbox"
                      data-sub={i}
                      checked={state.subVisible[i] ?? true}
                      onChange={(ev) => dispatch({ type: "sub", index: i, on: ev.target.checked })}
                    />
                    <i className="sitedot" style={{ background: SITE_COLORS[i] }} />
                    <b>{"ABCD"[i]}</b>
                  </label>
                </header>
                <div className="element" style={{ color: SITE_COLORS[i] }}>
                  {el || "□"}
                </div>
                <div className="xyz">{SITE_COORDS[i]}</div>
                <div className="status">{el ? "4 原子 / 共通セル" : "4 空サイト / 共通セル"}</div>
              </div>
            ))}
          </div>
          <p id="labDesc" className="labexplain">
            {p.desc}
          </p>
          <div className="note green" style={{ marginTop: 16 }} id="labCount">
            周期セル内の内訳：
            {[...counts].map(([el, n]) => `${el} ${n}`).join(" + ")}　（合計 {total} 原子）
          </div>
          <p className="modelcaption" style={{ marginTop: 13 }}>
            {
              "各位置にF並進 (0,½,½), (½,0,½), (½,½,0) を加えます。色は元素ではなく副格子を表します。半透明の輪は空孔です。"
            }
          </p>
          <hr className="subtlehr" />
          <div className="note warn">
            理想化したサイト模型です。実測CIF、電子密度、原子半径、安定構造を再現するものではありません。セル境界の原子は隣のセルにも属するため、見えている球の数とセル内の原子数は一致しません。
          </div>
          <RefChips
            refs={[
              { s: "M06", p: 161, sec: "Fig.15.3" },
              { s: "K", p: 160, sec: "図7" },
            ]}
            style={{ marginTop: 14 }}
          />
          <button
            id="labToNode"
            className="small"
            style={{ marginTop: 15 }}
            onClick={() => selectNode(p.id)}
          >
            この構造の関係を見る →
          </button>
        </div>
      </div>
    </div>
  );
}

function Occupancy() {
  const { state, dispatch } = useAtlas();
  const preset = state.occPreset ? OCCPRESETS[state.occPreset] : undefined;
  const ratio = 2 * state.t + state.o;
  const setOcc = (t: number, o: number) => dispatch({ type: "occ", t, o });
  return (
    <div className="sectionblock panel">
      <div className="panelhead">
        <div>
          <div className="eyebrow">02 / Occupancy is not topology</div>
          <h3 style={{ marginTop: 5 }}>空隙の「何割」を占めるか。その先は？</h3>
        </div>
      </div>
      <div className="panelbody">
        <div className="occupancygrid">
          <div>
            <div id="occupancyPresets" className="occupancypresets">
              {Object.entries(OCCPRESETS).map(([id, o]) => (
                <button
                  key={id}
                  data-occpreset={id}
                  className={id === state.occPreset ? "active" : ""}
                  onClick={() => dispatch({ type: "occPreset", key: id })}
                >
                  {o.name}
                </button>
              ))}
            </div>
            <div className="sliderrow">
              <label htmlFor="tetraSlider">T孔占有率</label>
              <input
                id="tetraSlider"
                type="range"
                min="0"
                max="1"
                step="0.001"
                value={state.t}
                onChange={(ev) => setOcc(Number(ev.target.value), state.o)}
              />
              <output id="tetraValue">{frac(state.t)}</output>
            </div>
            <div className="sliderrow">
              <label htmlFor="octaSlider">O孔占有率</label>
              <input
                id="octaSlider"
                type="range"
                min="0"
                max="1"
                step="0.001"
                value={state.o}
                onChange={(ev) => setOcc(state.t, Number(ev.target.value))}
              />
              <output id="octaValue">{frac(state.o)}</output>
            </div>
            <div className="calcoutput">
              <div className="result" id="occupancyResult">
                {Number(ratio.toFixed(3))}
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#92beaf" }}>
                  充填粒子1個あたりの空隙内粒子数
                </div>
                <div className="equation" id="occupancyEquation">
                  2 × {frac(state.t)} + {frac(state.o)} = {frac(ratio)}
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 id="occupancyTitle">{preset ? preset.title : "任意の占有率を数える"}</h3>
            <p id="occupancyDesc" className="labexplain" style={{ marginTop: 10 }}>
              {preset
                ? preset.desc
                : "これは幾何学的な数え上げです。この数値から構造名は決まりません。占有サイトの選び方、周期性、骨格の歪み、元素の種類を指定する必要があります。"}
            </p>
            <div className="note" style={{ marginTop: 13 }}>
              T孔（四面体孔）は充填粒子N個に対して2N個、O孔（八面体孔）はN個。分母は「全ての孔」であり、選ばれたWyckoff位置の占有率ではありません。スライダーは幾何学的な数え上げで、電荷中性・原子反発・構造の実現可能性は判定しません。
            </div>
            <RefChips
              refs={preset ? preset.refs : [{ s: "M13", p: 168, sec: "§13.1" }]}
              style={{ marginTop: 13 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
