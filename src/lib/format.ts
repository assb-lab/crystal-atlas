/** Pure helpers shared by the application and unit tests. */

const FRACTIONS: [number, string][] = [
  [0, "0"],
  [1 / 8, "1/8"],
  [1 / 6, "1/6"],
  [0.25, "1/4"],
  [1 / 3, "1/3"],
  [0.5, "1/2"],
  [2 / 3, "2/3"],
  [0.75, "3/4"],
  [1, "1"],
];

/** Textbook fraction for common occupancies, otherwise a 3-decimal number. */
export function frac(x: number): string {
  return FRACTIONS.find(([v]) => Math.abs(v - x) < 0.0006)?.[1] ?? Number(x.toFixed(3)).toString();
}

/** Search key: folds full-width forms and subscripts, drops separators, lowercases. */
export function normalize(s: unknown): string {
  return String(s)
    .normalize("NFKD")
    .replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (c) => String("₀₁₂₃₄₅₆₇₈₉".indexOf(c)))
    .replace(/[\s_\-−‐·/]/g, "")
    .toLowerCase();
}

interface Link {
  a: string;
  b: string;
  strict?: boolean;
}

/** Undirected graph connection, not a physical transformation pathway. */
export function shortestPath(
  edges: Link[],
  start: string,
  end: string,
  strictOnly = false,
): string[] | null {
  const queue: string[][] = [[start]];
  const seen = new Set([start]);
  for (let i = 0; i < queue.length; i++) {
    const path = queue[i]!;
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
