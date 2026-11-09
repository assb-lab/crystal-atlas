import { useEffect, useState } from "react";
import { getKnowledgeDB, resetKnowledgeDB } from "../../knowledge/client.ts";
import {
  EXTRACTION_RUN_QUERY,
  MENTIONS_QUERY,
  RELATION_CANDIDATES_QUERY,
  ENTITY_CANDIDATES_QUERY,
  CANDIDATE_EVIDENCE_QUERY,
  ASSERTION_MATCHES_QUERY,
  DECISIONS_QUERY,
  DECISION_RESULT_QUERY,
  ADOPTED_ASSERTION_QUERY,
  DECISION_EVIDENCE_QUERY,
} from "../../knowledge/queries.ts";
import type { ExtractionBatch } from "../../knowledge/extraction.ts";
import type { CandidateDecision } from "../../knowledge/decisions.ts";
import { operationLabels, parameterLabels, parameterValue } from "../../knowledge/presentation.ts";
import { useAtlas } from "../../store.ts";
import type { Ref } from "../../types.ts";
import { RefChips } from "../RefChips.tsx";

type Mention = ExtractionBatch["mentions"][number] & { reference: Ref };
type Candidate = ExtractionBatch["relations"][number];
type Decision = CandidateDecision & { reviewer: string; reviewedOn: string; limitations: string[] };
const outcomeLabels = { accepted: "採用", held: "保留", rejected: "却下" };
interface Records {
  runs: { scope: string; limitations: string[]; operator: string; reviewedOn: string }[];
  mentions: Mention[];
  relations: Candidate[];
  decisions: Decision[];
}
interface Detail {
  id: string;
  references: Ref[];
  matches: { id: string; title: string; note: string }[];
  results: { id: string; title: string; subjectId?: string }[];
  decisionReferences: Ref[];
}
export function ExtractionReview({ assetId }: { assetId: string }) {
  const { dispatch } = useAtlas();
  const [records, setRecords] = useState<Records | null>(null);
  const [selected, setSelected] = useState("");
  const [detail, setDetail] = useState<Detail | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    void getKnowledgeDB()
      .then(async (db) => {
        const [runs, mentions, relations, decisions] = await Promise.all([
          db.query(EXTRACTION_RUN_QUERY, { id: assetId }),
          db.query(MENTIONS_QUERY, { id: assetId }),
          db.query(RELATION_CANDIDATES_QUERY, { id: assetId }),
          db.query(DECISIONS_QUERY, { id: assetId }),
        ]);
        if (!active) return;
        const loaded: Records = {
          runs: runs.map((r) => JSON.parse(String(r.payload))),
          mentions: mentions.map((m) => ({
            ...JSON.parse(String(m.payload)),
            reference: JSON.parse(String(m.reference)),
          })),
          relations: relations.map((r) => JSON.parse(String(r.payload))),
          decisions: decisions.map((d) => JSON.parse(String(d.payload))),
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
        const decision = records.decisions.find((d) => d.candidateId === selected);
        const [references, matches, results, decisionReferences] = await Promise.all([
          mention
            ? Promise.resolve([{ reference: JSON.stringify(mention.reference) }])
            : db.query(CANDIDATE_EVIDENCE_QUERY, { id: selected }),
          db.query(mention ? ENTITY_CANDIDATES_QUERY : ASSERTION_MATCHES_QUERY, { id: selected }),
          decision
            ? db.query(mention ? DECISION_RESULT_QUERY : ADOPTED_ASSERTION_QUERY, {
                id: decision.id,
              })
            : Promise.resolve([]),
          decision ? db.query(DECISION_EVIDENCE_QUERY, { id: decision.id }) : Promise.resolve([]),
        ]);
        if (active)
          setDetail({
            id: selected,
            results: results.map((r) => ({
              id: String(r.id),
              title: String(r.title),
              ...(typeof r.subjectId === "string" ? { subjectId: r.subjectId } : {}),
            })),
            decisionReferences: decisionReferences.map((r) => JSON.parse(String(r.reference))),
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
  const decision = records?.decisions.find((d) => d.candidateId === selected);
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
            初回判断：採用 {records.decisions.filter((d) => d.outcome === "accepted").length} 件 ／
            保留 {records.decisions.filter((d) => d.outcome === "held").length} 件 ／ 却下{" "}
            {records.decisions.filter((d) => d.outcome === "rejected").length} 件 ／ 未判断{" "}
            {records.mentions.length + records.relations.length - records.decisions.length} 件
          </p>
          <p>
            原表記と登場位置を保持し、初回判断と採用結果を別に表示します。採用範囲と未確認事項は各判断を参照してください。
          </p>
          {records.runs.map((run, i) => (
            <details key={i}>
              <summary>抽出時の範囲と未解決事項</summary>
              <p>以下は候補抽出時の記録です。現在の判断は個別の採否欄に示します。</p>
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
            <optgroup label="登場記録（初回判断を参照）">
              {records.mentions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.rawName} · PDF {m.reference.pdfPage} · {m.reference.sec}
                </option>
              ))}
            </optgroup>
            <optgroup label="関係候補（初回判断を参照）">
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
                <h4>{mention.rawName} · 登場記録（初回判断を参照）</h4>
                <p>{mention.identityNote}</p>
              </>
            )}
            {relation && (
              <>
                <h4>
                  {operationLabels[relation.operation] ?? relation.operation} ·
                  関係候補（初回判断を参照）
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
                <h4>元候補の根拠</h4>
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
                {decision && (
                  <section
                    className="candidate-decision"
                    data-testid="candidate-decision"
                    aria-label="候補の採否判断"
                  >
                    <h4>初回判断：{outcomeLabels[decision.outcome]}</h4>
                    <p>
                      {decision.reviewedOn} · {decision.reviewer} · 文献の文脈と既存レコードの照合
                    </p>
                    <p>{decision.reason}</p>
                    {decision.resolution && <p>採用範囲：{decision.resolution.scope}</p>}
                    {decision.resolution?.kind === "assertion" &&
                      decision.resolution.notes.map((note) => <p key={note}>{note}</p>)}
                    {decision.nextAction && <p>次に必要な作業：{decision.nextAction}</p>}
                    <RefChips refs={currentDetail.decisionReferences} />
                    <h4>採用結果</h4>
                    {currentDetail.results.length ? (
                      currentDetail.results.map((result) => (
                        <div key={result.id}>
                          <p>
                            {result.title} <code>{result.id}</code>
                          </p>
                          {result.subjectId && (
                            <button
                              onClick={() => {
                                dispatch({
                                  type: "selectNode",
                                  id: result.subjectId!,
                                  jump: false,
                                });
                                dispatch({
                                  type: "atlasMode",
                                  mode: "derivation",
                                  assertionId: result.id,
                                });
                              }}
                            >
                              採用した関係をDerivationで見る
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <p>この判断から確定リンク・Assertionは生成していません。</p>
                    )}
                    <details>
                      <summary>判断の適用範囲と制限</summary>
                      <ul>
                        {decision.limitations.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </details>
                  </section>
                )}
              </>
            )}
          </div>
        </>
      )}
    </section>
  );
}
