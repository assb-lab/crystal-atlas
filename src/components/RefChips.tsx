import type { CSSProperties } from "react";
import { DATA } from "../data/atlas.ts";
import { sourcePdfPage } from "../lib/format.ts";
import { useOpenSource } from "../store.ts";
import type { Ref } from "../types.ts";

/** Citation chips: printed page + PDF page for books, a link for web articles. */
export function RefChips({
  refs,
  style,
  inline = false,
}: {
  refs: Ref[];
  style?: CSSProperties;
  inline?: boolean;
}) {
  const openSource = useOpenSource();
  const chips = refs.map((ref, i) => {
    const source = DATA.sources[ref.s];
    if (!source) return null;
    const key = `${ref.s}-${ref.p ?? "web"}-${ref.sec}-${i}`;
    if (ref.p === undefined)
      return (
        <a
          key={key}
          className="refchip"
          href={ref.url ?? source.article}
          target="_blank"
          rel="noopener"
          title={source.citation ?? source.title}
        >
          {source.short} ↗<span>{ref.sec}</span>
        </a>
      );
    const page = sourcePdfPage(source, ref);
    return (
      <button
        key={key}
        className="refchip"
        data-source={ref.s}
        data-page={ref.p}
        data-pdfpage={page}
        title={source.citation ?? source.title}
        onClick={() => openSource(ref)}
      >
        {source.short} · p.{ref.p}
        <span>
          {ref.sec} / PDF {page}
        </span>
      </button>
    );
  });
  return inline ? (
    <span className="refchips" style={style}>
      {chips}
    </span>
  ) : (
    <div className="refchips" style={style}>
      {chips}
    </div>
  );
}
