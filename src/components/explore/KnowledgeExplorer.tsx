import {
  EVIDENCE_QUERY,
  STEP_QUERY,
  COUNTERPART_QUERY,
  OCCUPATION_QUERY,
} from "../../knowledge/queries.ts";
import {
  missingEvidenceLabel,
  stepProvenanceLabel,
  assertionProvenanceLabel,
  operationLabels,
  parameterLabels,
  parameterValue,
} from "../../knowledge/presentation.ts";
import { useEffect, useState } from "react";
import { DATA } from "../../data/atlas.ts";
import {
  getKnowledgeDB,
  resetKnowledgeDB,
  queryRelationships,
  type KnowledgeDB,
  type RelationshipRecord,
} from "../../knowledge/client.ts";
import type { AtlasMode } from "../../knowledge/schema.ts";
import { useAtlas } from "../../store.ts";
import type { Ref } from "../../types.ts";
import { OccupationDetails } from "../OccupationDetails.tsx";
import type { OccupationSpec } from "../../knowledge/occupation.ts";
import { EntityProfile } from "../EntityProfile.tsx";
import { RefChips } from "../RefChips.tsx";
import "../../styles/knowledge.css";

const COPY: Record<AtlasMode, [string, string]> = {
  family: ["Family · 分類", "構造の所属を、文献の分類と編集上の整理を区別して探索します。"],
  derivation: [
    "Derivation · 構造派生",
    "出発構造・派生操作・到達構造と、その根拠を探索します。矢印は合成経路や観測された相転移を意味しません。",
  ],
  symmetry: [
    "Symmetry · 対称性",
    "群–部分群関係とサイト対応を探索します。文献確認と、変換・サイト対応の検証状態を区別します。",
  ],
};
const OPERATION_LABELS: Record<string, string> = {
  occupation: "空隙・サイトの占有",
  ordering: "原子・サイトの規則化",
  distortion: "歪み・変位",
  stacking: "積層の変更",
  antitype: "原子の役割の反転",
};
const TARGET_LABELS: Record<string, string> = {
  octahedral_voids_of_anion_ccp: "アニオンccp骨格の八面体空隙",
  fcc_4a_orbit: "fcc構造の4a軌道",
  bcc_corner_and_body_center: "bcc配列の角と体心",
  octahedral_rotation: "配位八面体の回転",
  two_simple_cubic_sublattices: "二組の単純立方部分格子",
  two_fcc_sublattices: "二組の面心立方部分格子",
};
interface Detail {
  id: string;
  refs: Ref[];
  steps: Record<string, unknown>[];
  counterparts: Record<string, unknown>[];
  occupations: OccupationSpec[];
}

export function KnowledgeExplorer() {
  const { state } = useAtlas();
  const [expanded, setExpanded] = useState(state.knowledgeAssertion !== null);
  const mode = state.atlasMode;
  const title = COPY[mode][0];
  return (
    <section
      className={`knowledge-atlas knowledge-${mode}`}
      hidden={state.tab !== "explore"}
      aria-label={title}
    >
      {mode === "derivation" ? (
        <details open={expanded} onToggle={(e) => setExpanded(e.currentTarget.open)}>
          <summary>{title} — 操作と根拠のレコードを探索</summary>
          {expanded && state.tab === "explore" && (
            <KnowledgePanel key={`${mode}:${state.selected}`} mode={mode} />
          )}
        </details>
      ) : state.tab === "explore" ? (
        <KnowledgePanel key={`${mode}:${state.selected}`} mode={mode} />
      ) : null}
    </section>
  );
}

function KnowledgePanel({ mode }: { mode: AtlasMode }) {
  const { state, dispatch } = useAtlas();
  const [focus, setFocus] = useState(state.selected);
  const [db, setDB] = useState<KnowledgeDB | null>(null);
  const [entities, setEntities] = useState<{ id: string; title: string; kind: string }[]>([]);
  const [records, setRecords] = useState<RelationshipRecord[]>([]);
  const [comparisons, setComparisons] = useState<RelationshipRecord[]>([]);
  const [active, setActive] = useState<string | null>(state.knowledgeAssertion);
  const [storedDetail, setDetail] = useState<Detail | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  const selected =
    [...records, ...comparisons].find((r) => r.id === active) ?? records[0] ?? comparisons[0];
  const detail = storedDetail?.id === selected?.id ? storedDetail : null;

  useEffect(() => {
    let cancelled = false;
    void getKnowledgeDB()
      .then(async (database) => {
        const [list, rows, comparisonRows] = await Promise.all([
          database.query(
            "MATCH (n:Entity) WHERE n.kind <> 'editorial_concept' RETURN n.id AS id, n.title AS title, n.kind AS kind ORDER BY title",
          ),
          queryRelationships(database, mode, focus),
          mode === "derivation"
            ? queryRelationships(database, "comparison", focus)
            : Promise.resolve([]),
        ]);
        if (cancelled) return;
        setDB(database);
        setEntities(list as unknown as { id: string; title: string; kind: string }[]);
        setRecords(rows);
        setComparisons(comparisonRows);
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(String(e));
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [mode, focus, retry]);

  useEffect(() => {
    let cancelled = false;
    if (!db || !selected || loading) return;
    const id = selected.id;
    void Promise.all([
      db.query(EVIDENCE_QUERY, { id }),
      db.query(STEP_QUERY, { id }),
      db.query(COUNTERPART_QUERY, { id }),
      db.query(OCCUPATION_QUERY, { id }),
    ])
      .then(([refs, steps, counterparts, occupations]) => {
        if (!cancelled)
          setDetail({
            id,
            refs: refs.map((r) => JSON.parse(String(r.reference)) as Ref),
            steps,
            counterparts,
            occupations: occupations.map((r) => JSON.parse(String(r.payload)) as OccupationSpec),
          });
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [db, selected, loading]);

  function pick(id: string) {
    if (id === focus) return;
    setLoading(true);
    setError("");
    setFocus(id);
    if (DATA.nodes.some((n) => n.id === id))
      dispatch({ type: "selectNode", id, jump: mode === "derivation" });
  }
  const payload = selected ? (JSON.parse(selected.payload) as Record<string, unknown>) : {};
  return (
    <div className="knowledge-panel">
      <div className="knowledge-heading">
        <div>
          <h2>{COPY[mode][0]}</h2>
          <p>{COPY[mode][1]}</p>
        </div>
        {db && !error && (
          <span className="knowledge-status" data-testid="knowledge-ready">
            配布レコードを読み取り専用で閲覧
          </span>
        )}
      </div>
      <div className="knowledge-controls">
        <label htmlFor="knowledgeFocus">対象の構造・分類</label>
        <select
          id="knowledgeFocus"
          value={focus}
          onChange={(e) => pick(e.target.value)}
          disabled={!db || loading}
        >
          {!entities.length && (
            <option value={focus}>{DATA.nodes.find((n) => n.id === focus)?.name ?? focus}</option>
          )}
          {entities.map((n) => (
            <option key={n.id} value={n.id}>
              {n.title}
            </option>
          ))}
        </select>
        {focus !== state.selected && (
          <button
            className="small"
            onClick={() => {
              setLoading(true);
              setError("");
              setFocus(state.selected);
            }}
          >
            選択構造に戻る
          </button>
        )}
        <span role="status">
          {loading
            ? "出典付きレコードを読み込んでいます…"
            : `${records.length} 件の直接関係${comparisons.length ? ` / 比較 ${comparisons.length} 件` : ""}`}
        </span>
      </div>
      {error && (
        <div className="knowledge-error" role="alert">
          読み込みに失敗しました。{error}
          <button
            onClick={() => {
              setLoading(true);
              setError("");
              setDB(null);
              void resetKnowledgeDB()
                .then(() => setRetry((n) => n + 1))
                .catch((e: unknown) => {
                  setError(String(e));
                  setLoading(false);
                });
            }}
          >
            再試行
          </button>
        </div>
      )}
      {!loading && !error && (
        <p data-testid="identity-inventory">
          対象の識別状況：物質・相を未分離の既存カード{" "}
          {entities.filter((e) => e.kind === "legacy_material_or_phase").length}{" "}
          件。未分離は同一性が確認済みという意味ではありません。
        </p>
      )}
      {!loading && !error && <EntityProfile key={focus} id={focus} onSelect={pick} />}
      {!loading && !error && (
        <div className="knowledge-body">
          <div className="knowledge-records" aria-label="関係レコード">
            {records.length === 0 && (
              <p>
                この表示の対象となる直接関係は未登録です。比較関係は派生操作・対称性対応とは別に扱います。未報告・無関係という意味ではありません。
              </p>
            )}
            {[records, comparisons].map(
              (group, index) =>
                group.length > 0 && (
                  <section key={index} aria-label={index === 0 ? "直接関係" : "比較関係"}>
                    {index === 1 && <h3>比較（派生操作ではない）</h3>}
                    {group.map((r) => (
                      <button
                        key={r.id}
                        className={selected?.id === r.id ? "active" : ""}
                        data-knowledge-record={r.id}
                        onClick={() => setActive(r.id)}
                        aria-pressed={selected?.id === r.id}
                      >
                        <span>
                          {r.subjectTitle}{" "}
                          <span aria-hidden="true">
                            {(JSON.parse(r.payload) as { undirected?: boolean }).undirected
                              ? "↔"
                              : "→"}
                          </span>{" "}
                          {r.objectTitle}
                        </span>
                        <small>
                          {r.label}
                          {r.basis === "editorial" ? " · 編集上の所属" : ""}
                        </small>
                      </button>
                    ))}
                  </section>
                ),
            )}
          </div>
          {selected && (
            <article className="knowledge-detail" aria-label="関係の根拠">
              <h3>{selected.label}</h3>
              {selected.domain === "comparison" && (
                <p>
                  <strong>構造の比較です。派生操作を表す矢印ではありません。</strong>
                </p>
              )}
              <p>{selected.description}</p>
              {selected.status === "source_checked_not_machine_verified" && (
                <div className="knowledge-review">
                  <p>
                    {String(payload.reviewedOn)} · {String(payload.reviewer)} ·{" "}
                    {payload.adoptionRound === "held_relation_resolution"
                      ? "保留後の再照合による採用"
                      : "初回採用"}
                  </p>
                  <p>採用範囲：{String(payload.scope)}</p>
                  {Array.isArray(payload.limitations) && (
                    <details>
                      <summary>採用の制限と注記</summary>
                      <ul>
                        {payload.limitations.map((note, i) => (
                          <li key={i}>{String(note)}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              )}
              <div className="knowledge-endpoints">
                <button className="small" onClick={() => pick(selected.subjectId)}>
                  {selected.subjectTitle}
                </button>
                <span aria-hidden="true">{payload.undirected ? "↔" : "→"}</span>
                <button className="small" onClick={() => pick(selected.objectId)}>
                  {selected.objectTitle}
                </button>
              </div>
              {mode === "symmetry" && (
                <div className="knowledge-symmetry">
                  <p>
                    <strong>
                      {payload.verification === "literature_confirmed"
                        ? "群–部分群関係は文献確認済み"
                        : "群–部分群関係は未確認"}
                    </strong>
                  </p>
                  {typeof payload.index === "string" && <p>部分群の種類・指数：{payload.index}</p>}
                  {typeof payload.basis === "string" && <p>基底・原点の記述：{payload.basis}</p>}
                  {typeof payload.split === "string" && <p>サイト対応の記述：{payload.split}</p>}
                  <p>変換行列・Wyckoff対応の機械検証は未実施です。</p>
                </div>
              )}
              {detail?.occupations.map((spec) => (
                <OccupationDetails key={spec.id} spec={spec} />
              ))}
              {detail?.steps.map((s, i) => (
                <div className="knowledge-step" key={i}>
                  <strong>
                    操作 {i + 1}：
                    {OPERATION_LABELS[String(s.operation)] ??
                      operationLabels[String(s.operation)] ??
                      String(s.operation)}
                  </strong>
                  <p>{stepProvenanceLabel(String(s.payload))}</p>
                  <p>
                    対象：
                    {typeof s.target === "string"
                      ? detail?.occupations.some((spec) => spec.id === s.target)
                        ? "上記の骨格・空隙集合を参照"
                        : (TARGET_LABELS[s.target] ?? s.target)
                      : "詳細未転記"}
                  </p>
                  {s.parameters !== "{}" && (
                    <dl>
                      {Object.entries(
                        JSON.parse(String(s.parameters)) as Record<string, unknown>,
                      ).map(([key, value]) => (
                        <div key={key}>
                          <dt>
                            {key === "fraction"
                              ? "占有率"
                              : key === "ratio"
                                ? "組成比"
                                : (parameterLabels[key] ?? key)}
                          </dt>
                          <dd>
                            {key === "ratio" && Array.isArray(value)
                              ? value.join(":")
                              : parameterValue(value)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>
              ))}
              {detail?.counterparts.length ? (
                <button
                  className="small"
                  onClick={() =>
                    dispatch({
                      type: "atlasMode",
                      mode: mode === "symmetry" ? "derivation" : "symmetry",
                      assertionId: String(
                        mode === "symmetry"
                          ? detail.counterparts[0]!.derivation
                          : detail.counterparts[0]!.symmetry,
                      ),
                    })
                  }
                >
                  {mode === "symmetry" ? "対応する構造派生を見る" : "対応する対称性関係を見る"}
                </button>
              ) : null}
              {detail ? (
                detail.refs.length ? (
                  <RefChips refs={detail.refs} />
                ) : (
                  <p>{missingEvidenceLabel(selected.basis)}</p>
                )
              ) : (
                <p role="status">根拠を読み込んでいます…</p>
              )}
              <small>
                {assertionProvenanceLabel(
                  selected.status,
                  selected.basis,
                  typeof payload.adoptionRound === "string" ? payload.adoptionRound : undefined,
                )}
              </small>
            </article>
          )}
        </div>
      )}
      <p className="knowledge-coverage">
        既存収録と、選択範囲を照合して採用した記述を区別して表示します。refs全文の網羅調査は未完了です。
      </p>
    </div>
  );
}
