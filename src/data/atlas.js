import { classificationSources } from "./classification-sources.js";
import { classificationNodes, classificationEdges } from "./classification-structures.js";
import { collections, structureLabels } from "./classifications.js";
import { sources } from "./sources.js";
import { families } from "./families.js";
import { nodes } from "./structures.js";
import { edges } from "./relationships.js";
import { coordinateModels } from "./models.js";
import { expansionNodes, expansionEdges } from "./expansion.js";
import { breadthNodes, breadthEdges } from "./breadth.js";
import { okamotoNodes, okamotoEdges, okamotoFlows } from "./okamoto.js";

/** Canonical dataset used by the UI, JSON export, tests, and standalone build. */
export const DATA = {
  version: "1.5",
  date: "2026-11-07",
  sources: { ...sources, ...classificationSources },
  families,
  nodes: [...nodes, ...expansionNodes, ...breadthNodes, ...okamotoNodes, ...classificationNodes],
  edges: [...edges, ...expansionEdges, ...breadthEdges, ...okamotoEdges, ...classificationEdges],
  collections,
  structureLabels,
  flows: okamotoFlows,
  models: coordinateModels,
};
