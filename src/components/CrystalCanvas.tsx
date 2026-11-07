import { useEffect, useRef, type CanvasHTMLAttributes, type RefObject } from "react";
import { CrystalView, type Model } from "../lib/viewer.ts";

interface Props extends CanvasHTMLAttributes<HTMLCanvasElement> {
  model: Model;
  large?: boolean;
  visible?: boolean[];
  labels?: boolean;
  /** Receives the imperative view, for projection buttons and reset. */
  viewRef?: RefObject<CrystalView | null>;
}

/** React wrapper around the imperative canvas viewer (used by the lab). */
export function CrystalCanvas({
  model,
  large = false,
  visible,
  labels = false,
  viewRef,
  ...rest
}: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const view = useRef<CrystalView | null>(null);

  useEffect(() => {
    if (!canvas.current) return;
    const v = new CrystalView(canvas.current, large);
    view.current = v;
    if (viewRef) viewRef.current = v;
    return () => {
      v.destroy();
      view.current = null;
      if (viewRef) viewRef.current = null;
    };
  }, [large, viewRef]);

  useEffect(() => {
    const v = view.current;
    if (!v) return;
    v.visible = visible ?? [true, true, true, true];
    v.labels = labels;
    v.set(model);
  }, [model, visible, labels, large]);

  return <canvas ref={canvas} {...rest} />;
}
