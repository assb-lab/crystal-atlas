import { useEffect, useRef, type CanvasHTMLAttributes } from "react";
import { CrystalView, type Model } from "../lib/viewer.ts";

interface Props extends CanvasHTMLAttributes<HTMLCanvasElement> {
  model: Model;
  large?: boolean;
  visible?: boolean[];
  labels?: boolean;
  /** Changing this value resets rotation and zoom. */
  resetSeq?: number;
}

/** React wrapper around the imperative canvas viewer. */
export function CrystalCanvas({
  model,
  large = false,
  visible,
  labels = false,
  resetSeq = 0,
  ...rest
}: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const view = useRef<CrystalView | null>(null);

  useEffect(() => {
    if (!canvas.current) return;
    const v = new CrystalView(canvas.current, large);
    view.current = v;
    return () => {
      v.destroy();
      view.current = null;
    };
  }, [large]);

  useEffect(() => {
    const v = view.current;
    if (!v) return;
    v.visible = visible ?? [true, true, true, true];
    v.labels = labels;
    v.set(model);
  }, [model, visible, labels, large]);

  useEffect(() => {
    if (resetSeq) view.current?.reset();
  }, [resetSeq]);

  return <canvas ref={canvas} {...rest} />;
}
