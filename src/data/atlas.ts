import type { Atlas } from "../types.ts";
import { families } from "./families.ts";
import { edges } from "./relationships.ts";
import { sources } from "./sources.ts";
import { nodes } from "./structures.ts";

/** Canonical dataset used by the UI, JSON export, tests, and standalone build. */
export const DATA: Atlas = { version: "1.0", date: "2026-11-07", sources, families, nodes, edges };
