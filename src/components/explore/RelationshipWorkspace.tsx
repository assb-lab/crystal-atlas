import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { DATA } from "../../data/atlas.ts";
import { getKnowledgeDB, resetKnowledgeDB } from "../../knowledge/client.ts";
import {
  CLASSIFICATION_SCHEMES_QUERY,
  FAMILY_ITEM_SCHEMES_QUERY,
  CLASSIFICATION_ITEMS_QUERY,
  CLASSIFICATION_CLAIMS_QUERY,
  ENTITY_CLASSIFICATIONS_QUERY,
  SYMMETRY_TREE_QUERY,
  EVIDENCE_QUERY,
  ASSERTION_ENDPOINT_QUERY,
} from "../../knowledge/queries.ts";
import { normalize } from "../../lib/format.ts";
import { useViewState } from "../../lib/view-state.ts";
import { connectedSystems, classificationSearchKey } from "../../lib/relationship-map.ts";
import { useAtlas } from "../../store.ts";
import { referenceHash } from "../../knowledge/navigation.ts";
import { entityKindLabel } from "../../knowledge/presentation.ts";
import { EntityProfile } from "../EntityProfile.tsx";
import { RefChips } from "../RefChips.tsx";
import { RelationshipDetail } from "./RelationshipDetail.tsx";
import { RelationshipMap } from "./RelationshipMap.tsx";
import type { DiagramEdge } from "./RelationshipMap.tsx";
import type { SymmetryMapping } from "../../knowledge/symmetry.ts";
import type { Ref } from "../../types.ts";
import "../../styles/atlas-workspace.css";
type Row = Record<string, unknown>;
interface Entity {
  id: string;
  title: string;
  kind: string;
  payload: string;
}
interface Scheme {
  id: string;
  title: string;
  payload: string;
}
interface Claim {
  id: string;
  operation: string;
  status: string;
  basis: string;
  description: string;
  subjectId: string;
  subjectTitle: string;
  objectId: string;
  objectTitle: string;
}
interface SymmetryEdge extends DiagramEdge {
  subjectTitle: string;
  objectTitle: string;
  mapping: SymmetryMapping;
}
const ENTITY_QUERY =
  "MATCH (e:Entity) WHERE e.kind <> 'editorial_concept' RETURN e.id AS id,e.title AS title,e.kind AS kind,e.payload AS payload ORDER BY e.title";
const basisLabel = (basis: string) =>
  basis === "editorial_navigation"
    ? "編集上の分類"
    : basis === "editorial_synthesis"
      ? "複数文献を使った編集上の整理"
      : "文献の分類体系";
const familyStatus = (status?: string) =>
  status === "imported_not_revalidated" ? "既存収録・未再照合" : "頁画像で限定確認";
export function RelationshipWorkspace({ mode }: { mode: "family" | "symmetry" }) {
  const { state, dispatch } = useAtlas();
  const visible = state.tab === "explore" && state.atlasMode === mode;
  const [focus, setFocus] = useViewState(mode + ":focus", mode === "family" ? "perov" : "diamond");
  const [selectionKind, setSelectionKind] = useViewState<"entity" | "relation">(
    mode + ":selection-kind",
    "relation",
  );
  const [active, setActive] = useViewState<string | null>(mode + ":active", null);
  const [history, setHistory] = useViewState<string[]>(mode + ":history", []);
  const [scheme, setScheme] = useViewState("family:scheme", "scheme:HS:1998:table1");
  const [category, setCategory] = useViewState("family:category", "class:HS:0");
  const [system, setSystem] = useViewState("symmetry:system", "diamond");
  const [collapsed, setCollapsed] = useViewState<string[]>("symmetry:collapsed", []);
  const [mobilePane, setMobilePane] = useViewState<"browse" | "detail">(mode + ":pane", "browse");
  const [browseOpen, setBrowseOpen] = useState(false);
  const [entityQuery, setEntityQuery] = useState("");
  const [classQuery, setClassQuery] = useState("");
  const [resultLimit, setResultLimit] = useState(30);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [edges, setEdges] = useState<SymmetryEdge[]>([]);
  const [family, setFamily] = useState<{ id: string; items: Row[]; claims: Claim[] } | null>(null);
  const [memberships, setMemberships] = useState<{ id: string; rows: Row[] } | null>(null);
  const [categoryEvidence, setCategoryEvidence] = useState<{ id: string; refs: Ref[] } | null>(
    null,
  );
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [ready, setReady] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const consumed = useRef(0);
  const navigation = useRef(0);
  const fail = useCallback((message: string) => setError(message), []);
  useEffect(() => {
    if (!visible) return;
    let live = true;
    void getKnowledgeDB()
      .then(async (db) => {
        const [ee, ss, graph] = await Promise.all([
          db.query(ENTITY_QUERY),
          mode === "family" ? db.query(CLASSIFICATION_SCHEMES_QUERY) : Promise.resolve([]),
          mode === "symmetry" ? db.query(SYMMETRY_TREE_QUERY) : Promise.resolve([]),
        ]);
        const gg = await Promise.all(
          graph.map(async (r) => {
            const mapping = JSON.parse(String(r.payload)) as SymmetryMapping;
            const refs = (await db.query(EVIDENCE_QUERY, { id: String(r.id) })).map(
              (s) => JSON.parse(String(s.reference)) as Ref,
            );
            const legacy = DATA.edges.find((e) => `relation:${e.id}` === r.id);
            return {
              id: String(r.id),
              subjectId: String(r.subjectId),
              objectId: String(r.objectId),
              subjectTitle: String(r.subjectTitle),
              objectTitle: String(r.objectTitle),
              mapping,
              label: mapping.index
                ? `${mapping.subgroupKind}${mapping.index}`
                : (legacy?.index ?? "種類・指数未転記"),
              source: [...new Set(refs.map((r) => DATA.sources[r.s]?.short ?? r.s))].join(" / "),
              checked: mapping.literatureState === "page_image_checked",
            };
          }),
        );
        if (live) {
          setEntities(ee as unknown as Entity[]);
          setSchemes(ss as unknown as Scheme[]);
          setEdges(gg);
          setError("");
          setReady(true);
        }
      })
      .catch((e) => {
        if (live) setError(String(e));
      });
    return () => {
      live = false;
    };
  }, [visible, mode, attempt]);
  useEffect(() => {
    if (!ready || mode !== "family") return;
    let live = true;
    void getKnowledgeDB()
      .then(async (db) => {
        const [items, claims] = await Promise.all([
          db.query(CLASSIFICATION_ITEMS_QUERY, { id: scheme }),
          db.query(CLASSIFICATION_CLAIMS_QUERY, { id: scheme }),
        ]);
        if (live) setFamily({ id: scheme, items, claims: claims as unknown as Claim[] });
      })
      .catch((e) => {
        if (live) setError(String(e));
      });
    return () => {
      live = false;
    };
  }, [scheme, ready, mode, attempt]);
  useEffect(() => {
    if (!ready || mode !== "family") return;
    let live = true;
    void getKnowledgeDB()
      .then((db) => db.query(ENTITY_CLASSIFICATIONS_QUERY, { id: focus }))
      .then((rows) => {
        if (live) setMemberships({ id: focus, rows });
      })
      .catch((e) => {
        if (live) setError(String(e));
      });
    return () => {
      live = false;
    };
  }, [focus, ready, mode, attempt]);
  useEffect(() => {
    if (!ready || mode !== "family" || family?.id !== scheme) return;
    const claim =
      family.claims.find((c) => c.operation === "included_in" && c.subjectId === category) ??
      family.claims.find((c) => c.objectId === category);
    let live = true;
    if (!claim) return;
    void getKnowledgeDB()
      .then((db) => db.query(EVIDENCE_QUERY, { id: claim.id }))
      .then((rows) => {
        if (live)
          setCategoryEvidence({
            id: category,
            refs: rows.map((r) => JSON.parse(String(r.reference)) as Ref),
          });
      })
      .catch((e) => {
        if (live) setError(String(e));
      });
    return () => {
      live = false;
    };
  }, [family, category, scheme, ready, mode]);
  useEffect(() => {
    const target = state.knowledgeTarget;
    if (!visible || !ready || !target || target.mode !== mode || target.seq === consumed.current)
      return;
    consumed.current = target.seq;
    const cancellation = new AbortController();
    void getKnowledgeDB()
      .then(async (db) => {
        const row = target.assertionId
          ? (await db.query(ASSERTION_ENDPOINT_QUERY, { id: target.assertionId }))[0]
          : null;
        if (cancellation.signal.aborted) return;
        const id = typeof row?.subjectId === "string" ? row.subjectId : target.id;
        setFocus(id);
        setActive(target.assertionId ?? null);
        setSelectionKind(target.assertionId ? "relation" : "entity");
        if (mode === "symmetry") {
          const found = connectedSystems(edges).find((s) => s.nodeIds.includes(id));
          setSystem(found?.id ?? `unregistered:${id}`);
        } else if (target.assertionId) {
          const result = await db.query(
            "MATCH (a:Assertion {id:$id})-[:ClaimInScheme]->(s:ClassificationScheme), (a)-[:Object]->(e:Entity) RETURN s.id AS schemeId,e.id AS itemId",
            { id: target.assertionId },
          );
          if (!cancellation.signal.aborted && result[0]) {
            setScheme(String(result[0].schemeId));
            setCategory(String(result[0].itemId));
          }
        }
      })
      .catch((e) => {
        if (!cancellation.signal.aborted) setError(String(e));
      });
    return () => {
      cancellation.abort();
    };
  }, [
    state.knowledgeTarget,
    visible,
    ready,
    mode,
    edges,
    setFocus,
    setActive,
    setSystem,
    setScheme,
    setCategory,
    setSelectionKind,
  ]);
  const schemesById = new Map(schemes.map((s) => [s.id, s]));
  const meta = schemesById.get(scheme);
  const schemeMeta = meta
    ? (JSON.parse(meta.payload) as {
        basis: string;
        scope: string;
        status?: string;
        documents: string[];
        items?: { id: string }[];
      })
    : null;
  const currentFamily = family?.id === scheme ? family : null;
  const entityById = useMemo(() => new Map(entities.map((e) => [e.id, e])), [entities]);
  const systems = useMemo(() => connectedSystems(edges), [edges]);
  const selectedSystem = systems.find((s) => s.id === system);
  const shownEdges =
    system === "all"
      ? edges
      : edges.filter((e) => selectedSystem?.edges.some((s) => s.id === e.id));
  const diagramNodes = [
    ...new Map(
      shownEdges
        .flatMap((e) => [
          {
            id: e.subjectId,
            title: e.subjectTitle,
            subtitle: DATA.nodes.find((n) => n.id === e.subjectId)?.sg,
          },
          {
            id: e.objectId,
            title: e.objectTitle,
            subtitle: DATA.nodes.find((n) => n.id === e.objectId)?.sg,
          },
        ])
        .map((n) => [n.id, n]),
    ).values(),
  ];
  const roots = currentFamily?.claims.filter((c) => c.operation === "included_in") ?? [];
  const categories =
    currentFamily?.items.map((item) => ({
      id: String(item.id),
      title: String(item.title),
      parent: roots.find((c) => c.subjectId === item.id),
      members: currentFamily.claims.filter(
        (c) => c.operation === "member_of" && c.objectId === item.id,
      ),
    })) ?? [];
  const itemIds = new Set(categories.map((c) => c.id));
  const depth = (id: string, seen = new Set<string>()): number => {
    const item = categories.find((c) => c.id === id);
    if (!item?.parent || !itemIds.has(item.parent.objectId) || seen.has(id)) return 0;
    return 1 + depth(item.parent.objectId, new Set([...seen, id]));
  };
  const order =
    schemeMeta?.items?.map((i) => i.id) ?? DATA.collections.map((c) => `collection:${c.id}`);
  categories.sort(
    (a, b) =>
      depth(a.id) - depth(b.id) ||
      (order.indexOf(a.id) < 0 ? 999 : order.indexOf(a.id)) -
        (order.indexOf(b.id) < 0 ? 999 : order.indexOf(b.id)),
  );
  const sortedSchemes = [...schemes].sort((a, b) => {
    const score = (s: Scheme) => {
      const p = JSON.parse(s.payload);
      return p.status !== "imported_not_revalidated"
        ? 0
        : p.basis === "literature_classification"
          ? 1
          : p.basis === "editorial_synthesis"
            ? 2
            : 3;
    };
    return score(a) - score(b);
  });
  const schemeTitle = (s: Scheme) => {
    const p = JSON.parse(s.payload);
    if (p.basis !== "editorial_synthesis") return s.title;
    return (
      p.documents.map((id: string) => DATA.sources[id]?.short ?? id).join(" / ") + " · 分類の整理"
    );
  };
  const selectedCategory = categories.find((c) => c.id === category);
  const searchRows = useMemo(
    () =>
      entities.map((e) => ({
        entity: e,
        primary: normalize(`${e.title} ${e.id}`),
        text: normalize(e.payload),
      })),
    [entities],
  );
  const candidates = useMemo(() => {
    const q = normalize(entityQuery);
    const score = (e: Entity) =>
      normalize(e.id) === q
        ? 0
        : normalize(e.title) === q
          ? 1
          : normalize(e.title).includes(q)
            ? 2
            : 3;
    return searchRows
      .filter((r) => r.primary.includes(q) || r.text.includes(q))
      .map((r) => r.entity)
      .sort((a, b) => score(a) - score(b));
  }, [searchRows, entityQuery]);
  const matchingCategories = categories.filter((c) =>
    classificationSearchKey(c.id + " " + c.title).includes(classificationSearchKey(classQuery)),
  );
  const focusEntity = entityById.get(focus);
  const currentMemberships = memberships?.id === focus ? memberships.rows : [];
  const chosenEdge =
    shownEdges.find((e) => e.id === active) ?? shownEdges.find((e) => e.checked) ?? shownEdges[0];
  const selectedAssertion = mode === "symmetry" ? chosenEdge?.id : active;
  const showEntity =
    mode === "symmetry"
      ? selectionKind === "entity"
      : !selectedCategory || selectedCategory.members.some((m) => m.subjectId === focus);
  const inspectedId =
    mode === "family" && selectedCategory && !showEntity ? selectedCategory.id : focus;
  function chooseEntity(id: string, remember = true) {
    const ticket = ++navigation.current;
    if (remember && id !== focus)
      setHistory((old) => (old.at(-1) === focus ? old : [...old, focus]));
    setFocus(id);
    setActive(null);
    setSelectionKind("entity");
    if (mode === "family") {
      setCategory(categories.some((c) => c.id === id) ? id : "");
      if (
        ["classification", "editorial_family"].includes(entityById.get(id)?.kind ?? "") &&
        !categories.some((c) => c.id === id)
      )
        void getKnowledgeDB()
          .then((db) => db.query(FAMILY_ITEM_SCHEMES_QUERY, { id }))
          .then((rows) => {
            if (navigation.current === ticket && rows[0]) {
              setScheme(String(rows[0].schemeId));
              setCategory(id);
            }
          })
          .catch((e) => {
            if (navigation.current === ticket) setError(String(e));
          });
    }
    setEntityQuery("");
    setBrowseOpen(false);
    if (mode === "symmetry") {
      const found = systems.find((s) => s.nodeIds.includes(id));
      setSystem(found?.id ?? `unregistered:${id}`);
    }
    setMobilePane("detail");
  }
  function chooseScheme(id: string, itemId?: string) {
    if (id === scheme && !itemId) return;
    navigation.current++;
    setScheme(id);
    setCategory(itemId ?? "");
    setActive(null);
    setClassQuery("");
    setMobilePane("browse");
    setBrowseOpen(false);
  }
  function chooseCategory(id: string) {
    navigation.current++;
    setCategory(id);
    setActive(null);
    setMobilePane("detail");
  }
  function chooseAssertion(id: string) {
    setActive(id);
    setSelectionKind("relation");
    setMobilePane("detail");
  }
  async function retry() {
    setError("");
    setReady(false);
    setFamily(null);
    await resetKnowledgeDB();
    setAttempt((n) => n + 1);
  }
  useEffect(() => {
    if (visible && !state.recordReference)
      window.history.replaceState(
        null,
        "",
        referenceHash({ kind: active ? "assertion" : "entity", id: active ?? focus, mode }),
      );
  }, [visible, state.recordReference, mode, focus, active]);
  return (
    <section
      className={`atlas-workspace atlas-workspace-${mode}`}
      hidden={!visible}
      aria-label={mode === "family" ? "Family · 分類" : "Symmetry · 対称性"}
    >
      <header
        className="atlas-workspace-heading"
        data-testid={ready && !error ? "knowledge-ready" : undefined}
      >
        <div>
          <span className="atlas-eyebrow">
            {mode === "family" ? "STRUCTURAL FAMILIES" : "SYMMETRY RELATIONSHIPS"}
          </span>
          <h2>
            {mode === "family"
              ? "文献の分類から、構造をたどる。"
              : "上位群から、対称性の変化をたどる。"}
          </h2>
        </div>
        <div>
          <button
            onClick={() => setBrowseOpen(!browseOpen)}
            aria-expanded={browseOpen}
            className="atlas-browse-toggle"
          >
            {mode === "family" ? "体系・構造を探す" : "系統・構造を探す"}
          </button>
          {ready && !error && <span className="atlas-ready">● 読み取り専用</span>}
        </div>
      </header>
      {error ? (
        <div className="knowledge-error atlas-load-error" role="alert">
          <h3>探索データを読み込めませんでした</h3>
          <p>{error}</p>
          <button onClick={() => void retry().catch((e) => setError(String(e)))}>再試行</button>
        </div>
      ) : !ready ? (
        <div className="atlas-skeleton" role="status">
          {mode === "family" ? "分類体系" : "関係図"}を読み込んでいます…
        </div>
      ) : (
        <>
          <div className={`atlas-workspace-body ${browseOpen ? "browse-open" : ""}`}>
            <aside
              className="atlas-browser"
              aria-label={mode === "family" ? "分類体系と構造の検索" : "対称性の系統と構造の検索"}
            >
              <div className="atlas-entity-picker">
                <label htmlFor="atlasEntitySearch">構造から探す</label>
                <input
                  id="atlasEntitySearch"
                  type="search"
                  autoComplete="off"
                  placeholder="構造名・組成・ID…"
                  value={entityQuery}
                  onChange={(e) => {
                    setEntityQuery(e.target.value);
                    setResultLimit(30);
                  }}
                />
                {entityQuery && (
                  <div className="atlas-search-results" aria-label="構造の検索結果">
                    <p aria-live="polite">
                      {candidates.length}件中 {Math.min(candidates.length, resultLimit)}件
                    </p>
                    {candidates.slice(0, resultLimit).map((e) => (
                      <button
                        data-atlas-entity={e.id}
                        key={e.id}
                        onClick={() => chooseEntity(e.id)}
                      >
                        {e.title}
                        <small>{entityKindLabel(e.kind)}</small>
                      </button>
                    ))}
                    {candidates.length > resultLimit && (
                      <button onClick={() => setResultLimit((n) => n + 30)}>
                        さらに30件を表示
                      </button>
                    )}
                    {!candidates.length && (
                      <p>一致する対象はありません。別名や組成でも検索できます。</p>
                    )}
                  </div>
                )}
                <div className="atlas-current-target">
                  <small>選択中の構造</small>
                  <strong data-testid="atlas-focus" data-entity-id={focus}>
                    {focusEntity?.title ?? focus}
                  </strong>
                  <button
                    disabled={!history.length}
                    onClick={() => {
                      const id = history.at(-1)!;
                      setHistory((h) => h.slice(0, -1));
                      chooseEntity(id, false);
                    }}
                  >
                    ← 前の構造
                  </button>
                </div>
              </div>
              {mode === "family" ? (
                <>
                  <h3>
                    分類体系 <span>{schemes.length}</span>
                  </h3>
                  <nav className="atlas-scheme-list" aria-label="分類体系を選ぶ">
                    {sortedSchemes.map((s) => {
                      const p = JSON.parse(s.payload);
                      return (
                        <button
                          key={s.id}
                          data-atlas-scheme={s.id}
                          aria-pressed={scheme === s.id}
                          onClick={() => chooseScheme(s.id)}
                        >
                          <span>{schemeTitle(s)}</span>
                          <small>{basisLabel(p.basis)}</small>
                        </button>
                      );
                    })}
                  </nav>
                </>
              ) : (
                <>
                  <h3>
                    系統 <span>{systems.length}</span>
                  </h3>
                  <p className="atlas-browser-note">
                    全 {edges.length} 対応。系統を選ぶと図を絞り込めます。
                  </p>
                  <nav className="atlas-scheme-list" aria-label="対称性の系統を選ぶ">
                    <button
                      data-atlas-system="all"
                      aria-pressed={system === "all"}
                      onClick={() => {
                        setSystem("all");
                        setSelectionKind("relation");
                        setActive(null);
                        setMobilePane("browse");
                        setBrowseOpen(false);
                      }}
                    >
                      すべての系統 <small>{edges.length}対応</small>
                    </button>
                    {systems.map((s) => (
                      <button
                        key={s.id}
                        data-atlas-system={s.id}
                        aria-pressed={system === s.id}
                        onClick={() => {
                          setSystem(s.id);
                          setSelectionKind("relation");
                          setActive(null);
                          setMobilePane("browse");
                          setBrowseOpen(false);
                        }}
                      >
                        <span>{entityById.get(s.id)?.title ?? s.id}</span>
                        <small>
                          {s.edges.length}対応 · {s.nodeIds.length}構造
                        </small>
                      </button>
                    ))}
                  </nav>
                </>
              )}
            </aside>
            <div className="atlas-mobile-tabs" role="group" aria-label="探索と詳細の切り替え">
              <button
                aria-pressed={mobilePane === "browse"}
                onClick={() => setMobilePane("browse")}
              >
                {mode === "family" ? "分類をたどる" : "関係図"}
              </button>
              <button
                aria-pressed={mobilePane === "detail"}
                onClick={() => setMobilePane("detail")}
              >
                選択の詳細
              </button>
            </div>
            <div className={`atlas-stage ${mobilePane === "browse" ? "mobile-active" : ""}`}>
              {mode === "family" ? (
                <section aria-label="文献別の分類体系">
                  <div className="atlas-stage-heading">
                    <div>
                      <span className="atlas-eyebrow">CLASSIFICATION</span>
                      <h3>{meta?.title ?? "分類体系"}</h3>
                    </div>
                    <span className={`atlas-badge ${schemeMeta?.status ? "muted" : "checked"}`}>
                      {familyStatus(schemeMeta?.status)}
                    </span>
                  </div>
                  {schemeMeta && (
                    <>
                      <p className="atlas-scope-label">{basisLabel(schemeMeta.basis)}</p>
                      <details className="atlas-scope-note">
                        <summary>この体系の範囲と出典</summary>
                        <p>{schemeMeta.scope}</p>
                        {schemeMeta.documents.map((id) => (
                          <button
                            key={id}
                            onClick={() => dispatch({ type: "source", id, page: null, pdfPage: 1 })}
                          >
                            {DATA.sources[id]?.short ?? id}の文献を見る ↗
                          </button>
                        ))}
                      </details>
                    </>
                  )}
                  <div className="atlas-class-toolbar">
                    <label htmlFor="atlasClassSearch">分類項目を絞り込む</label>
                    <input
                      id="atlasClassSearch"
                      type="search"
                      autoComplete="off"
                      placeholder="回転系・分類名…"
                      value={classQuery}
                      onChange={(e) => setClassQuery(e.target.value)}
                    />
                  </div>
                  {currentFamily ? (
                    <div data-testid="scheme-ready" data-scheme={scheme}>
                      <p className="atlas-count" aria-live="polite">
                        {matchingCategories.length} / {categories.length} 分類項目 · 所属と包含{" "}
                        {currentFamily.claims.length}件
                      </p>
                      <div className="atlas-class-grid">
                        {matchingCategories.map((c) => (
                          <button
                            data-atlas-class={c.id}
                            key={c.id}
                            aria-pressed={category === c.id}
                            className={!c.parent ? "atlas-root-class" : ""}
                            onClick={() => chooseCategory(c.id)}
                          >
                            <small>
                              {c.parent ? `包含先：${c.parent.objectTitle}` : "分類の入口"}
                            </small>
                            <strong>{c.title}</strong>
                            <span>
                              {c.members.length}構造
                              {roots.some((r) => r.objectId === c.id)
                                ? ` · 下位分類 ${roots.filter((r) => r.objectId === c.id).length}`
                                : ""}
                              <i aria-hidden="true">↗</i>
                            </span>
                          </button>
                        ))}
                      </div>
                      {!matchingCategories.length && (
                        <p>
                          一致する分類項目はありません。絞り込みを解除して全項目を表示できます。
                        </p>
                      )}
                    </div>
                  ) : (
                    <p role="status">分類項目を照会中…</p>
                  )}
                </section>
              ) : (
                <>
                  <div className="atlas-stage-heading">
                    <div>
                      <span className="atlas-eyebrow">BÄRNIGHAUSEN TREE</span>
                      <h3>
                        {system === "all"
                          ? "すべての対称性対応"
                          : `${entityById.get(system)?.title ?? focusEntity?.title ?? "選択対象"}の系統`}
                      </h3>
                    </div>
                    <span className="atlas-count">{shownEdges.length}対応</span>
                  </div>
                  {shownEdges.length ? (
                    <RelationshipMap
                      key={system}
                      nodes={diagramNodes}
                      edges={shownEdges}
                      active={chosenEdge?.id ?? null}
                      focus={focus}
                      collapsed={collapsed}
                      onFold={(id) =>
                        setCollapsed((old) =>
                          old.includes(id) ? old.filter((x) => x !== id) : [...old, id],
                        )
                      }
                      onExpand={() => setCollapsed([])}
                      onSelect={chooseAssertion}
                      onFocus={chooseEntity}
                    />
                  ) : (
                    <div className="atlas-empty">
                      <h3>この構造の対応は未登録です</h3>
                      <p>
                        無関係・未報告という意味ではありません。左の系統から登録済みの対応を探索できます。
                      </p>
                      <button onClick={() => setSystem("diamond")}>
                        diamondの限定確認例を見る
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
            <aside
              className={`atlas-inspector ${mobilePane === "detail" ? "mobile-active" : ""}`}
              aria-label="選択の詳細"
            >
              <div className="atlas-inspector-heading">
                <span className="atlas-eyebrow">INSPECTOR</span>
                <button onClick={() => setMobilePane("browse")} className="atlas-back-to-map">
                  ← {mode === "family" ? "分類" : "図"}に戻る
                </button>
              </div>
              {mode === "family" ? (
                <>
                  {selectedCategory ? (
                    <>
                      <span className={`atlas-badge ${schemeMeta?.status ? "muted" : "checked"}`}>
                        {familyStatus(schemeMeta?.status)}
                      </span>
                      <h3>{selectedCategory.title}</h3>
                      {selectedCategory.parent && (
                        <button
                          className="atlas-category-parent"
                          onClick={() => {
                            const id = selectedCategory.parent!.objectId;
                            if (categories.some((c) => c.id === id)) chooseCategory(id);
                            else chooseEntity(id);
                          }}
                        >
                          ← 上位の分類：{selectedCategory.parent.objectTitle}
                        </button>
                      )}
                      <h4>
                        所属する構造 <span>{selectedCategory.members.length}</span>
                      </h4>
                      {selectedCategory.members.length ? (
                        <div className="atlas-members">
                          {selectedCategory.members.map((m) => (
                            <button
                              key={m.id}
                              data-atlas-member={m.subjectId}
                              data-knowledge-record={m.id}
                              aria-pressed={focus === m.subjectId}
                              onClick={() => {
                                setFocus(m.subjectId);
                                setActive(m.id);
                              }}
                            >
                              {m.subjectTitle}
                              <small>
                                {m.basis === "editorial"
                                  ? "編集上の所属"
                                  : m.status === "imported_not_revalidated"
                                    ? "既存記録・未再照合"
                                    : "文献を限定照合"}
                              </small>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p>
                          この項目の具体的な所属構造は未登録です。下位分類や他体系を選ぶと、登録された例を探索できます。
                        </p>
                      )}
                      {categoryEvidence?.id === category && (
                        <RefChips refs={categoryEvidence.refs} />
                      )}
                    </>
                  ) : (
                    <div className="atlas-empty">
                      <h3>分類項目を選んでください</h3>
                      <p>分類から所属する構造と根拠をたどれます。</p>
                    </div>
                  )}
                  {showEntity && (
                    <details className="atlas-membership-comparison">
                      <summary>同じ構造の所属を比較（{currentMemberships.length}件）</summary>
                      <h4>{focusEntity?.title ?? focus}の所属</h4>
                      {memberships?.id === focus ? (
                        <>
                          {currentMemberships.length ? (
                            <div className="atlas-membership-list">
                              {currentMemberships.map((m) => (
                                <button
                                  key={String(m.id)}
                                  onClick={() => {
                                    chooseScheme(String(m.schemeId), String(m.itemId));
                                    setMobilePane("detail");
                                  }}
                                >
                                  <span>{String(m.itemTitle)}</span>
                                  <small>
                                    {String(m.schemeTitle)} ·{" "}
                                    {m.basis === "editorial"
                                      ? "編集上の所属"
                                      : m.status === "imported_not_revalidated"
                                        ? "未再照合"
                                        : "文献の限定確認"}
                                  </small>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p>この対象の所属は未登録です。未報告という意味ではありません。</p>
                          )}
                        </>
                      ) : (
                        <p role="status">所属を照会中…</p>
                      )}
                    </details>
                  )}
                  {active && (
                    <details>
                      <summary>選択した所属の根拠</summary>
                      <RelationshipDetail
                        key={active}
                        id={active}
                        onFocus={chooseEntity}
                        onFailure={fail}
                      />
                    </details>
                  )}
                </>
              ) : selectionKind === "entity" ? (
                <>
                  <span className="atlas-badge">{entityKindLabel(focusEntity?.kind ?? "")}</span>
                  <h3>{focusEntity?.title ?? focus}</h3>
                  <h4>この構造の対称性対応</h4>
                  <div className="atlas-members">
                    {edges
                      .filter((e) => e.subjectId === focus || e.objectId === focus)
                      .map((e) => (
                        <button
                          key={e.id}
                          data-atlas-related={e.id}
                          onClick={() => chooseAssertion(e.id)}
                        >
                          {e.subjectTitle} → {e.objectTitle}
                          <small>
                            {e.label} · {e.source}
                          </small>
                        </button>
                      ))}
                  </div>
                  {!edges.some((e) => e.subjectId === focus || e.objectId === focus) && (
                    <p>この構造の直接対応は未登録です。無関係・未報告という意味ではありません。</p>
                  )}
                </>
              ) : selectedAssertion ? (
                <RelationshipDetail
                  key={selectedAssertion}
                  id={selectedAssertion}
                  onFocus={chooseEntity}
                  onFailure={fail}
                />
              ) : (
                <p>図の構造または矢印を選択してください。</p>
              )}
              <div className="atlas-detail-actions">
                <button
                  onClick={() =>
                    dispatch({
                      type: "recordReference",
                      reference: { kind: "entity", id: inspectedId, mode },
                    })
                  }
                >
                  対象の直接リンク・原記録
                </button>
                {showEntity && (
                  <button
                    onClick={() =>
                      dispatch({ type: "atlasMode", mode: "derivation", focusId: focus })
                    }
                  >
                    この構造をDerivationで見る ↗
                  </button>
                )}
              </div>
              {showEntity && (
                <details open={profileOpen} onToggle={(e) => setProfileOpen(e.currentTarget.open)}>
                  <summary>構造の説明・模型の由来</summary>
                  {profileOpen && <EntityProfile key={focus} id={focus} onSelect={chooseEntity} />}
                </details>
              )}
            </aside>
          </div>
          <footer className="atlas-workspace-footer">
            {mode === "family"
              ? "分類の所属・包含を表示しています。派生操作とは別の関係です。"
              : "図の矢印は群–部分群の記述です。合成経路や実相転移の時間順を意味しません。"}{" "}
            文献の網羅照合は未完了です。
            <details>
              <summary>収録範囲・対象の識別状況</summary>
              <p data-testid="identity-inventory">
                物質・相を未分離の既存カード{" "}
                {entities.filter((e) => e.kind === "legacy_material_or_phase").length}{" "}
                件。未分離は同一性が確認済みという意味ではありません。出典・模型・検証の範囲は個別記録で確認できます。
              </p>
            </details>
          </footer>
        </>
      )}
    </section>
  );
}
