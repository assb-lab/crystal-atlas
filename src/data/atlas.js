import { sources } from "./sources.js";
import { families } from "./families.js";
import { nodes } from "./structures.js";
import { edges } from "./relationships.js";

/** Canonical dataset used by the UI, JSON export, tests, and standalone build. */
export const DATA = {version: "1.0", date: "2026-11-07", sources, families, nodes, edges};
