import { KnowledgeExplorer } from "./KnowledgeExplorer.tsx";
import { PackingExplorer } from "./PackingExplorer.tsx";
import { useAtlas } from "../../store.ts";

export function Explore() {
  const { state } = useAtlas();
  return (
    <>
      <KnowledgeExplorer
        key={`${state.atlasMode}:${state.knowledgeAssertion ?? "ordinary"}:${state.knowledgeAssertion ? state.tab : ""}`}
      />
      <PackingExplorer />
    </>
  );
}
