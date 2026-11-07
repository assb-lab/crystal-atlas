/** Labels and site rows for unit-cell panels (rendering lives in components/ModelPanel.tsx). */
import type { ModelKind } from "../types.ts";
import { frac } from "./format.ts";
import type { Model, ViewDirection } from "./viewer.ts";

export const MODEL_KINDS: Record<ModelKind, string> = {
  prototype: "プロトタイプ座標",
  literature: "文献の構造データ",
  average: "平均構造",
  computed: "計算緩和構造",
  schematic: "理想化した模型",
};

/** Real axes, reciprocal axes, and the opposite side, in display order. */
export const VIEW_DIRECTIONS: [string, ViewDirection[]][] = [
  ["実格子", ["a", "b", "c"]],
  ["逆格子", ["a*", "b*", "c*"]],
  ["反対側", ["a-", "b-", "c-"]],
];

export const directionLabel = (direction: ViewDirection) =>
  direction.endsWith("-") ? `−${direction.charAt(0)}` : direction;

export interface SiteRow {
  site: number;
  wyckoff?: string;
  occupants: Record<string, number>;
}

/** One row per site: Wyckoff orbits for coordinate models, element groups for built-in models. */
export function siteRows(model: Model): SiteRow[] {
  if (model.groups) return model.groups.map((group, site) => ({ ...group, site }));
  const rows = new Map<number, SiteRow>();
  for (const { site, el } of model.atoms) rows.set(site, { site, occupants: { [el]: 1 } });
  return [...rows.values()];
}

/** "Li 1/2 / 空孔 1/2" style occupancy, with the vacancy remainder made explicit. */
export function occupancyText(occupants: Record<string, number>) {
  const entries = Object.entries(occupants);
  const vacancy = 1 - entries.reduce((total, [, value]) => total + value, 0);
  if (vacancy > 1e-8) entries.push(["空孔", vacancy]);
  return entries.map(([el, value]) => `${el}${value === 1 ? "" : ` ${frac(value)}`}`).join(" / ");
}
