import { useViewState } from "../../lib/view-state.ts";
import { useEffect, useState } from "react";
import { getKnowledgeDB } from "../../knowledge/client.ts";
import { SYMMETRY_TREE_QUERY, EVIDENCE_QUERY } from "../../knowledge/queries.ts";
import { RefChips } from "../RefChips.tsx";
import type { Ref } from "../../types.ts";
import { useAtlas } from "../../store.ts";
import type { SymmetryMapping } from "../../knowledge/symmetry.ts";
type Edge = {
  id: string;
  label: string;
  mappingId: string;
  payload: string;
  subjectId: string;
  subjectTitle: string;
  objectId: string;
  objectTitle: string;
  refs: Ref[];
};
export function SymmetryTree() {
  const { dispatch } = useAtlas();
  const [edges, setEdges] = useState<Edge[]>([]);
  const [folded, setFolded] = useViewState<string[]>("symmetry:folded", []);
  const [error, setError] = useState("");
  useEffect(() => {
    let live = true;
    void getKnowledgeDB()
      .then(async (db) => {
        const rows = await db.query(SYMMETRY_TREE_QUERY);
        const all = await Promise.all(
          rows.map(
            async (r) =>
              ({
                ...r,
                refs: (await db.query(EVIDENCE_QUERY, { id: String(r.id) })).map(
                  (e) => JSON.parse(String(e.reference)) as Ref,
                ),
              }) as Edge,
          ),
        );
        if (live) setEdges(all);
      })
      .catch((e) => {
        if (live) setError(String(e));
      });
    return () => {
      live = false;
    };
  }, []);
  const roots = [...new Set(edges.map((e) => e.subjectId))].filter(
    (id) => !edges.some((e) => e.objectId === id),
  );
  const reachable = new Set<string>();
  function visit(id: string) {
    if (reachable.has(id)) return;
    reachable.add(id);
    edges.filter((e) => e.subjectId === id).forEach((e) => visit(e.objectId));
  }
  roots.forEach(visit);
  const residual = [...new Set(edges.map((e) => e.subjectId))].filter((id) => !reachable.has(id));
  const draw = (id: string, path: string[], ancestors: string[]): React.ReactNode => {
    const children = edges.filter((e) => e.subjectId === id);
    return (
      <ul>
        {children.map((e) => {
          const key = [...path, e.id].join("/");
          const mapping = JSON.parse(e.payload) as SymmetryMapping;
          const cycle = ancestors.includes(e.objectId);
          const shared = edges.filter((x) => x.objectId === e.objectId).length > 1;
          return (
            <li key={key}>
              <div className="symmetry-tree-edge" data-tree-edge={e.id}>
                <button
                  aria-expanded={!folded.includes(key)}
                  onClick={() =>
                    setFolded((old) =>
                      old.includes(key) ? old.filter((x) => x !== key) : [...old, key],
                    )
                  }
                >
                  {folded.includes(key) ? "＋ 展開" : "− 折り畳む"}
                </button>
                <span>
                  {e.subjectTitle} ↓{" "}
                  {mapping.subgroupKind === "unknown"
                    ? "種類・指数未転記"
                    : `${mapping.subgroupKind}${mapping.index}`}{" "}
                  ↓ {e.objectTitle}
                  {shared ? " · 共有対象" : ""}
                </span>
                <button
                  onClick={() => {
                    dispatch({ type: "selectNode", id: e.subjectId, jump: false });
                    dispatch({ type: "atlasMode", mode: "symmetry", assertionId: e.id });
                  }}
                >
                  この対応の設定と根拠
                </button>
                <RefChips refs={e.refs} />
                {!folded.includes(key) &&
                  (cycle ? (
                    <p>循環参照：この対象は上の枝にも登場します。</p>
                  ) : (
                    draw(e.objectId, [...path, e.id], [...ancestors, e.objectId])
                  ))}
              </div>
            </li>
          );
        })}
      </ul>
    );
  };
  return (
    <section className="symmetry-tree" aria-label="Bärnighausen tree">
      <h3>Bärnighausen tree · 上位から部分群へ</h3>
      <p>
        登録 {edges.length}{" "}
        対応すべて。出典別の別説明・共有対象を保持し、枝ごとに折り畳めます。深さの制限はありません。実相転移や時間順を意味しません。
      </p>
      {error ? (
        <p role="alert">{error}</p>
      ) : !edges.length ? (
        <p role="status">treeを照会中…</p>
      ) : (
        <>
          <button onClick={() => setFolded([])}>全枝を展開</button>
          {[...roots, ...residual].map((id) => (
            <div key={id}>{draw(id, [], [id])}</div>
          ))}
        </>
      )}
    </section>
  );
}
