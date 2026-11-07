import { sources } from "./sources.js";
import { families } from "./families.js";
import { nodes } from "./structures.js";
import { edges } from "./relationships.js";
import { coordinateModels } from "./models.js";
import { expansionNodes, expansionEdges } from "./expansion.js";
import { breadthNodes, breadthEdges } from "./breadth.js";

/** Canonical dataset used by the UI, JSON export, tests, and standalone build. */
export const DATA = {
  version: "1.3",
  date: "2026-11-07",
  sources,
  families,
  nodes: [...nodes, ...expansionNodes, ...breadthNodes],
  edges: [...edges, ...expansionEdges, ...breadthEdges],
  models: coordinateModels,
};
