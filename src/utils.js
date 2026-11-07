/** Pure helpers shared by the application and unit tests. */
export const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function frac(x) { const f = [[0, '0'], [1 / 8, '1/8'], [1 / 6, '1/6'], [.25, '1/4'], [1 / 3, '1/3'], [.5, '1/2'], [2 / 3, '2/3'], [.75, '3/4'], [1, '1']]; return (f.find(a => Math.abs(a[0] - x) < .0006) || [x, Number(x.toFixed(3)).toString()])[1]; }

export function normalize(s) { return String(s).normalize('NFKD').replace(/[₀₁₂₃₄₅₆₇₈₉]/g, c => '₀₁₂₃₄₅₆₇₈₉'.indexOf(c)).replace(/[\s_\-−‐·/]/g, '').toLowerCase(); }

/** Undirected graph connection, not a physical transformation pathway. */
export function shortestPath(edges, start, end, strictOnly = false) {
  const queue = [[start]];
  const seen = new Set([start]);
  for (let i = 0; i < queue.length; i++) {
    const path = queue[i];
    const at = path.at(-1);
    if (at === end) return path;
    for (const edge of edges) {
      if (strictOnly && !edge.strict) continue;
      const other = edge.a === at ? edge.b : edge.b === at ? edge.a : null;
      if (other && !seen.has(other)) {
        seen.add(other);
        queue.push([...path, other]);
      }
    }
  }
  return null;
}
