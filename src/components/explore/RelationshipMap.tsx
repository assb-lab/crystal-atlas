import { useState, useRef, useLayoutEffect, useId } from "react";
import { relationshipLayout, visibleRelationships } from "../../lib/relationship-map.ts";
import type { MapNode, MapEdge } from "../../lib/relationship-map.ts";
export interface DiagramEdge extends MapEdge {
  label: string;
  checked: boolean;
  source: string;
}
export function RelationshipMap({
  nodes,
  edges,
  active,
  focus,
  collapsed,
  onFold,
  onSelect,
  onFocus,
  onExpand,
}: {
  nodes: MapNode[];
  edges: DiagramEdge[];
  active: string | null;
  focus: string;
  collapsed: string[];
  onFold: (id: string) => void;
  onExpand: () => void;
  onSelect: (id: string) => void;
  onFocus: (id: string) => void;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [size, setSize] = useState(600);
  const marker = useId().replaceAll(":", "");
  const visible = visibleRelationships(edges, new Set(collapsed));
  const graph = relationshipLayout(
    nodes.filter((n) => visible.nodeIds.includes(n.id)),
    visible.edges,
  );
  const positions = new Map(graph.nodes.map((n) => [n.id, n]));
  useLayoutEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const update = () => setSize(el.clientWidth);
    const observer = new ResizeObserver(update);
    update();
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const fit = Math.min(1, (size - 20) / graph.width);
  const scale = Math.max(0.75, fit) * zoom;
  return (
    <section className="atlas-diagram" aria-label="対称性の関係図">
      <div className="atlas-map-tools">
        <span>
          {visible.edges.length} / {edges.length} 対応を表示
        </span>
        <div role="group" aria-label="図の拡大縮小">
          <button aria-label="図を縮小" onClick={() => setZoom((z) => Math.max(0.5, z / 1.25))}>
            −
          </button>
          <button
            onClick={() => {
              setZoom(fit / Math.max(0.75, fit));
              viewport.current?.scrollTo({ left: 0, top: 0 });
            }}
          >
            全体に合わせる
          </button>
          <button aria-label="図を拡大" onClick={() => setZoom((z) => Math.min(3, z * 1.25))}>
            ＋
          </button>
        </div>
        {collapsed.length > 0 && <button onClick={onExpand}>折り畳みをすべて解除</button>}
      </div>
      <p className="atlas-map-hint">
        上位群から部分群へ ↓　構造または矢印のラベルを選択。余白をドラッグして移動。
      </p>
      <div
        ref={viewport}
        className="atlas-map-viewport"
        tabIndex={0}
        aria-label="関係図。矢印キーでスクロール可能"
        onPointerDown={(e) => {
          if ((e.target as Element).closest("button")) return;
          const el = e.currentTarget;
          drag.current = { x: e.clientX, y: e.clientY, left: el.scrollLeft, top: el.scrollTop };
          el.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (d) {
            e.currentTarget.scrollLeft = d.left - (e.clientX - d.x);
            e.currentTarget.scrollTop = d.top - (e.clientY - d.y);
          }
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
      >
        <svg
          width={graph.width * scale}
          height={graph.height * scale}
          viewBox={`0 0 ${graph.width} ${graph.height}`}
          role="group"
          aria-label="上位群から部分群への対応"
        >
          <defs>
            <marker id={marker} markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
              <path d="M0,0 L7,3 L0,6" fill="none" stroke="currentColor" />
            </marker>
          </defs>
          {visible.edges.map((e) => {
            const a = positions.get(e.subjectId)!;
            const b = positions.get(e.objectId)!;
            const peers = visible.edges.filter((p) => {
              const pa = positions.get(p.subjectId)!;
              const pb = positions.get(p.objectId)!;
              return pa.y + pb.y === a.y + b.y;
            });
            const x1 = a.x + 110,
              x2 = b.x + 110,
              y1 = a.y + 86,
              y2 = b.y;
            const x =
              graph.width / 2 +
              (peers.findIndex((p) => p.id === e.id) - (peers.length - 1) / 2) * 130;
            const y = (y1 + y2) / 2;
            return (
              <g
                key={e.id}
                data-tree-edge={e.id}
                className={`atlas-graph-edge ${active === e.id ? "active" : ""} ${e.checked ? "checked" : ""}`}
              >
                <path
                  d={`M${x1},${y1} C${x1},${y1 + 30} ${x},${y - 30} ${x},${y} C${x},${y + 30} ${x2},${y2 - 30} ${x2},${y2}`}
                  markerEnd={`url(#${marker})`}
                  fill="none"
                />
                <foreignObject x={x - 56} y={y - 24} width="112" height="55">
                  <button
                    data-knowledge-record={e.id}
                    aria-pressed={active === e.id}
                    onClick={() => onSelect(e.id)}
                    title={`${e.label} · ${e.source}`}
                  >
                    <strong>{e.label}</strong>
                    <small>{e.source}</small>
                  </button>
                </foreignObject>
              </g>
            );
          })}
          {graph.nodes.map((n) => {
            const children = edges.filter((e) => e.subjectId === n.id);
            return (
              <foreignObject key={n.id} x={n.x} y={n.y} width="220" height="86">
                <div className={`atlas-graph-node ${focus === n.id ? "focused" : ""}`}>
                  <button
                    data-atlas-node={n.id}
                    aria-pressed={focus === n.id}
                    onClick={() => onFocus(n.id)}
                  >
                    <span>{n.title}</span>
                    {n.subtitle && <small>{n.subtitle}</small>}
                  </button>
                  {children.length > 0 && (
                    <button
                      className="atlas-node-fold"
                      aria-label={`${n.title}の枝を${collapsed.includes(n.id) ? "展開" : "折り畳む"}`}
                      aria-expanded={!collapsed.includes(n.id)}
                      onClick={() => onFold(n.id)}
                    >
                      {collapsed.includes(n.id) ? "＋" : "−"}
                    </button>
                  )}
                </div>
              </foreignObject>
            );
          })}
        </svg>
      </div>
      <div className="atlas-legend">
        <span>
          <i className="checked" />
          原典を限定確認
        </span>
        <span>
          <i />
          既存記録・未再照合
        </span>
        <span>枝のラベルに出典を表示</span>
      </div>
      {graph.cyclic && <p>循環する記述を含むため、図の上下だけで全ての順序を表せません。</p>}
    </section>
  );
}
