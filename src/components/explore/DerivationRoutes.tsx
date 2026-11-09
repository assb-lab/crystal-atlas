import { useViewState } from "../../lib/view-state.ts";
import { useEffect, useState } from "react";
import { DATA } from "../../data/atlas.ts";
import { getKnowledgeDB } from "../../knowledge/client.ts";
import {
  ROUTES_QUERY,
  ROUTE_MEMBERS_QUERY,
  OPERATION_VOCABULARY_QUERY,
  VOCABULARY_EXAMPLES_QUERY,
} from "../../knowledge/queries.ts";
import { useAtlas } from "../../store.ts";
import type { Ref } from "../../types.ts";
import { RefChips } from "../RefChips.tsx";
interface Route {
  id: string;
  title: string;
  payload: string;
}
interface Member {
  id: string;
  label: string;
  domain: string;
  subjectId: string;
  subjectTitle: string;
  objectTitle: string;
  payload: string;
}
interface Vocabulary {
  id: string;
  title: string;
  payload: string;
}
export function DerivationRoutes() {
  const { dispatch } = useAtlas();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [route, setRoute] = useViewState("derivation:route", "route:recipe:fcc-nacl-sc");
  const [operation, setOperation] = useViewState(
    "derivation:operation",
    "operation:site_occupation",
  );
  const [detail, setDetail] = useState<{
    routeId: string;
    operationId: string;
    members: Member[];
    examples: { id: string; label: string; status: string }[];
  } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    void getKnowledgeDB()
      .then(async (db) => {
        const [r, v] = await Promise.all([
          db.query(ROUTES_QUERY),
          db.query(OPERATION_VOCABULARY_QUERY),
        ]);
        if (active) {
          setRoutes(r as unknown as Route[]);
          setVocabulary(v as unknown as Vocabulary[]);
        }
      })
      .catch((e: unknown) => {
        if (active) setError(String(e));
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    let active = true;
    void getKnowledgeDB()
      .then(async (db) => {
        const [members, examples] = await Promise.all([
          db.query(ROUTE_MEMBERS_QUERY, { id: route }),
          db.query(VOCABULARY_EXAMPLES_QUERY, { id: operation }),
        ]);
        if (active)
          setDetail({
            routeId: route,
            operationId: operation,
            members: members as unknown as Member[],
            examples: examples as unknown as { id: string; label: string; status: string }[],
          });
      })
      .catch((e: unknown) => {
        if (active) setError(String(e));
      });
    return () => {
      active = false;
    };
  }, [route, operation]);
  const selectedRoute = routes.find((r) => r.id === route);
  const selectedOp = vocabulary.find((v) => v.id === operation);
  const payload = selectedRoute
    ? (JSON.parse(selectedRoute.payload) as { basis?: string; desc?: string; refs?: Ref[] })
    : null;
  const op = selectedOp
    ? (JSON.parse(selectedOp.payload) as {
        meaning: string;
        fields: string[];
        limitations: string[];
      })
    : null;
  return (
    <section className="derivation-routes" aria-label="構築経路と操作の定義">
      <h3>構築経路と操作の定義</h3>
      {error ? (
        <p role="alert">{error}</p>
      ) : !routes.length ? (
        <p role="status">経路を照会中…</p>
      ) : (
        <>
          <label htmlFor="derivationRoute">文献図・構築レシピ（{routes.length}件すべて）</label>
          <select id="derivationRoute" value={route} onChange={(e) => setRoute(e.target.value)}>
            {routes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
          {payload && (
            <>
              <p>
                {payload.basis === "editorial_composition"
                  ? "編集上の順序付き構築レシピ"
                  : "文献図の提示順（分岐を含む）。一つの直線的な過程とはみなしません。"}
              </p>
              <p>{payload.desc}</p>
              <p>
                同じ到達構造への別の説明・共有する子孫を保持します。合成・相転移の時間順とは区別します。
              </p>
              <RefChips refs={payload.refs ?? []} />
            </>
          )}
          {detail?.routeId === route ? (
            <ol className="route-members">
              {detail.members.map((m) => (
                <li key={m.id}>
                  <p>
                    {m.subjectTitle} {JSON.parse(m.payload).undirected ? "↔" : "→"} {m.objectTitle}{" "}
                    · {m.label}
                  </p>
                  <button
                    className="small"
                    onClick={() => {
                      if (DATA.nodes.some((n) => n.id === m.subjectId))
                        dispatch({ type: "selectNode", id: m.subjectId, jump: false });
                      dispatch({
                        type: "atlasMode",
                        mode: m.domain === "symmetry" ? "symmetry" : "derivation",
                        assertionId: m.id,
                      });
                    }}
                  >
                    この手順の操作と根拠を見る
                  </button>
                </li>
              ))}
            </ol>
          ) : (
            <p role="status">手順を照会中…</p>
          )}
          <details>
            <summary>操作の語彙・必要な記録（{vocabulary.length}種類）</summary>
            <p>語彙の整理は編集上の定義です。既存の例を新たな採用・検証済み操作に変更しません。</p>
            <label htmlFor="operationDefinition">操作の定義</label>
            <select
              id="operationDefinition"
              value={operation}
              onChange={(e) => setOperation(e.target.value)}
            >
              {vocabulary.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.title}
                </option>
              ))}
            </select>
            {op && (
              <>
                <p>{op.meaning}</p>
                <ul>
                  {op.fields.map((field) => (
                    <li key={field}>必要な記録：{field}</li>
                  ))}
                </ul>
                {op.limitations.map((l) => (
                  <p key={l}>{l}</p>
                ))}
              </>
            )}
            {detail?.operationId === operation && (
              <ul>
                {detail.examples.map((example) => (
                  <li key={example.id}>
                    {example.label} <code>{example.id}</code> ·{" "}
                    {example.status === "imported_not_revalidated"
                      ? "既存記述・未再照合"
                      : "個別の検証状態を参照"}
                  </li>
                ))}
              </ul>
            )}
          </details>
        </>
      )}
    </section>
  );
}
