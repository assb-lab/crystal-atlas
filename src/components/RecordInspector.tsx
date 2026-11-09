import { useEffect, useState } from "react";
import { useAtlas } from "../store.ts";
import { getKnowledgeDB, resetKnowledgeDB } from "../knowledge/client.ts";
import { recordQuery, recordLabels } from "../knowledge/records.ts";
import { referenceHash, recordPath, type RecordReference } from "../knowledge/navigation.ts";
import {
  EVIDENCE_QUERY,
  ASSERTION_ENDPOINT_QUERY,
  CANDIDATE_EVIDENCE_QUERY,
} from "../knowledge/queries.ts";
import { EntityProfile } from "./EntityProfile.tsx";
import { RefChips } from "./RefChips.tsx";
import type { Ref } from "../types.ts";
import type { AtlasMode } from "../knowledge/schema.ts";
export function RecordInspector() {
  const { state, dispatch } = useAtlas();
  const ref = state.recordReference;
  const [result, setResult] = useState<{
    key: string;
    row: Record<string, unknown> | null;
    refs: Ref[];
    endpoints: Record<string, unknown>[];
    history: Record<string, unknown>[];
  } | null>(null);
  const [failure, setFailure] = useState<{ key: string; message: string } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const key = ref ? `${ref.kind}:${ref.id}` : "";
  const error = failure?.key === key ? failure.message : "";
  useEffect(() => {
    if (!ref) return;
    let live = true;
    const current = ref;
    void getKnowledgeDB()
      .then(async (db) => {
        const [rows, evidence, endpoints] = await Promise.all([
          db.query(recordQuery(current.kind), { id: current.id }),
          current.kind === "assertion"
            ? db.query(EVIDENCE_QUERY, { id: current.id })
            : current.kind === "candidate"
              ? db.query(CANDIDATE_EVIDENCE_QUERY, { id: current.id })
              : current.kind === "mention"
                ? db.query(
                    "MATCH (s:SourceSpan)-[:ContainsMention]->(m:Mention {id:$id}) RETURN s.payload AS reference",
                    { id: current.id },
                  )
                : Promise.resolve([]),
          current.kind === "assertion"
            ? db.query(ASSERTION_ENDPOINT_QUERY, { id: current.id })
            : Promise.resolve([]),
        ]);
        const history =
          current.kind === "mention" || current.kind === "candidate"
            ? await db.query(
                "MATCH (d:CandidateDecision {candidateId:$id}) RETURN d.id AS id,d.payload AS payload ORDER BY d.id",
                { id: current.id },
              )
            : [];
        if (live) {
          setFailure(null);
          setResult({
            key,
            row: rows[0] ?? null,
            refs: evidence.map((r) => JSON.parse(String(r.reference))),
            endpoints,
            history,
          });
        }
      })
      .catch((e) => {
        if (live) setFailure({ key, message: String(e) });
      });
    return () => {
      live = false;
    };
  }, [key, ref, attempt]);
  if (!ref) return null;
  const data = result?.key === key ? result : null;
  const open = (reference: RecordReference) => dispatch({ type: "recordReference", reference });
  return (
    <section className="record-inspector" aria-label="直接参照レコード">
      <div className="knowledge-heading">
        <h2>{recordLabels[ref.kind]} · 直接参照</h2>
        <button onClick={() => openClose()}>レコードを閉じる</button>
      </div>
      <p>
        <code>{ref.id}</code>
      </p>
      <a href={referenceHash(ref)}>このレコードの直接リンク</a>
      {location.protocol !== "file:" && (
        <a
          href={
            new URL(`${import.meta.env.BASE_URL}${recordPath(ref.kind, ref.id)}`, document.baseURI)
              .href
          }
        >
          静的な記録ページ
        </a>
      )}
      {error ? (
        <div role="alert">
          {error}
          <button onClick={() => void resetKnowledgeDB().then(() => setAttempt((n) => n + 1))}>
            レコード照会を再試行
          </button>
        </div>
      ) : !data ? (
        <p role="status">レコードを照会中…</p>
      ) : !data.row ? (
        <p>このIDのレコードは未登録です。別の版のリンクである可能性があります。</p>
      ) : (
        <div data-testid="record-ready">
          <h3>{String(data.row.title)}</h3>
          {ref.kind === "entity" && (
            <>
              <button
                onClick={() => {
                  dispatch({ type: "atlasMode", mode: ref.mode ?? "derivation", focusId: ref.id });
                  openClose();
                }}
              >
                Atlasでこの対象を見る
              </button>
              <EntityProfile id={ref.id} onSelect={(id) => open({ kind: "entity", id })} />
            </>
          )}
          {ref.kind === "scheme" && (
            <button
              onClick={() => {
                dispatch({ type: "atlasMode", mode: "family", focusId: ref.id });
                openClose();
              }}
            >
              Familyでこの体系を見る
            </button>
          )}
          {ref.kind === "document" && (
            <button
              onClick={() => {
                dispatch({ type: "source", id: ref.id, page: null, pdfPage: 1 });
                openClose();
              }}
            >
              文献とPDFの関連付けを見る
            </button>
          )}
          {data.endpoints.map((e, i) => (
            <div key={i}>
              <button onClick={() => open({ kind: "entity", id: String(e.subjectId) })}>
                {String(e.subjectTitle)}
              </button>{" "}
              →{" "}
              <button onClick={() => open({ kind: "entity", id: String(e.objectId) })}>
                {String(e.objectTitle)}
              </button>
              <button
                onClick={() => {
                  dispatch({
                    type: "atlasMode",
                    mode: (["family", "symmetry"].includes(String(e.domain))
                      ? e.domain
                      : "derivation") as AtlasMode,
                    focusId: String(e.subjectId),
                    assertionId: ref.id,
                  });
                  openClose();
                }}
              >
                Atlasでこの主張を見る
              </button>
            </div>
          ))}
          <RefChips refs={data.refs} />
          {ref.kind === "mention" || ref.kind === "candidate" ? (
            <p>
              元候補と現在の採否は別記録です。以下の判断履歴を参照してください。判断0件は未判断です。
            </p>
          ) : null}
          {!!data.history.length && (
            <details>
              <summary>判断の履歴（{data.history.length}件）</summary>
              {data.history.map((r) => (
                <pre key={String(r.id)}>
                  {JSON.stringify(JSON.parse(String(r.payload)), null, 2)}
                </pre>
              ))}
            </details>
          )}
          <details open>
            <summary>記録の内容と未確認事項</summary>
            <pre>
              {JSON.stringify(
                { ...data.row, payload: JSON.parse(String(data.row.payload)) },
                null,
                2,
              )}
            </pre>
          </details>
        </div>
      )}
    </section>
  );
  function openClose() {
    dispatch({ type: "recordReference", reference: null });
  }
}
