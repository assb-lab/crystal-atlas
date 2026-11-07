import { useState, type CSSProperties, type KeyboardEvent } from "react";
import { DATA } from "../../data/atlas.ts";
import { KINDS } from "../../data/presets.ts";
import {
  bundleOfEdge,
  bundles,
  CARD,
  clipToRect,
  crossEdgesOf,
  edgePath,
  family as familyOf,
  fitText,
  node,
  splitBundleKey,
  tileRect,
  type Visible,
} from "../../lib/graph.ts";
import { useAtlas, useSelectNode } from "../../store.ts";

const onActivate = (fn: () => void) => (ev: KeyboardEvent) => {
  if (ev.key === "Enter" || ev.key === " ") {
    ev.preventDefault();
    fn();
  }
};

/** Cards and relation arrows of one family. */
export function FamilyMap({ visible, wasDrag }: { visible: Visible; wasDrag: () => boolean }) {
  const { state, dispatch } = useAtlas();
  const selectNode = useSelectNode();
  const selectEdge = (id: string) => dispatch({ type: "selectEdge", id });
  const cross = crossEdgesOf(state.selected, state.strict).length;
  const picked = state.edge ? visible.edges.find((e) => e.id === state.edge) : undefined;
  const pickedPath = picked ? edgePath(node(picked.a), node(picked.b)) : null;
  const labelWidth = picked ? Math.max(80, picked.label.length * 11 + 14) : 0;

  return (
    <>
      <g id="edgeLayer">
        {visible.edges.map((e) => {
          const a = node(e.a);
          const b = node(e.b);
          const p = edgePath(a, b);
          const hi = state.edge
            ? state.edge === e.id
            : e.a === state.selected || e.b === state.selected;
          const k = KINDS[e.kind];
          return (
            <g key={e.id}>
              <path
                d={p.d}
                className={`edge${hi ? " highlight" : ""}${state.edge === e.id ? " selected" : ""}`}
                stroke={k.color}
                strokeDasharray={k.dash || undefined}
                markerEnd={e.undirected ? undefined : `url(#arrow-${e.kind})`}
              />
              <path
                d={p.d}
                className="edgehit"
                data-edge={e.id}
                tabIndex={0}
                role="button"
                aria-label={`${a.name} と ${b.name}: ${e.label}`}
                onClick={() => selectEdge(e.id)}
                onKeyDown={onActivate(() => selectEdge(e.id))}
              >
                <title>{`${a.name} → ${b.name}\n${e.label}`}</title>
              </path>
            </g>
          );
        })}
      </g>
      <g id="nodeLayer">
        {visible.nodes.map((n) => {
          const pick = () => {
            if (!wasDrag()) selectNode(n.id, false);
          };
          const compareAt = state.comp.indexOf(n.id);
          return (
            <g
              key={n.id}
              className={`node${state.selected === n.id && !state.edge ? " selected" : ""}`}
              transform={`translate(${n.x - CARD.w / 2},${n.y - CARD.h / 2})`}
              data-node={n.id}
              tabIndex={0}
              role="button"
              aria-label={`${n.name} ${n.formula}`}
              onClick={pick}
              onKeyDown={onActivate(() => selectNode(n.id, false))}
            >
              <rect width={CARD.w} height={CARD.h} rx={9} className="main" />
              <rect
                x={0}
                y={14}
                width={3}
                height={24}
                rx={1.5}
                fill={familyOf(n.family).color}
                className="familystripe"
              />
              <text
                x={14}
                y={26}
                className="title"
                {...(n.name.length > 15
                  ? { textLength: 191, lengthAdjust: "spacingAndGlyphs" }
                  : {})}
              >
                {n.name}
              </text>
              <text x={14} y={47} className="formula">
                {fitText(n.formula, 28)}
              </text>
              <text x={14} y={69} className="sg">
                {fitText(n.sg, 31)}
              </text>
              {compareAt >= 0 && (
                <>
                  <circle cx={207} cy={12} r={7} className="comparecircle" />
                  <text x={207} y={15} textAnchor="middle" fill="#a7efd7" fontSize={9}>
                    {compareAt + 1}
                  </text>
                </>
              )}
              {n.id === state.selected && cross > 0 && (
                // Marks neighbours outside this family (listed in the cross-family strip).
                <>
                  <rect x={194} y={75} width={42} height={22} rx={11} className="crossbadge" />
                  <text x={215} y={90} textAnchor="middle" className="crossbadgetext">
                    ↗ {cross}
                  </text>
                </>
              )}
              <title>{`${n.name}\n${n.formula}\n${n.sg}`}</title>
            </g>
          );
        })}
      </g>
      <g id="edgeLabels">
        {picked && pickedPath && (
          <g>
            <rect
              x={pickedPath.mx - labelWidth / 2}
              y={pickedPath.my - 12}
              width={labelWidth}
              height={24}
              rx={5}
              className="edgelabelbg"
            />
            <text x={pickedPath.mx} y={pickedPath.my + 4} textAnchor="middle" className="edgelabel">
              {picked.label}
            </text>
          </g>
        )}
      </g>
    </>
  );
}

/** One tile per family with a mini-map, and one counted bundle per family pair. */
export function OverviewMap({ visible }: { visible: Visible }) {
  const { state, dispatch } = useAtlas();
  const [hover, setHover] = useState<string | null>(null);
  const sel = node(state.selected);
  const active = state.bundle ?? bundleOfEdge(state.edge);
  const lit = (a: string, b: string) => (hover && (a === hover || b === hover) ? " lit" : "");
  const selectBundle = (key: string) => dispatch({ type: "selectBundle", key });
  const degree = (id: string) => visible.edges.filter((e) => e.a === id || e.b === id).length;
  const groups = [...bundles(visible.edges)].map(([key, list]) => {
    const [fa, fb] = splitBundleKey(key);
    const ra = tileRect(fa);
    const rb = tileRect(fb);
    const [x1, y1] = clipToRect(ra, rb.x + rb.w / 2, rb.y + rb.h / 2);
    const [x2, y2] = clipToRect(rb, ra.x + ra.w / 2, ra.y + ra.h / 2);
    return { key, list, fa, fb, x1, y1, x2, y2, mx: (x1 + x2) / 2, my: (y1 + y2) / 2 };
  });

  return (
    <g className={hover ? "tilehover" : undefined}>
      <g id="edgeLayer">
        {groups.map(({ key, list, fa, fb, x1, y1, x2, y2 }) => {
          const gid = `bundle-${fa}-${fb}`;
          const d = `M${x1},${y1} L${x2},${y2}`;
          const label = `${familyOf(fa).short} と ${familyOf(fb).short}：${list.length} 本の関係`;
          return (
            <g key={key}>
              <linearGradient
                id={gid}
                gradientUnits="userSpaceOnUse"
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
              >
                <stop offset="0" stopColor={familyOf(fa).color} />
                <stop offset="1" stopColor={familyOf(fb).color} />
              </linearGradient>
              <path
                d={d}
                className="bundlehit"
                tabIndex={0}
                role="button"
                aria-label={label}
                onClick={() => selectBundle(key)}
                onKeyDown={onActivate(() => selectBundle(key))}
              >
                <title>{`${label}\n${list.map((e) => `${node(e.a).name} → ${node(e.b).name}`).join("\n")}`}</title>
              </path>
              <path
                d={d}
                className={`bundle${active === key ? " selected" : ""}${lit(fa, fb)}`}
                stroke={`url(#${gid})`}
                strokeWidth={3 + list.length * 2.4}
              />
            </g>
          );
        })}
      </g>
      <g id="nodeLayer">
        {Object.entries(DATA.families).map(([id, f]) => {
          const r = tileRect(id);
          const all = DATA.nodes.filter((n) => n.family === id);
          const shown = visible.nodes.filter((n) => n.family === id);
          const ids = new Set(shown.map((n) => n.id));
          const current = sel.family === id;
          // Mini-map in the family view's own coordinates.
          const xs = all.map((n) => n.x);
          const ys = all.map((n) => n.y);
          const bx1 = Math.min(...xs) - CARD.w / 2;
          const bx2 = Math.max(...xs) + CARD.w / 2;
          const by1 = Math.min(...ys) - CARD.h / 2;
          const by2 = Math.max(...ys) + CARD.h / 2;
          const area = { x: r.x + 24, y: r.y + 112, w: r.w - 48, h: r.h - 172 };
          const s = Math.min(area.w / (bx2 - bx1), area.h / (by2 - by1));
          const ox = area.x + (area.w - (bx2 - bx1) * s) / 2 - bx1 * s;
          const oy = area.y + (area.h - (by2 - by1) * s) / 2 - by1 * s;
          const reps = [...shown]
            .sort((a, b) => degree(b.id) - degree(a.id))
            .slice(0, 3)
            .map((n) => n.name)
            .join(" · ");
          return (
            <g
              key={id}
              className={`familytile${current ? " current" : ""}${shown.length ? "" : " empty"}`}
              data-tile={id}
              tabIndex={0}
              role="button"
              aria-label={`${f.name}：${shown.length} 構造。開く`}
              style={{ "--fam": f.color } as CSSProperties}
              onKeyDown={onActivate(() => dispatch({ type: "family", id }))}
              onPointerEnter={() => setHover(id)}
              onPointerLeave={() => setHover(null)}
            >
              <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={22} className="tilebg" />
              <rect x={r.x} y={r.y + 30} width={6} height={44} rx={3} fill={f.color} />
              <text x={r.x + 28} y={r.y + 58} className="tiletitle">
                {f.short}
              </text>
              <text x={r.x + 28} y={r.y + 88} className="tilesub">
                {fitText(f.subtitle, 21)}
              </text>
              <text x={r.x + r.w - 26} y={r.y + 60} textAnchor="end" className="tilecount">
                {shown.length}
              </text>
              <g className="minimap">
                {visible.edges
                  .filter((e) => ids.has(e.a) && ids.has(e.b))
                  .map((e) => (
                    <line
                      key={e.id}
                      x1={ox + node(e.a).x * s}
                      y1={oy + node(e.a).y * s}
                      x2={ox + node(e.b).x * s}
                      y2={oy + node(e.b).y * s}
                      className="miniedge"
                    />
                  ))}
                {shown.map((n) => (
                  <rect
                    key={n.id}
                    x={ox + (n.x - CARD.w / 2) * s}
                    y={oy + (n.y - CARD.h / 2) * s}
                    width={CARD.w * s}
                    height={CARD.h * s}
                    rx={4}
                    className={`mininode${n.id === state.selected ? " sel" : ""}`}
                  />
                ))}
              </g>
              <text x={r.x + 28} y={r.y + r.h - 26} className="tilereps">
                {shown.length ? fitText(reps, 24) : "この絞り込みでは該当なし"}
              </text>
              <title>{`${f.name}\n${f.subtitle}${current ? `\n選択中：${sel.name}` : ""}\nクリックで開く`}</title>
            </g>
          );
        })}
      </g>
      <g id="edgeLabels">
        {groups.map(({ key, list, fa, fb, mx, my }) => {
          return (
            <g
              key={key}
              className={`bundlelabel${active === key ? " selected" : ""}${lit(fa, fb)}`}
            >
              <rect x={mx - 34} y={my - 17} width={68} height={34} rx={17} />
              <text x={mx} y={my + 7} textAnchor="middle">
                {list.length} 本
              </text>
            </g>
          );
        })}
      </g>
    </g>
  );
}
