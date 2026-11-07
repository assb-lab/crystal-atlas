import { useEffect, useRef } from "react";
import {
  directionLabel,
  MODEL_KINDS,
  occupancyText,
  siteRows,
  VIEW_DIRECTIONS,
} from "../lib/model-info.ts";
import {
  CrystalView,
  modelColor,
  type Camera,
  type Model,
  type ViewDirection,
} from "../lib/viewer.ts";
import type { AtlasNode } from "../types.ts";

export function ViewDirectionButtons({ onPick }: { onPick: (direction: ViewDirection) => void }) {
  return VIEW_DIRECTIONS.map(([label, directions]) => (
    <div role="group" aria-label={label} key={label}>
      {directions.map((direction) => (
        <button
          key={direction}
          type="button"
          className="small"
          data-view-direction={direction}
          title={`${directionLabel(direction)}方向から見る`}
          onClick={() => onPick(direction)}
        >
          {directionLabel(direction)}
        </button>
      ))}
    </div>
  ));
}

interface Props {
  node: AtlasNode;
  model: Model;
  /** Side-by-side variant: name header, no reset button (the dialog resets both). */
  comparison?: boolean;
  /** Shared camera to keep comparison views in sync. */
  camera?: Camera;
  onCameraChange?: (view: CrystalView) => void;
  /** Called with the view on mount and null on unmount. */
  onView?: (view: CrystalView | null) => void;
}

/** Rotatable unit cell with projection buttons, site toggles and coordinate provenance. */
export function ModelPanel({
  node,
  model,
  comparison = false,
  camera,
  onCameraChange,
  onView,
}: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const view = useRef<CrystalView | null>(null);
  const callbacks = useRef({ onCameraChange, onView });

  useEffect(() => {
    callbacks.current = { onCameraChange, onView };
  });

  useEffect(() => {
    if (!canvas.current) return;
    const v = new CrystalView(canvas.current, false, {
      camera,
      onCameraChange: (changed) => callbacks.current.onCameraChange?.(changed),
    });
    v.set(model);
    view.current = v;
    callbacks.current.onView?.(v);
    return () => {
      callbacks.current.onView?.(null);
      v.destroy();
      view.current = null;
    };
  }, [model, camera]);

  const kind = model.kind ?? "schematic";
  const metric = model.parameters?.map((value) => Number(value.toFixed(4)));
  return (
    <section className={`crystalpanel${comparison ? " comparisonmodel" : ""}`}>
      {comparison && (
        <>
          <h3>{node.name}</h3>
          <p className="muted smalltext">{node.formula}</p>
        </>
      )}
      <div className="inspectmodel">
        <canvas
          ref={canvas}
          tabIndex={0}
          aria-label={`${node.name}の単位胞。ドラッグまたは矢印キーで回転`}
        />
      </div>
      <div className="axiscontrols" role="group" aria-label="単位胞の投影方向">
        <ViewDirectionButtons onPick={(direction) => view.current?.lookAlong(direction)} />
        {!comparison && (
          <button
            type="button"
            className="small flat"
            data-reset-view
            onClick={() => view.current?.reset()}
          >
            視点を戻す
          </button>
        )}
      </div>
      <div className="modelcaption">
        <span className="badge">{MODEL_KINDS[kind]}</span>
        {model.spaceGroup ? <span className="mono"> No. {model.spaceGroup}</span> : null}
      </div>
      {!comparison && (
        <p className="modelcaption">ドラッグ・矢印キーで回転 ／ ホイール・ピンチで拡大</p>
      )}
      {model.note && <p className="modelcaption">{model.note}</p>}
      <details className="modeldetails">
        <summary>サイトと座標の出典</summary>
        {metric && (
          <p className="modelmetric mono">
            a, b, c = {metric.slice(0, 3).join(", ")} {kind === "schematic" ? "（相対値）" : "Å"}
            <br />
            α, β, γ = {metric.slice(3).join("°, ")}°
          </p>
        )}
        <div className="modelsites">
          {siteRows(model).map(({ site, wyckoff, occupants }) => (
            <label className="modelsite" key={site}>
              <input
                type="checkbox"
                data-modelsite={site}
                defaultChecked
                onChange={(ev) => {
                  const v = view.current;
                  if (!v) return;
                  v.visible[site] = ev.target.checked;
                  v.draw();
                }}
              />
              <i className="sitedot" style={{ background: modelColor(site, model) }} />
              <span>
                {wyckoff && (
                  <>
                    <b>{wyckoff}</b>{" "}
                  </>
                )}
                {occupancyText(occupants)}
                {model.colors ? ` · ${site + 1}` : ""}
              </span>
            </label>
          ))}
        </div>
        {model.source && (
          <p className="modelcaption">
            {model.source.url ? (
              <a href={model.source.url} target="_blank" rel="noopener">
                {model.source.label} ↗
              </a>
            ) : (
              model.source.label
            )}
          </p>
        )}
      </details>
    </section>
  );
}
