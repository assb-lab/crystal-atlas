import { useAtlas } from "../../store.ts";
import { KnowledgeExplorer } from "./KnowledgeExplorer.tsx";
import { PackingExplorer } from "./PackingExplorer.tsx";

export function Explore() {
  const { state } = useAtlas();
  return (
    <>
      <KnowledgeExplorer key={state.atlasMode} mode={state.atlasMode} />
      <PackingExplorer />
    </>
  );
}
