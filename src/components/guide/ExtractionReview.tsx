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
  CURRENT_DECISIONS_QUERY,
  DECISION_RESULT_QUERY,
  ADOPTED_ASSERTION_QUERY,
  DECISION_EVIDENCE_QUERY,
  OCCUPATION_QUERY,
  LABEL_MAP_QUERY,
} from "../../knowledge/queries.ts";
import type { ExtractionBatch } from "../../knowledge/extraction.ts";
import type { CandidateDecision } from "../../knowledge/decisions.ts";
import { operationLabels, parameterLabels, parameterValue } from "../../knowledge/presentation.ts";
import { useAtlas } from "../../store.ts";
import type { Ref } from "../../types.ts";
import { entityKindLabel } from "../../knowledge/presentation.ts";
import { LabelMapDetails } from "../LabelMapDetails.tsx";
import type { LabelMapSpec } from "../../knowledge/derivation.ts";
import { OccupationDetails } from "../OccupationDetails.tsx";
import type { OccupationSpec } from "../../knowledge/occupation.ts";
import { EntityProfile } from "../EntityProfile.tsx";
import { RefChips } from "../RefChips.tsx";

type Mention = ExtractionBatch["mentions"][number] & { reference: Ref; runId: string };
type Candidate = ExtractionBatch["relations"][number] & { runId: string };
type Decision = CandidateDecision & { reviewer: string; reviewedOn: string; limitations: string[] };
const outcomeLabels = { accepted: "採用", held: "保留", rejected: "却下" };
interface Records {
  runs: {
    id: string;
    scope: string;
    limitations: string[];
    operator: string;
    reviewedOn: string;
    activity: string;
  }[];
  mentions: Mention[];
  relations: Candidate[];
  decisions: Decision[];
  history: Decision[];
}
interface Detail {
  id: string;
  references: Ref[];
  matches: { id: string; title: string; note: string }[];
  results: { id: string; title: string; subjectId?: string; kind?: string }[];
  decisionReferences: Ref[];
  historyReferences: Record<string, Ref[]>;
  occupations: OccupationSpec[];
  labelMaps: LabelMapSpec[];
}
export function ExtractionReview({ assetId }: { assetId: string }) {
  const { dispatch } = useAtlas();
  const [records, setRecords] = useState<Records | null>(null);
  const [selectedRun, setSelectedRun] = useState("");
  const [selected, setSelected] = useState("");
  const [detail, setDetail] = useState<Detail | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    void getKnowledgeDB()
      .then(async (db) => {
        const [runs, mentions, relations, decisions, history] = await Promise.all([
          db.query(EXTRACTION_RUN_QUERY, { id: assetId }),
          db.query(MENTIONS_QUERY, { id: assetId }),
          db.query(RELATION_CANDIDATES_QUERY, { id: assetId }),
          db.query(CURRENT_DECISIONS_QUERY, { id: assetId }),
          db.query(DECISIONS_QUERY, { id: assetId }),
        ]);
        if (!active) return;
        const loaded: Records = {
          runs: runs.map((r) => ({ ...JSON.parse(String(r.payload)), id: String(r.id) })),
          mentions: mentions.map((m) => ({
            ...JSON.parse(String(m.payload)),
            reference: JSON.parse(String(m.reference)),
            runId: String(m.runId),
          })),
          relations: relations.map((r) => ({
            ...JSON.parse(String(r.payload)),
            runId: String(r.runId),
          })),
          decisions: decisions.map((d) => JSON.parse(String(d.payload))),
          history: history.map((d) => JSON.parse(String(d.payload))),
        };
        setError("");
        setRecords(loaded);
        const runId = loaded.runs[0]?.id ?? "";
        setSelectedRun(runId);
        setSelected(
          loaded.mentions.find((m) => m.runId === runId)?.id ??
            loaded.relations.find((r) => r.runId === runId)?.id ??
            "",
        );
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
        const [
          references,
          matches,
          results,
          decisionReferences,
          historyReferences,
          occupations,
          labelMaps,
        ] = await Promise.all([
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
          Promise.all(
            records.history
              .filter((d) => d.candidateId === selected)
              .map(
                async (d) =>
                  [
                    d.id,
                    (await db.query(DECISION_EVIDENCE_QUERY, { id: d.id })).map(
                      (r) => JSON.parse(String(r.reference)) as Ref,
                    ),
                  ] as const,
              ),
          ),
          decision?.resolution?.kind === "assertion"
            ? db.query(OCCUPATION_QUERY, { id: `adopted:${decision.candidateId}` })
            : Promise.resolve([]),
          decision?.resolution?.kind === "assertion"
            ? db.query(LABEL_MAP_QUERY, { id: `adopted:${decision.candidateId}` })
            : Promise.resolve([]),
        ]);
        if (active)
          setDetail({
            id: selected,
            results: results.map((r) => ({
              id: String(r.id),
              title: String(r.title),
              ...(typeof r.kind === "string" ? { kind: r.kind } : {}),
              ...(typeof r.subjectId === "string" ? { subjectId: r.subjectId } : {}),
            })),
            historyReferences: Object.fromEntries(historyReferences),
            labelMaps: labelMaps.map((r) => JSON.parse(String(r.payload)) as LabelMapSpec),
            occupations: occupations.map((r) => JSON.parse(String(r.payload)) as OccupationSpec),
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
  const scopedMentions = records?.mentions.filter((m) => m.runId === selectedRun) ?? [];
  const scopedRelations = records?.relations.filter((r) => r.runId === selectedRun) ?? [];
  const scopedIds = new Set([...scopedMentions, ...scopedRelations].map((r) => r.id));
  const scopedDecisions = records?.decisions.filter((d) => scopedIds.has(d.candidateId)) ?? [];

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
      ) : !records.runs.length ? (
        <p>この資産の抽出候補は未登録です。</p>
      ) : (
        <>
          <label htmlFor="extractionRun">処理範囲・版を選択（{records.runs.length}件すべて）</label>
          <select
            id="extractionRun"
            value={selectedRun}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedRun(id);
              setDetail(null);
              setSelected(
                records.mentions.find((m) => m.runId === id)?.id ??
                  records.relations.find((r) => r.runId === id)?.id ??
                  "",
              );
            }}
          >
            {records.runs.map((r) => (
              <option key={r.id} value={r.id}>
                {r.id} ·{" "}
                {r.activity === "manual_candidate_extraction"
                  ? "頁画像を確認した候補"
                  : "自動候補・未照合"}
              </option>
            ))}
          </select>
          <p data-testid="extraction-ready">
            登場記録 {scopedMentions.length} 件 ／ 関係候補 {scopedRelations.length} 件 ·
            現在の判断：採用 {scopedDecisions.filter((d) => d.outcome === "accepted").length} 件 ／
            保留 {scopedDecisions.filter((d) => d.outcome === "held").length} 件 ／ 却下{" "}
            {scopedDecisions.filter((d) => d.outcome === "rejected").length} 件 ／ 未判断{" "}
            {scopedMentions.length + scopedRelations.length - scopedDecisions.length} 件
          </p>
          <p>
            原表記と登場位置を保持し、判断履歴と現在の採用結果を別に表示します。採用範囲と未確認事項は各判断を参照してください。
          </p>
          {records.runs
            .filter((r) => r.id === selectedRun)
            .map((run, i) => (
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
          {!scopedIds.size && (
            <p>
              この処理範囲の候補は0件です。辞書の不一致や画像・OCRの未確認を含み、未掲載・調査完了の判定ではありません。
            </p>
          )}
          <label htmlFor="extractionCandidate">登場記録・関係候補を選択</label>
          <select
            id="extractionCandidate"
            disabled={!scopedIds.size}
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
          >
            <optgroup label="登場記録（現在の判断を参照）">
              {scopedMentions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.rawName} · PDF {m.reference.pdfPage} · {m.reference.sec}
                </option>
              ))}
            </optgroup>
            <optgroup label="関係候補（現在の判断を参照）">
              {scopedRelations.map((r) => (
                <option key={r.id} value={r.id}>
                  {operationLabels[r.operation] ?? r.operation} ·{" "}
                  {records.mentions.find((m) => m.id === r.subjectMention)?.rawName}{" "}
                  {r.domain === "comparison" ? "↔" : "→"}{" "}
                  {records.mentions.find((m) => m.id === r.objectMention)?.rawName}
                </option>
              ))}
            </optgroup>
          </select>
          {scopedIds.size > 0 && (
            <div data-testid="extraction-detail">
              {mention && (
                <>
                  <h4>{mention.rawName} · 登場記録（現在の判断を参照）</h4>
                  <p>{mention.identityNote}</p>
                </>
              )}
              {relation && (
                <>
                  <h4>
                    {operationLabels[relation.operation] ?? relation.operation} ·
                    関係候補（現在の判断を参照）
                  </h4>
                  <p>
                    {relation.basis === "editorial_comparison"
                      ? "編集上の比較候補（派生操作ではない）"
                      : relation.domain === "symmetry"
                        ? "文献記述を要約した対称性の候補"
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
                      <h4>現在の判断：{outcomeLabels[decision.outcome]}</h4>
                      <p>
                        {decision.reviewedOn} · {decision.reviewer} · 文献の文脈と既存レコードの照合
                      </p>
                      <p>{decision.reason}</p>
                      {decision.resolution && <p>採用範囲：{decision.resolution.scope}</p>}
                      {decision.resolution?.kind === "assertion" &&
                        decision.resolution.notes.map((note) => <p key={note}>{note}</p>)}
                      {decision.nextAction && <p>次に必要な作業：{decision.nextAction}</p>}
                      <RefChips refs={currentDetail.decisionReferences} />
                      {currentDetail.labelMaps.map((spec) => (
                        <LabelMapDetails key={spec.id} spec={spec} />
                      ))}
                      {currentDetail.occupations.map((spec) => (
                        <OccupationDetails key={spec.id} spec={spec} />
                      ))}
                      <h4>採用結果</h4>
                      {currentDetail.results.length ? (
                        currentDetail.results.map((result) => (
                          <div key={result.id}>
                            <p>
                              {result.title} <code>{result.id}</code>
                              {result.kind && ` · ${entityKindLabel(result.kind)}`}
                            </p>
                            {result.kind === "bravais_lattice_type" && (
                              <EntityProfile key={result.id} id={result.id} />
                            )}
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
                      <details data-testid="decision-history">
                        <summary>
                          判断の履歴（
                          {records.history.filter((d) => d.candidateId === selected).length}件）
                        </summary>
                        {records.history
                          .filter((d) => d.candidateId === selected)
                          .map((d) => (
                            <div key={d.id}>
                              <h4>
                                {d.id === decision.id ? "現在" : "改訂前"}：
                                {outcomeLabels[d.outcome]}
                              </h4>
                              <p>
                                {d.reviewedOn} · {d.reviewer}
                              </p>
                              <p>{d.reason}</p>
                              <code>{d.id}</code>
                              <RefChips refs={currentDetail.historyReferences[d.id] ?? []} />
                              {d.resolution && <p>採用範囲：{d.resolution.scope}</p>}
                              {d.nextAction && <p>当時の次の作業：{d.nextAction}</p>}
                            </div>
                          ))}
                      </details>
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
          )}
        </>
      )}
    </section>
  );
}
