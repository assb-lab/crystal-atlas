import type { CSSProperties } from "react";
import { DATA } from "../data/atlas.ts";
import type { Ref } from "../types.ts";
import { useOpenSource } from "../store.ts";

/** Citation buttons: printed page, section, and the matching PDF page. */
export function RefChips({ refs, style }: { refs: Ref[]; style?: CSSProperties }) {
  const openSource = useOpenSource();
  return (
    <div className="refchips" style={style}>
      {refs.map((r) => {
        const src = DATA.sources[r.s];
        if (!src) return null;
        return (
          <button
            key={`${r.s}-${r.p}-${r.sec}`}
            className="refchip"
            data-source={r.s}
            data-page={r.p}
            title={src.title}
            onClick={() => openSource(r.s, r.p)}
          >
            {src.short} · p.{r.p}
            <span>
              {r.sec} / PDF {r.p + src.offset}
            </span>
          </button>
        );
      })}
    </div>
  );
}
