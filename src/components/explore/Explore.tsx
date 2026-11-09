import { RelationshipWorkspace } from "./RelationshipWorkspace.tsx";
import { useAtlas } from "../../store.ts";
import { KnowledgeExplorer } from "./KnowledgeExplorer.tsx";
import { PackingExplorer } from "./PackingExplorer.tsx";

export function Explore() {
  const { state } = useAtlas();
  return (
    <>
      {state.atlasMode === "derivation" ? (
        <KnowledgeExplorer key={state.atlasMode} mode={state.atlasMode} />
      ) : (
        <RelationshipWorkspace key={state.atlasMode} mode={state.atlasMode} />
      )}
      <PackingExplorer />
    </>
  );
}
