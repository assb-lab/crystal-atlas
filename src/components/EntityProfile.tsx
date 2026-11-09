import { useEffect, useState } from "react";
import { getKnowledgeDB } from "../knowledge/client.ts";
import {
  ENTITY_PROFILE_QUERY,
  RELATIONSHIP_QUERY,
  EVIDENCE_QUERY,
  MODEL_CONTEXT_QUERY,
  PROTOTYPE_MODEL_QUERY,
} from "../knowledge/queries.ts";
import type { RelationshipRecord } from "../knowledge/client.ts";
import type { Ref } from "../types.ts";
import { entityKindLabel } from "../knowledge/presentation.ts";
import { ModelProvenance, type ModelRecord } from "./ModelProvenance.tsx";
import { RefChips } from "./RefChips.tsx";

/** Descriptive context shared by the three Atlas views and source decisions. */
export function EntityProfile({ id, onSelect }: { id: string; onSelect?: (id: string) => void }) {
  const [focus, setFocus] = useState(id);
  const [record, setRecord] = useState<{
    id: string;
    kind: string;
    title: string;
    description?: string;
    scope?: string;
    conditions?: { temperatureK: number | null; pressurePa: number | null };
    models: ModelRecord[];
    relations: { record: RelationshipRecord; refs: Ref[] }[];
  } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    void getKnowledgeDB()
      .then(async (db) => {
        const [entities, relations, models, illustrations] = await Promise.all([
          db.query(ENTITY_PROFILE_QUERY, { id: focus }),
          db.query(RELATIONSHIP_QUERY, { id: focus, domain: "description" }),
          db.query(MODEL_CONTEXT_QUERY, { id: focus }),
          db.query(PROTOTYPE_MODEL_QUERY, { id: focus }),
        ]);
        const e = entities[0];
        if (!e) throw new Error("対象が見つかりません");
        const descriptions = await Promise.all(
          relations.map(async (r) => ({
            record: r as unknown as RelationshipRecord,
            refs: (await db.query(EVIDENCE_QUERY, { id: r.id })).map(
              (s) => JSON.parse(String(s.reference)) as Ref,
            ),
          })),
        );
        if (active) {
          const payload = JSON.parse(String(e.payload)) as {
            description?: string;
            scope?: string;
            conditions?: { temperatureK: number | null; pressurePa: number | null };
          };
          setRecord({
            id: focus,
            title: String(e.title),
            kind: String(e.kind),
            description: payload.description,
            scope: payload.scope,
            conditions: payload.conditions,
            models: [...models, ...illustrations].map((m) => ({
              id: String(m.id),
              kind: String(m.kind),
              payload: String(m.payload),
              ...(typeof m.note === "string" ? { note: m.note } : {}),
            })),
            relations: descriptions,
          });
          setError("");
        }
      })
      .catch((e: unknown) => {
        if (active) setError(String(e));
      });
    return () => {
      active = false;
    };
  }, [focus]);
  return (
    <section className="entity-profile" aria-label="対象の種類と記述上の対応">
      {error ? (
        <p role="alert">{error}</p>
      ) : record?.id !== focus ? (
        <p role="status">対象の種類を照会中…</p>
      ) : (
        <>
          <p>
            <strong>{record.title}</strong> · {entityKindLabel(record.kind)}{" "}
            <code>{record.id}</code>
          </p>
          {record.description && <p>{record.description}</p>}
          {record.conditions && (
            <p>
              相の条件：
              {record.conditions.temperatureK === null
                ? "温度未転記"
                : `${record.conditions.temperatureK} K`}{" "}
              /{" "}
              {record.conditions.pressurePa === null
                ? "圧力未転記"
                : `${record.conditions.pressurePa} Pa`}
              。不明な条件を室温・常圧とみなしません。
            </p>
          )}
          <ModelProvenance records={record.models} />
          {record.scope && <p>対象の範囲：{record.scope}</p>}
          {record.relations.map(({ record: r, refs }) => {
            const payload = JSON.parse(r.payload) as {
              scope: string;
              limitations: string[];
              reviewer: string;
              reviewedOn: string;
            };
            return (
              <div key={r.id} data-testid="entity-description">
                <h4>記述上の対応：{r.label}</h4>
                <p>{r.description}</p>
                <p>適用範囲：{payload.scope}</p>
                <p>
                  {payload.reviewedOn} · {payload.reviewer} · 文献の文脈に基づく解釈
                </p>
                <ul>
                  {payload.limitations.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
                <div className="knowledge-endpoints">
                  {[
                    [r.subjectId, r.subjectTitle],
                    [r.objectId, r.objectTitle],
                  ].map(([target, title]) => (
                    <button
                      key={target}
                      className="small"
                      onClick={() => {
                        if (onSelect) onSelect(target!);
                        else setFocus(target!);
                      }}
                    >
                      {title}
                    </button>
                  ))}
                </div>
                <RefChips refs={refs} />
              </div>
            );
          })}
        </>
      )}
    </section>
  );
}
