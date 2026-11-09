import { useEffect, useState } from "react";
import { getKnowledgeDB, resetKnowledgeDB } from "../../knowledge/client.ts";
import {
  EXTRACTION_RUN_QUERY,
  MENTIONS_QUERY,
  RELATION_CANDIDATES_QUERY,
  ENTITY_CANDIDATES_QUERY,
  CANDIDATE_EVIDENCE_QUERY,
  ASSERTION_MATCHES_QUERY,
} from "../../knowledge/queries.ts";
import type { ExtractionBatch } from "../../knowledge/extraction.ts";
import type { Ref } from "../../types.ts";
import { RefChips } from "../RefChips.tsx";

type Mention = ExtractionBatch["mentions"][number] & { reference: Ref };
type Candidate = ExtractionBatch["relations"][number];
interface Records {
  runs: { scope: string; limitations: string[]; operator: string; reviewedOn: string }[];
  mentions: Mention[];
  relations: Candidate[];
}
interface Detail {
  id: string;
  references: Ref[];
  matches: { id: string; title: string; note: string }[];
}
const operationLabels: Record<string, string> = {
  interpenetration: "貫入",
  species_identification: "同種原子によるサイト占有",
  void_occupation: "空隙占有",
  coordination_comparison: "配位の比較",
};
const parameterLabels: Record<string, string> = {
  shiftInSourceCell: "原文の単位胞に対する相対移動",
  representativeShift: "代表的な軸方向の相対移動",
  species: "部分格子の原子種",
  voidKind: "空隙の種類",
  occupiedOrientationClasses: "占有する空隙の向き",
  occupation: "占有の範囲",
};
function parameterValue(value: unknown): string {
  if (Array.isArray(value)) return `(${value.map(String).join(", ")})`;
  const labels: Record<string, string> = {
    same: "同種",
    different: "異種",
    tetrahedral: "四面体",
    octahedral: "八面体",
    both: "両方",
    one_of_two: "2種類のうち一方",
    all: "すべて",
  };
  return typeof value === "string" ? (labels[value] ?? value) : (JSON.stringify(value) ?? "未転記");
}
export function ExtractionReview({ assetId }: { assetId: string }) {
  const [records, setRecords] = useState<Records | null>(null);
  const [selected, setSelected] = useState("");
  const [detail, setDetail] = useState<Detail | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    void getKnowledgeDB()
      .then(async (db) => {
        const [runs, mentions, relations] = await Promise.all([
          db.query(EXTRACTION_RUN_QUERY, { id: assetId }),
          db.query(MENTIONS_QUERY, { id: assetId }),
          db.query(RELATION_CANDIDATES_QUERY, { id: assetId }),
        ]);
        if (!active) return;
        const loaded: Records = {
          runs: runs.map((r) => JSON.parse(String(r.payload))),
          mentions: mentions.map((m) => ({
            ...JSON.parse(String(m.payload)),
            reference: JSON.parse(String(m.reference)),
          })),
          relations: relations.map((r) => JSON.parse(String(r.payload))),
        };
        setError("");
        setRecords(loaded);
        setSelected(loaded.mentions[0]?.id ?? loaded.relations[0]?.id ?? "");
      })
      .catch((e: unknown) => {
        if (active) setError(String(e));
      });
    return () => {
      active = false;
    };
  }, [assetId, attempt]);
  useEffect(() => {
    if (!selected || !records) return;
    let active = true;
    const mention = records.mentions.find((m) => m.id === selected);
    void getKnowledgeDB()
      .then(async (db) => {
        const [references, matches] = mention
          ? [
              [{ reference: JSON.stringify(mention.reference) }],
              await db.query(ENTITY_CANDIDATES_QUERY, { id: selected }),
            ]
          : await Promise.all([
              db.query(CANDIDATE_EVIDENCE_QUERY, { id: selected }),
              db.query(ASSERTION_MATCHES_QUERY, { id: selected }),
            ]);
        if (active)
          setDetail({
            id: selected,
            references: references.map((r) => JSON.parse(String(r.reference))),
            matches: matches.map((r) => ({
              id: String(r.id),
              title: String(r.title ?? r.label),
              note: String(r.note),
            })),
          });
      })
      .catch((e: unknown) => {
        if (active) setError(String(e));
      });
    return () => {
      active = false;
    };
  }, [selected, records]);
  const mention = records?.mentions.find((m) => m.id === selected);
  const relation = records?.relations.find((r) => r.id === selected);
  const currentDetail = detail?.id === selected ? detail : null;
  return (
    <section className="extraction-review" aria-label="構造抽出候補">
      <h4>この資料の構造抽出候補</h4>
      {error ? (
        <div role="alert">
          <p>{error}</p>
          <button
            onClick={() => {
              setError("");
              setRecords(null);
              setDetail(null);
              void resetKnowledgeDB()
                .then(() => setAttempt((n) => n + 1))
                .catch((e: unknown) => setError(String(e)));
            }}
          >
            候補照会を再試行
          </button>
        </div>
      ) : !records ? (
        <p role="status">抽出候補を照会中…</p>
      ) : !records.mentions.length && !records.relations.length ? (
        <p>この資産の抽出候補は未登録です。</p>
      ) : (
        <>
          <p data-testid="extraction-ready">
            登場記録 {records.mentions.length} 件 ／ 関係候補 {records.relations.length} 件 ·
            全件未確定
          </p>
          <p>
            候補の対応先や既存関係は照合対象です。確定した名寄せ・科学的主張・相転移・合成経路を示すものではありません。
          </p>
          {records.runs.map((run, i) => (
            <details key={i}>
              <summary>抽出範囲と未解決事項</summary>
              <p>
                {run.reviewedOn} · {run.operator}
              </p>
              <p>{run.scope}</p>
              <ul>
                {run.limitations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </details>
          ))}
          <label htmlFor="extractionCandidate">登場記録・関係候補を選択</label>
          <select
            id="extractionCandidate"
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
          >
            <optgroup label="登場記録（対応未確定）">
              {records.mentions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.rawName} · PDF {m.reference.pdfPage} · {m.reference.sec}
                </option>
              ))}
            </optgroup>
            <optgroup label="関係候補（対応未確定）">
              {records.relations.map((r) => (
                <option key={r.id} value={r.id}>
                  {operationLabels[r.operation] ?? r.operation} ·{" "}
                  {records.mentions.find((m) => m.id === r.subjectMention)?.rawName}{" "}
                  {r.domain === "comparison" ? "↔" : "→"}{" "}
                  {records.mentions.find((m) => m.id === r.objectMention)?.rawName}
                </option>
              ))}
            </optgroup>
          </select>
          <div data-testid="extraction-detail">
            {mention && (
              <>
                <h4>{mention.rawName} · 登場記録（対応未確定）</h4>
                <p>{mention.identityNote}</p>
              </>
            )}
            {relation && (
              <>
                <h4>
                  {operationLabels[relation.operation] ?? relation.operation} ·
                  関係候補（対応未確定）
                </h4>
                <p>
                  {relation.basis === "editorial_comparison"
                    ? "編集上の比較候補（派生操作ではない）"
                    : "文献記述を要約した派生候補"}
                </p>
                <p>{relation.description}</p>
                {Object.keys(relation.parameters).length > 0 && (
                  <dl className="extraction-parameters">
                    {Object.entries(relation.parameters).map(([key, value]) => (
                      <div key={key}>
                        <dt>{parameterLabels[key] ?? key}</dt>
                        <dd>{parameterValue(value)}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {relation.symmetryNote && <p>{relation.symmetryNote}</p>}
                {relation.symmetryNote && (
                  <p>群対応の行列・原点・Wyckoff対応の検証は未実施です。</p>
                )}
              </>
            )}
            {!currentDetail ? (
              <p role="status">根拠と対応候補を照会中…</p>
            ) : (
              <>
                <RefChips refs={currentDetail.references} />
                <h4>{mention ? "既存構造への対応候補" : "既存関係との照合候補"}</h4>
                {currentDetail.matches.length ? (
                  <ul>
                    {currentDetail.matches.map((match) => (
                      <li key={match.id}>
                        <strong>{match.title}</strong> <code>{match.id}</code>
                        <p>{match.note}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>対応候補は未登録です。</p>
                )}
              </>
            )}
          </div>
        </>
      )}
    </section>
  );
}
