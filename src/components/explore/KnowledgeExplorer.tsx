import { EVIDENCE_QUERY } from "../../knowledge/queries.ts";
import { useEffect, useState } from "react";
import { DATA } from "../../data/atlas.ts";
import {
  getKnowledgeDB,
  queryRelationships,
  type KnowledgeDB,
  type RelationshipRecord,
} from "../../knowledge/client.ts";
import type { AtlasMode } from "../../knowledge/schema.ts";
import { useAtlas } from "../../store.ts";
import type { Ref } from "../../types.ts";
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
};
interface Detail {
  id: string;
  refs: Ref[];
  steps: Record<string, unknown>[];
  counterparts: Record<string, unknown>[];
}
const STEP_QUERY = `MATCH (a:Assertion {id: $id})-[h:HasStep]->(s:OperationStep)
RETURN s.operation AS operation, s.target AS target, s.parameters AS parameters, s.payload AS payload ORDER BY h.ordinal`;
const COUNTERPART_QUERY = `MATCH (s:Assertion)-[:ExplainsSymmetryOf]->(d:Assertion)
WHERE s.id = $id OR d.id = $id RETURN s.id AS symmetry, d.id AS derivation`;

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
  const [entities, setEntities] = useState<{ id: string; title: string }[]>([]);
  const [records, setRecords] = useState<RelationshipRecord[]>([]);
  const [active, setActive] = useState<string | null>(state.knowledgeAssertion);
  const [storedDetail, setDetail] = useState<Detail | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  const selected = records.find((r) => r.id === active) ?? records[0];
  const detail = storedDetail?.id === selected?.id ? storedDetail : null;

  useEffect(() => {
    let cancelled = false;
    void getKnowledgeDB()
      .then(async (database) => {
        const [list, rows] = await Promise.all([
          database.query(
            "MATCH (n:Entity) WHERE n.kind <> 'editorial_concept' RETURN n.id AS id, n.title AS title ORDER BY title",
          ),
          queryRelationships(database, mode, focus),
        ]);
        if (cancelled) return;
        setDB(database);
        setEntities(list as unknown as { id: string; title: string }[]);
        setRecords(rows);
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
    ])
      .then(([refs, steps, counterparts]) => {
        if (!cancelled)
          setDetail({
            id,
            refs: refs.map((r) => JSON.parse(String(r.reference)) as Ref),
            steps,
            counterparts,
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
    if (DATA.nodes.some((n) => n.id === id)) dispatch({ type: "selectNode", id });
  }
  const payload = selected ? (JSON.parse(selected.payload) as Record<string, unknown>) : {};
  return (
    <div className="knowledge-panel">
      <div className="knowledge-heading">
        <div>
          <h2>{COPY[mode][0]}</h2>
          <p>{COPY[mode][1]}</p>
        </div>
        {db && (
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
          {loading ? "出典付きレコードを読み込んでいます…" : `${records.length} 件の直接関係`}
        </span>
      </div>
      {error && (
        <div className="knowledge-error" role="alert">
          読み込みに失敗しました。{error}
          <button
            onClick={() => {
              setLoading(true);
              setError("");
              setRetry((n) => n + 1);
            }}
          >
            再試行
          </button>
        </div>
      )}
      {!loading && !error && (
        <div className="knowledge-body">
          <div className="knowledge-records" aria-label="関係レコード">
            {records.length ? (
              records.map((r) => (
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
                      {(JSON.parse(r.payload) as { undirected?: boolean }).undirected ? "↔" : "→"}
                    </span>{" "}
                    {r.objectTitle}
                  </span>
                  <small>
                    {r.label}
                    {r.basis === "editorial" ? " · 編集上の所属" : ""}
                  </small>
                </button>
              ))
            ) : (
              <p>
                この表示に対応する直接関係はまだ登録されていません。未報告・無関係という意味ではありません。
              </p>
            )}
          </div>
          {selected && (
            <article className="knowledge-detail" aria-label="関係の根拠">
              <h3>{selected.label}</h3>
              <p>{selected.description}</p>
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
              {detail?.steps.map((s, i) => (
                <div className="knowledge-step" key={i}>
                  <strong>
                    操作 {i + 1}：{OPERATION_LABELS[String(s.operation)] ?? String(s.operation)}
                  </strong>
                  <p>
                    対象：
                    {typeof s.target === "string"
                      ? (TARGET_LABELS[s.target] ?? s.target)
                      : "詳細未転記"}
                  </p>
                  {s.parameters !== "{}" && (
                    <dl>
                      {Object.entries(
                        JSON.parse(String(s.parameters)) as Record<string, number | number[]>,
                      ).map(([key, value]) => (
                        <div key={key}>
                          <dt>
                            {key === "fraction" ? "占有率" : key === "ratio" ? "組成比" : key}
                          </dt>
                          <dd>{Array.isArray(value) ? value.join(":") : value}</dd>
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
                  <p>この所属は編集上の整理です。文献による所属の再照合が必要です。</p>
                )
              ) : (
                <p role="status">根拠を読み込んでいます…</p>
              )}
              <small>既存収録データから移行した記述です。移行後の再照合は未実施です。</small>
            </article>
          )}
        </div>
      )}
      <p className="knowledge-coverage">
        既存の文献確認範囲を収録しています。refs全文の網羅調査・ページ単位の照合は未実施です。
      </p>
    </div>
  );
}
