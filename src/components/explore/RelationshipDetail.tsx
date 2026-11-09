import { useEffect, useState } from "react";
import { getKnowledgeDB } from "../../knowledge/client.ts";
import { recordQuery } from "../../knowledge/records.ts";
import {
  EVIDENCE_QUERY,
  COUNTERPART_QUERY,
  ASSERTION_ENDPOINT_QUERY,
} from "../../knowledge/queries.ts";
import { RefChips } from "../RefChips.tsx";
import { SymmetryDetails } from "./SymmetryDetails.tsx";
import { useAtlas } from "../../store.ts";
import { missingEvidenceLabel } from "../../knowledge/presentation.ts";
import type { Ref } from "../../types.ts";
export function RelationshipDetail({
  id,
  onFocus,
  onFailure,
}: {
  id: string;
  onFocus: (id: string) => void;
  onFailure: (error: string) => void;
}) {
  const { dispatch } = useAtlas();
  const [detail, setDetail] = useState<{
    id: string;
    row: Record<string, unknown>;
    refs: Ref[];
    links: Record<string, unknown>[];
    endpoints: Record<string, unknown>[];
  } | null>(null);
  useEffect(() => {
    let live = true;
    void getKnowledgeDB()
      .then(async (db) => {
        const [rows, refs, links, endpoints] = await Promise.all([
          db.query(recordQuery("assertion"), { id }),
          db.query(EVIDENCE_QUERY, { id }),
          db.query(COUNTERPART_QUERY, { id }),
          db.query(ASSERTION_ENDPOINT_QUERY, { id }),
        ]);
        if (live && rows[0])
          setDetail({
            id,
            row: rows[0],
            refs: refs.map((r) => JSON.parse(String(r.reference))),
            links,
            endpoints,
          });
      })
      .catch((e) => {
        if (live) onFailure(String(e));
      });
    return () => {
      live = false;
    };
  }, [id, onFailure]);
  if (detail?.id !== id) return <p role="status">選択した関係を照会中…</p>;
  const r = detail.row;
  const payload = JSON.parse(String(r.payload));
  return (
    <article className="knowledge-detail atlas-relation-detail" aria-label="関係の根拠">
      <span
        className={`atlas-badge ${r.status === "imported_not_revalidated" ? "muted" : "checked"}`}
      >
        {r.basis === "editorial"
          ? "編集上の所属"
          : r.status === "imported_not_revalidated"
            ? "既存収録・未再照合"
            : "原典を限定確認"}
      </span>
      <h3>{String(r.title)}</h3>
      <p>{String(r.description)}</p>
      {detail.endpoints.map((e, i) => (
        <div className="atlas-endpoint-pair" key={i}>
          <button onClick={() => onFocus(String(e.subjectId))}>{String(e.subjectTitle)}</button>
          <span aria-hidden="true">
            {r.domain === "family" ? (r.operation === "included_in" ? "⊂" : "∈") : "↓"}
          </span>
          <button onClick={() => onFocus(String(e.objectId))}>{String(e.objectTitle)}</button>
        </div>
      ))}
      <h4>この関係の出典</h4>
      {detail.refs.length ? (
        <RefChips refs={detail.refs} />
      ) : (
        <p>{missingEvidenceLabel(String(r.basis))}</p>
      )}
      {r.domain === "symmetry" && <SymmetryDetails assertionId={id} />}
      {detail.links.map((l, i) => (
        <button
          className="atlas-primary-action"
          key={i}
          onClick={() =>
            dispatch({
              type: "atlasMode",
              mode: r.domain === "symmetry" ? "derivation" : "symmetry",
              assertionId: String(r.domain === "symmetry" ? l.derivation : l.symmetry),
            })
          }
        >
          {r.domain === "symmetry" ? "対応する構造派生を見る" : "対応する対称性関係を見る"} ↗
        </button>
      ))}
      <details>
        <summary>解釈・未確認事項と原記録</summary>
        {payload.scope && <p>{payload.scope}</p>}
        {[...new Set<string>(payload.limitations ?? [])].map((l) => (
          <p key={l}>{l}</p>
        ))}
        {r.status === "imported_not_revalidated" && (
          <p>既存の文献記述を保持しています。移行後の数値検証・再照合は未実施です。</p>
        )}
        <button
          onClick={() =>
            dispatch({
              type: "recordReference",
              reference: {
                kind: "assertion",
                id,
                mode: r.domain === "family" ? "family" : "symmetry",
              },
            })
          }
        >
          直接リンク・原記録を開く
        </button>
      </details>
    </article>
  );
}
