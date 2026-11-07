import { useEffect, useMemo, useRef, useState } from "react";
import {
  alternativeRelations, PACKING_CARD, packingPositions, ROLE_LABELS,
  type PackingAtlas, type PackingView,
} from "../../lib/packing.ts";

interface Props {
  atlas: PackingAtlas;
  view: PackingView;
  selected: string;
  alternatives: boolean;
  onSelect: (id: string) => void;
  onFocus: (id: string) => void;
  onFold: (id: string) => void;
  onLink: (id: string) => void;
}

/** The primary hierarchy alone determines height. Optional source links never change layout. */
export function PackingMap({ atlas, view, selected, alternatives, onSelect, onFocus, onFold, onLink }: Props) {
  const positions = useMemo(() => packingPositions(atlas, view), [atlas, view]);
  const svg = useRef<SVGSVGElement>(null);
  const [viewport, setViewport] = useState({ width: 900, height: 600 });
  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry && entry.contentRect.width > 0 && entry.contentRect.height > 0)
        setViewport({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const drag = useRef<{ x: number; y: number; cx: number; cy: number } | null>(null);
  const bounds = useMemo(() => {
    const pts = [...positions.values()];
    if (!pts.length) return { x: 0, y: 0, width: 900, height: 600 };
    const x = Math.min(...pts.map((p) => p.x)) - 150;
    const y = Math.min(...pts.map((p) => p.y)) - 95;
    return { x, y, width: Math.max(...pts.map((p) => p.x)) - x + 150,
      height: Math.max(...pts.map((p) => p.y)) - y + 120 };
  }, [positions]);
  const [camera, setCamera] = useState<{ cx: number; cy: number; zoom: number } | null>(null);
  const baseWidth = Math.max(bounds.width, bounds.height * viewport.width / viewport.height);
  const readableWidth = Math.min(1050, Math.max(380, viewport.width * 1.12));
  const initialSelected = useRef(selected);
  const initial = positions.get(initialSelected.current) ?? { x: bounds.x + bounds.width / 2, y: bounds.y + 100 };
  const current = camera ?? { cx: initial.x, cy: initial.y + readableWidth * viewport.height / viewport.width * .27, zoom: baseWidth / readableWidth };
  const w = baseWidth / current.zoom, h = w * viewport.height / viewport.width;
  const fit = () => setCamera({ cx: bounds.x + bounds.width / 2, cy: bounds.y + bounds.height / 2, zoom: 1 });
  const zoom = (factor: number) => setCamera({ ...current, zoom: Math.max(.2, Math.min(Math.max(25, baseWidth / 320), current.zoom * factor)) });
  const focus = () => {
    const p = positions.get(selected);
    if (p) setCamera({ cx: p.x, cy: p.y, zoom: baseWidth / readableWidth });
  };
  const curve = (a: string, b: string, alternate = false) => {
    const p = positions.get(a)!, q = positions.get(b)!;
    if (alternate) return `M${p.x + 110},${p.y} C${p.x + 175},${p.y - 80} ${q.x + 175},${q.y - 80} ${q.x + 110},${q.y}`;
    const y1 = p.y + 50, y2 = q.y - 50, mid = (y1 + y2) / 2;
    return `M${p.x},${y1} C${p.x},${mid} ${q.x},${mid} ${q.x},${y2}`;
  };
  const raw = alternatives ? alternativeRelations(atlas, new Set(view.ids)) : [];
  return (
    <div className="packing-map-shell">
      <div className="packing-map-legend">
        <span>実線：構造上の操作</span><span>点線：具体例</span><span>破線：整理用の分岐</span>
        {alternatives && <span>紫：出典の別経路・比較（上下の順位には使わない）</span>}
      </div>
      {!view.ids.length && <p className="empty">該当項目はありません。出典・テーマの絞り込みを解除してください。</p>}
      <svg
        ref={svg} id="packingMap" className="packing-map" aria-label="基本充填からの構造階層"
        viewBox={`${current.cx - w / 2} ${current.cy - h / 2} ${w} ${h}`}
        tabIndex={0}
        onWheel={(ev) => { if (ev.ctrlKey || ev.metaKey) { ev.preventDefault(); zoom(ev.deltaY > 0 ? .9 : 1.1); } }}
        onPointerDown={(ev) => {
          if (ev.button !== 0 || (ev.target as Element).closest("[data-packing-node], [data-packing-edge]")) return;
          drag.current = { x: ev.clientX, y: ev.clientY, cx: current.cx, cy: current.cy };
          ev.currentTarget.setPointerCapture(ev.pointerId);
        }}
        onPointerMove={(ev) => {
          const start = drag.current, rect = svg.current?.getBoundingClientRect();
          if (!start || !rect) return;
          const scale = Math.min(rect.width / w, rect.height / h);
          setCamera({ ...current, cx: start.cx - (ev.clientX - start.x) / scale, cy: start.cy - (ev.clientY - start.y) / scale });
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
        onLostPointerCapture={() => (drag.current = null)}
        onKeyDown={(ev) => {
          if (ev.target !== ev.currentTarget) return;
          if (ev.key === "+" || ev.key === "=") zoom(1.25);
          else if (ev.key === "-") zoom(.8);
          else if (ev.key === "0") fit();
          else if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(ev.key)) {
            ev.preventDefault();
            setCamera({ ...current, cx: current.cx + (ev.key === "ArrowRight" ? w / 8 : ev.key === "ArrowLeft" ? -w / 8 : 0),
              cy: current.cy + (ev.key === "ArrowDown" ? h / 8 : ev.key === "ArrowUp" ? -h / 8 : 0) });
          }
        }}
      >
        <defs>
          <marker id="packingArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0 1 9 5 0 9" fill="none" stroke="context-stroke" strokeWidth="1.5" />
          </marker>
        </defs>
        <g className="packing-primary-links">
          {view.links.map((link) => {
            const p = positions.get(link.parent)!, q = positions.get(link.child)!;
            return (
              <g key={link.id} data-packing-edge={link.id} className={`packing-link ${link.kind}`}
                role="button" tabIndex={0} aria-label={`${atlas.nodes.get(link.parent)!.title} → ${atlas.nodes.get(link.child)!.title}：${link.label}`}
                onClick={() => onLink(link.id)} onKeyDown={(ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); onLink(link.id); } }}>
                <title>{link.label}{link.strict ? "（原資料の群–部分群関係）" : "（群–部分群を保証しない）"}</title>
                <path className="packing-link-hit" d={curve(link.parent, link.child)} />
                <path d={curve(link.parent, link.child)} markerEnd={link.kind === "derivation" ? "url(#packingArrow)" : undefined} />
                <text x={q.x} y={q.y - 59} textAnchor="middle">{link.kind === "instance" ? "具体例" : link.kind === "organizes" ? "分類・比較" : link.label.length > 18 ? `${link.label.slice(0, 18)}…` : link.label}</text>
                {p.y >= q.y && <title>階層データを確認してください</title>}
              </g>
            );
          })}
        </g>
        <g className="packing-alternative-links">
          {raw.map((edge) => (
            <g key={edge.id} data-packing-edge={edge.id} role="button" tabIndex={0}
              aria-label={`別経路・比較：${edge.label}`} onClick={() => onLink(edge.id)}
              onKeyDown={(ev) => { if (ev.key === "Enter") onLink(edge.id); }}>
              <title>{`${edge.label} ／ 出典の記述。主階層の親子ではありません。`}</title>
              <path className="packing-link-hit" d={curve(edge.a, edge.b, true)} />
              <path d={curve(edge.a, edge.b, true)} markerEnd={edge.undirected ? undefined : "url(#packingArrow)"} />
            </g>
          ))}
        </g>
        <g>
          {view.ids.map((id) => {
            const n = atlas.nodes.get(id)!, p = positions.get(id)!, kids = atlas.children.get(id) ?? [];
            const count = view.folded.get(id);
            return (
              <foreignObject key={id} x={p.x - PACKING_CARD.width / 2} y={p.y - PACKING_CARD.height / 2}
                width={PACKING_CARD.width} height={PACKING_CARD.height} data-packing-node={id}>
                <div className={`packing-node ${n.role}${selected === id ? " selected" : ""}${view.context.has(id) ? " context" : ""}${view.highlighted.has(id) ? " highlighted" : ""}`}>
                  <button className="packing-card-main" aria-label={`${n.title}、${ROLE_LABELS[n.role]}`}
                    onClick={() => onSelect(id)} onDoubleClick={() => onFocus(id)} title={`${n.title}\n${n.formula}\n${n.note}`}>
                    <small>{ROLE_LABELS[n.role]}{view.context.has(id) ? " · 祖先" : ""}</small>
                    <strong>{n.title}</strong><span>{n.formula}</span>
                  </button>
                  {kids.length > 0 && <button className="packing-card-fold" data-packing-fold={id}
                    aria-label={`${n.title}の枝を${count ? "展開" : "折り畳み"}`} aria-expanded={!count}
                    onClick={() => onFold(id)}>{count ? `＋ ${count}` : "−"}</button>}
                </div>
              </foreignObject>
            );
          })}
        </g>
      </svg>
      <div className="packing-map-controls">
        <button onClick={() => zoom(1.3)} aria-label="地図を拡大">＋</button>
        <button onClick={() => zoom(1 / 1.3)} aria-label="地図を縮小">−</button>
        <button onClick={fit}>全体に合わせる</button>
        <button onClick={focus}>選択位置へ</button>
        <span>画面外の枝は左の階層から / ドラッグ・矢印で移動 / ±で拡縮</span>
      </div>
    </div>
  );
}
