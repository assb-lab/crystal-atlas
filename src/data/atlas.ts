import { classificationSources } from "./classification-sources.ts";
import { classificationNodes, classificationEdges } from "./classification-structures.ts";
import { collections, structureLabels } from "./classifications.ts";
import { sources } from "./sources.ts";
import { occupationSources } from "./occupation-sources.ts";
import { conceptSources } from "./concept-sources.ts";
import { literatureSources } from "./literature-sources.ts";
import { families } from "./families.ts";
import { nodes } from "./structures.ts";
import { edges } from "./relationships.ts";
import { coordinateModels } from "./models.ts";
import { expansionNodes, expansionEdges } from "./expansion.ts";
import { breadthNodes, breadthEdges } from "./breadth.ts";
import { okamotoNodes, okamotoEdges, okamotoFlows } from "./okamoto.ts";

import type { Atlas } from "../types.ts";

/** Canonical dataset used by the UI, JSON export, tests, and standalone build. */
export const DATA: Atlas = {
  version: "1.6",
  date: "2026-11-09",
  sources: {
    ...sources,
    ...classificationSources,
    ...literatureSources,
    ...conceptSources,
    ...occupationSources,
  },
  families,
  nodes: [...nodes, ...expansionNodes, ...breadthNodes, ...okamotoNodes, ...classificationNodes],
  edges: [...edges, ...expansionEdges, ...breadthEdges, ...okamotoEdges, ...classificationEdges],
  collections,
  structureLabels,
  flows: okamotoFlows,
  models: coordinateModels,
};
