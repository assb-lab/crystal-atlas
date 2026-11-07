/** Curated atlas families. Source wording and page references retained from v1.0. */
import type { Family } from "../types.ts";

export const families: Record<string, Family> = {
  fcc: {
    name: "fcc / ccp と四面体骨格",
    short: "fcc / ccp",
    color: "#65c6e7",
    subtitle: "同じ充填から、空隙の使い方を変える",
    x: 0,
    y: 0,
  },
  hcp: {
    name: "hcp / NiAs と層状構造",
    short: "hcp / NiAs",
    color: "#b7a3f5",
    subtitle: "AB積層と八面体孔の規則的な占有",
    x: 1060,
    y: 0,
  },
  bcc: {
    name: "bcc と金属の規則化",
    short: "bcc / 合金",
    color: "#f1b76c",
    subtitle: "A2・B2・L2₁と、歪んだ超構造",
    x: 2120,
    y: 0,
  },
  fluorite: {
    name: "蛍石と欠陥派生構造",
    short: "蛍石 / 空孔",
    color: "#73d6b0",
    subtitle: "空孔の数だけでなく、並べ方を見る",
    x: 0,
    y: 900,
  },
  perov: {
    name: "ペロブスカイトと積層",
    short: "ペロブスカイト",
    color: "#e895bd",
    subtitle: "八面体の回転、サイト秩序、ブロック積層",
    x: 1060,
    y: 900,
  },
  rutile: {
    name: "ルチルと連結の変化",
    short: "ルチル / 連結",
    color: "#c8c96f",
    subtitle: "同じ配位数でも、多面体のつながりは違う",
    x: 2120,
    y: 900,
  },
};
