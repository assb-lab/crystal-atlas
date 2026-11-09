import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DATA } from "../../data/atlas.ts";
import { getKnowledgeDB, resetKnowledgeDB } from "../../knowledge/client.ts";
import {
  CLASSIFICATION_SCHEMES_QUERY,
  ENTITY_CLASSIFICATIONS_QUERY,
  FAMILY_ENTITIES_QUERY,
  FAMILY_ITEMS_QUERY,
  FAMILY_CLAIMS_QUERY,
} from "../../knowledge/queries.ts";
import { referenceHash } from "../../knowledge/navigation.ts";
import { entityKindLabel } from "../../knowledge/presentation.ts";
import { classificationSearchKey } from "../../lib/relationship-map.ts";
import {
  familyPaths,
  membershipGroups,
  schemeNames,
  familyTopics,
  isFamilyItem,
  familyBasis,
  familyStatus,
} from "../../lib/family-navigation.ts";
import type {
  FamilyEntity,
  FamilyScheme,
  FamilyClaim,
  FamilySubject,
  FamilyPath,
} from "../../lib/family-navigation.ts";
import { useViewState } from "../../lib/view-state.ts";
import { useAtlas } from "../../store.ts";
import { EntityProfile } from "../EntityProfile.tsx";
import { RefChips } from "../RefChips.tsx";
import { RelationshipDetail } from "./RelationshipDetail.tsx";
import type { Ref } from "../../types.ts";
import "../../styles/atlas-workspace.css";
import "../../styles/family-workspace.css";
interface FamilyGraph {
  entities: FamilyEntity[];
  schemes: FamilyScheme[];
  items: { id: string; schemeId: string }[];
  claims: FamilyClaim[];
}
const subjectEqual = (a: FamilySubject, b: FamilySubject) => a.kind === b.kind && a.id === b.id;
export function FamilyWorkspace() {
  const { state, dispatch } = useAtlas();
  const visible = state.tab === "explore" && state.atlasMode === "family";
  const [subject, setSubject] = useViewState<FamilySubject>("family:subject", {
    kind: "entity",
    id: "perov",
  });
  const [history, setHistory] = useViewState<FamilySubject[]>("family:subject-history", []);
  const [active, setActive] = useViewState<string | null>("family:evidence", null);
  const [pane, setPane] = useViewState<"content" | "evidence">("family:content-pane", "content");
  const [profileOpen, setProfileOpen] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [classQuery, setClassQuery] = useState("");
  const [limit, setLimit] = useState(30);
  const [graph, setGraph] = useState<FamilyGraph | null>(null);
  const [loadedSubject, setLoadedSubject] = useState("");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!browseOpen) return;
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") setBrowseOpen(false);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [browseOpen]);
  const consumed = useRef(0);
  const stage = useRef<HTMLDivElement>(null);
  const fail = useCallback((message: string) => setError(message), []);
  useEffect(() => {
    if (!visible) return;
    let live = true;
    void getKnowledgeDB()
      .then(async (db) => {
        const [entities, schemes, items, claims] = await Promise.all([
          db.query(FAMILY_ENTITIES_QUERY),
          db.query(CLASSIFICATION_SCHEMES_QUERY),
          db.query(FAMILY_ITEMS_QUERY),
          db.query(FAMILY_CLAIMS_QUERY),
        ]);
        if (live) {
          setGraph({ entities, schemes, items, claims } as unknown as FamilyGraph);
          setError("");
        }
      })
      .catch((e) => {
        if (live) setError(String(e));
      });
    return () => {
      live = false;
    };
  }, [visible, attempt]);
  // Keep selection tied to a live read-only connection, including recovery after Worker failure.
  useEffect(() => {
    if (!visible || !graph) return;
    let live = true;
    void getKnowledgeDB()
      .then((db) => db.query(ENTITY_CLASSIFICATIONS_QUERY, { id: subject.id }))
      .then(() => {
        if (live) setLoadedSubject(subject.id);
      })
      .catch((e) => {
        if (live) setError(String(e));
      });
    return () => {
      live = false;
    };
  }, [visible, graph, subject.id, attempt]);
  const byId = useMemo(() => new Map(graph?.entities.map((e) => [e.id, e]) ?? []), [graph]);
  const schemes = useMemo(() => new Map(graph?.schemes.map((s) => [s.id, s]) ?? []), [graph]);
  const claims = useMemo(() => graph?.claims ?? [], [graph]);
  const itemScheme = (id: string) => graph?.items.find((i) => i.id === id)?.schemeId;
  const name = (id: string) => byId.get(id)?.title ?? id;
  const schemeName = (id: string) => schemeNames[id] ?? schemes.get(id)?.title ?? id;
  const kindName = (e: FamilyEntity) => (isFamilyItem(e) ? "分類項目" : entityKindLabel(e.kind));
  function navigate(next: FamilySubject, evidence: string | null = null, remember = true) {
    if (remember && !subjectEqual(subject, next)) setHistory((old) => [...old, subject]);
    setSubject(next);
    setActive(evidence);
    setQuery("");
    setClassQuery("");
    setBrowseOpen(false);
    setPane(profileOpen && next.kind === "entity" ? "evidence" : "content");
    stage.current?.scrollTo({ top: 0 });
    stage.current?.focus({ preventScroll: true });
  }
  function chooseEntity(id: string) {
    navigate({ kind: byId.get(id) && isFamilyItem(byId.get(id)!) ? "item" : "entity", id });
  }
  function evidence(id: string) {
    setActive(id);
    setPane("evidence");
  }
  useEffect(() => {
    const target = state.knowledgeTarget;
    if (
      !visible ||
      !graph ||
      !target ||
      target.mode !== "family" ||
      target.seq === consumed.current
    )
      return;
    consumed.current = target.seq;
    const claim = claims.find((c) => c.id === target.assertionId);
    const id =
      claim?.operation === "included_in" ? claim.subjectId : (claim?.subjectId ?? target.id);
    const next: FamilySubject = {
      kind: schemes.has(id)
        ? "scheme"
        : byId.get(id) && isFamilyItem(byId.get(id)!)
          ? "item"
          : "entity",
      id,
    };
    setSubject(next);
    setActive(claim?.id ?? null);
    setPane("content");
    setBrowseOpen(false);
  }, [
    visible,
    graph,
    state.knowledgeTarget,
    claims,
    byId,
    schemes,
    setSubject,
    setActive,
    setPane,
  ]);
  useEffect(() => {
    if (visible && !state.recordReference)
      window.history.replaceState(
        null,
        "",
        referenceHash({
          kind: subject.kind === "scheme" ? "scheme" : "entity",
          id: subject.id,
          mode: "family",
        }),
      );
  }, [visible, state.recordReference, subject]);
  const entity = byId.get(subject.id);
  const selectedScheme = subject.kind === "scheme" ? subject.id : itemScheme(subject.id);
  const scheme = selectedScheme ? schemes.get(selectedScheme) : null;
  const schemePayload = scheme ? JSON.parse(scheme.payload) : null;
  const groups = subject.kind === "entity" ? membershipGroups(subject.id, claims) : [];
  const usedSchemes = new Set(groups.map((g) => g.schemeId));
  const noMembership = graph?.schemes.filter((s) => !usedSchemes.has(s.id)) ?? [];
  const members = claims.filter((c) => c.operation === "member_of" && c.objectId === subject.id);
  const children = claims.filter((c) => c.operation === "included_in" && c.objectId === subject.id);
  const ownParents = claims.filter(
    (c) => c.operation === "included_in" && c.subjectId === subject.id,
  );
  const isHS = selectedScheme === "scheme:HS:1998:table1";
  const schemeItems =
    graph?.items
      .filter((i) => i.schemeId === selectedScheme)
      .map((i) => byId.get(i.id)!)
      .filter(Boolean) ?? [];
  const hsOrder = schemePayload?.items?.map((i: { id: string }) => i.id) as string[] | undefined;
  const orderedItems = [...schemeItems].sort((a, b) =>
    hsOrder ? hsOrder.indexOf(a.id) - hsOrder.indexOf(b.id) : 0,
  );
  const tableItems = orderedItems.filter((i) =>
    classificationSearchKey(i.title + " " + i.id).includes(classificationSearchKey(classQuery)),
  );
  const evidenceId =
    active ??
    (subject.kind === "entity"
      ? (groups.flatMap((g) => g.records).find((c) => c.status === "source_context_checked")?.id ??
        groups.flatMap((g) => g.records)[0]?.id)
      : ownParents[0]?.id);
  const selectedClaim = claims.find((c) => c.id === evidenceId);
  const payload = entity ? JSON.parse(entity.payload) : null;
  const itemRefs = (payload?.refs ?? []) as Ref[];
  const searchResults = useMemo(() => {
    if (!graph || !query.trim()) return [];
    const q = classificationSearchKey(query);
    const rows = [
      ...graph.entities.map((e) => ({
        id: e.id,
        title: e.title,
        kind: isFamilyItem(e) ? ("item" as const) : ("entity" as const),
        label: isFamilyItem(e) ? "分類項目" : entityKindLabel(e.kind),
        text: e.title + " " + e.id + " " + (isFamilyItem(e) ? "" : e.payload),
      })),
      ...graph.schemes.map((s) => ({
        id: s.id,
        title: schemeNames[s.id] ?? s.title,
        kind: "scheme" as const,
        label: "分類体系",
        text: (schemeNames[s.id] ?? "") + " " + s.title + " " + s.id,
      })),
    ];
    return rows
      .filter((r) => classificationSearchKey(r.text).includes(q))
      .sort((a, b) => {
        const score = (r: typeof a) =>
          classificationSearchKey(r.id) === q
            ? 0
            : classificationSearchKey(r.title).includes(q)
              ? 1
              : 2;
        return score(a) - score(b);
      });
  }, [graph, query]);
  function pathView(path: FamilyPath, contextScheme = selectedScheme) {
    return (
      <div className="family-path">
        {path.ids.map((id, i) => (
          <span key={id}>
            {i > 0 && (
              <span className="family-path-arrow" aria-hidden="true">
                ›
              </span>
            )}
            <button data-atlas-path={id} onClick={() => navigate({ kind: "item", id })}>
              {name(id)}
            </button>
            {itemScheme(id) && itemScheme(id) !== contextScheme && (
              <button
                className="family-path-origin"
                onClick={() => navigate({ kind: "scheme", id: itemScheme(id)! })}
              >
                別体系：{schemeName(itemScheme(id)!)}
              </button>
            )}
          </span>
        ))}
      </div>
    );
  }
  function itemButton(id: string) {
    return (
      <button key={id} data-atlas-class={id} onClick={() => navigate({ kind: "item", id })}>
        {name(id)} <span aria-hidden="true">→</span>
      </button>
    );
  }
  async function retry() {
    setError("");
    setGraph(null);
    setLoadedSubject("");
    await resetKnowledgeDB();
    setAttempt((n) => n + 1);
  }
  const ready = !!graph && !error;
  return (
    <section
      hidden={!visible}
      className="atlas-workspace family-workspace"
      aria-label="Family · 分類"
    >
      <header className="family-toolbar" data-testid={ready ? "knowledge-ready" : undefined}>
        <div>
          <span className="atlas-eyebrow">FAMILY</span>
          <h2>構造の所属と分類</h2>
        </div>
        <button
          onClick={() => {
            const previous = history.at(-1);
            if (previous) {
              setHistory((old) => old.slice(0, -1));
              navigate(previous, null, false);
            }
          }}
          disabled={!history.length}
        >
          ← 前へ
        </button>
        <button
          className="atlas-browse-toggle"
          aria-expanded={browseOpen}
          onClick={() => setBrowseOpen(!browseOpen)}
        >
          構造・分類を探す
        </button>
      </header>
      {error ? (
        <div className="knowledge-error" role="alert">
          <p>{error}</p>
          <button onClick={() => void retry()}>再試行</button>
          <button onClick={() => window.location.reload()}>再読み込み</button>
        </div>
      ) : !graph ? (
        <p role="status">分類と所属を照会中…</p>
      ) : (
        <>
          <div className="family-layout">
            {browseOpen && (
              <button
                className="family-browser-backdrop"
                aria-label="検索と目次を閉じる"
                onClick={() => setBrowseOpen(false)}
              />
            )}
            <aside
              className={`family-browser ${browseOpen ? "open" : ""}`}
              aria-label="構造検索と分類の目次"
            >
              <label htmlFor="atlasEntitySearch">構造・分類・体系を探す</label>
              <input
                id="atlasEntitySearch"
                type="search"
                autoComplete="off"
                name="family-search"
                spellCheck={false}
                placeholder="岩塩、NaCl、Glazer…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setLimit(30);
                }}
              />
              {query.trim() ? (
                <div className="family-results">
                  <p aria-live="polite">
                    {searchResults.length}件中 {Math.min(limit, searchResults.length)}件
                  </p>
                  {searchResults.slice(0, limit).map((r) => (
                    <button
                      key={r.id}
                      data-atlas-entity={r.id}
                      onClick={() => navigate({ kind: r.kind, id: r.id })}
                    >
                      <small>{r.label}</small>
                      <span>{r.title}</span>
                    </button>
                  ))}
                  {searchResults.length > limit && (
                    <button onClick={() => setLimit((n) => n + 30)}>さらに30件を表示</button>
                  )}
                  {!searchResults.length && (
                    <p>一致する構造・分類はありません。語を変えて検索してください。</p>
                  )}
                </div>
              ) : (
                <>
                  <h3>話題からたどる</h3>
                  <p className="family-nav-note">
                    Atlas編集の目次。文献の体系は別々に保持しています。
                  </p>
                  {familyTopics.map((topic) => (
                    <details
                      key={topic.title}
                      open={topic.title === "ペロブスカイト" ? true : undefined}
                    >
                      <summary>{topic.title}</summary>
                      {topic.entries.map((e) => (
                        <button
                          key={e.subject.id}
                          aria-pressed={subjectEqual(subject, e.subject)}
                          onClick={() => navigate(e.subject)}
                        >
                          {e.title}
                        </button>
                      ))}
                    </details>
                  ))}
                  <details>
                    <summary>Atlasのファミリー · 20</summary>
                    <p className="family-nav-note">
                      編集上の分類。文献による所属根拠とは区別します。
                    </p>
                    {Object.keys(DATA.families).map((id) => itemButton(`family:${id}`))}
                  </details>
                  <details className="family-all-schemes">
                    <summary>すべての分類体系 · {graph.schemes.length}</summary>
                    {graph.schemes.map((s) => (
                      <button
                        key={s.id}
                        data-atlas-scheme={s.id}
                        aria-pressed={selectedScheme === s.id}
                        onClick={() => navigate({ kind: "scheme", id: s.id })}
                      >
                        {schemeName(s.id)}
                        <small>{familyBasis(JSON.parse(s.payload).basis)}</small>
                      </button>
                    ))}
                  </details>
                </>
              )}
            </aside>
            <div className="family-mobile-tabs" role="group" aria-label="内容と根拠の切り替え">
              <button aria-pressed={pane === "content"} onClick={() => setPane("content")}>
                所属・分類
              </button>
              <button aria-pressed={pane === "evidence"} onClick={() => setPane("evidence")}>
                出典・詳しい説明
              </button>
            </div>
            <div
              ref={stage}
              tabIndex={-1}
              className={`family-content ${pane === "content" ? "mobile-active" : ""}`}
              data-testid="family-content"
              data-subject-kind={subject.kind}
              data-subject-id={subject.id}
            >
              <header className="family-subject">
                <span className="family-kind">
                  {subject.kind === "scheme"
                    ? "分類体系"
                    : subject.kind === "item"
                      ? "分類項目"
                      : entity
                        ? kindName(entity)
                        : "構造"}
                </span>
                <h3>{subject.kind === "scheme" ? schemeName(subject.id) : name(subject.id)}</h3>
                {subject.kind === "entity" && (
                  <div className="family-actions">
                    <button
                      onClick={() => {
                        setProfileOpen(true);
                        setPane("evidence");
                      }}
                    >
                      模型・詳しい説明
                    </button>
                    <button
                      onClick={() =>
                        dispatch({ type: "atlasMode", mode: "derivation", focusId: subject.id })
                      }
                    >
                      Derivationで見る
                    </button>
                  </div>
                )}
              </header>
              {loadedSubject !== subject.id && <p role="status">選択した対象の所属を照会中…</p>}
              {subject.kind === "entity" ? (
                <>
                  <h4>
                    この構造はどこに属する？ <span>{groups.length}体系</span>
                  </h4>
                  {!groups.length && (
                    <div className="family-empty">
                      この対象の所属は未登録です。分類に該当しない、文献に報告がないという意味ではありません。
                    </div>
                  )}
                  <div className="family-memberships">
                    {groups.map((g) => {
                      const s = schemes.get(g.schemeId);
                      const basis = JSON.parse(s?.payload ?? "{}").basis;
                      return (
                        <article
                          className="family-membership"
                          key={g.schemeId}
                          data-family-membership={g.schemeId}
                          data-evidence-selected={g.records.some((c) => c.id === evidenceId)}
                        >
                          <div className="family-row-heading">
                            <button onClick={() => navigate({ kind: "scheme", id: g.schemeId })}>
                              {schemeName(g.schemeId)}
                            </button>
                            <span className="family-status">
                              {familyBasis(basis)}
                              {basis !== "editorial_navigation" &&
                                ` · ${familyStatus(g.records[0]?.status)}`}
                            </span>
                          </div>
                          {g.paths.map((p, i) => (
                            <div key={i}>{pathView(p, g.schemeId)}</div>
                          ))}
                          <button
                            className="family-show-source"
                            aria-pressed={g.records.some((c) => c.id === evidenceId)}
                            onClick={() => evidence(g.records[0]!.id)}
                          >
                            所属の根拠
                          </button>
                          <details>
                            <summary>所属記録と根拠 · {g.records.length}件</summary>
                            {g.records.map((c) => (
                              <button
                                key={c.id}
                                data-family-evidence={c.id}
                                onClick={() => evidence(c.id)}
                              >
                                {c.objectTitle}の所属根拠
                              </button>
                            ))}
                            {[
                              ...new Map(
                                g.paths.flatMap((p) => p.claims).map((c) => [c.id, c]),
                              ).values(),
                            ].map((c) => (
                              <button key={c.id} onClick={() => evidence(c.id)}>
                                包含：{c.subjectTitle} ⊂ {c.objectTitle} · {schemeName(c.schemeId)}
                              </button>
                            ))}
                          </details>
                        </article>
                      );
                    })}
                  </div>
                  <details className="family-unregistered">
                    <summary>所属未登録の体系 · {noMembership.length}</summary>
                    <p>未判断・未調査を含みます。非該当とは断定できません。</p>
                    {noMembership.map((s) => (
                      <button key={s.id} onClick={() => navigate({ kind: "scheme", id: s.id })}>
                        {schemeName(s.id)}
                      </button>
                    ))}
                  </details>
                </>
              ) : (
                <>
                  {subject.kind === "item" &&
                    familyPaths(subject.id, claims).map((p, i) => (
                      <div className="family-breadcrumb" key={i}>
                        {pathView(p)}
                      </div>
                    ))}
                  {subject.kind === "item" &&
                    familyPaths(subject.id, claims).some((p) => p.claims.length > 0) && (
                      <details className="family-hierarchy-evidence">
                        <summary>階層の根拠を確認</summary>
                        {[
                          ...new Map(
                            familyPaths(subject.id, claims)
                              .flatMap((p) => p.claims)
                              .map((c) => [c.id, c]),
                          ).values(),
                        ].map((c) => (
                          <button key={c.id} onClick={() => evidence(c.id)}>
                            {c.subjectTitle} ⊂ {c.objectTitle} · {schemeName(c.schemeId)}
                          </button>
                        ))}
                      </details>
                    )}
                  {selectedScheme && (
                    <div className="family-context">
                      <button onClick={() => navigate({ kind: "scheme", id: selectedScheme })}>
                        {schemeName(selectedScheme)}
                      </button>
                      <span className="family-status">
                        {familyBasis(schemePayload?.basis)} ·{" "}
                        {familyStatus(schemePayload?.status ?? "source_context_checked")}
                      </span>
                    </div>
                  )}
                  {subject.id === "collection:glazer" && (
                    <p className="family-note">
                      既存の「15回転系」という見出しを保持しています。下位項目の登録は6系です。HS
                      1998 Table 1は別の体系として収録しています。
                    </p>
                  )}
                  {(isHS || subject.kind === "scheme") && (
                    <section
                      aria-label="分類項目の比較"
                      data-testid="scheme-ready"
                      data-scheme={selectedScheme}
                    >
                      <div className="family-table-heading">
                        <h4>
                          {isHS ? "八面体回転と理想空間群" : "この体系の分類項目"} ·{" "}
                          {schemeItems.length}
                        </h4>
                        <label>
                          分類項目を絞り込む
                          <input
                            id="atlasClassSearch"
                            type="search"
                            name="family-classification-search"
                            autoComplete="off"
                            spellCheck={false}
                            placeholder="回転記号・分類名…"
                            value={classQuery}
                            onChange={(e) => setClassQuery(e.target.value)}
                          />
                        </label>
                      </div>
                      <div className="family-table-scroll">
                        <table className="family-class-table">
                          <thead>
                            <tr>
                              <th>{isHS ? "回転記号 / 分類" : "分類項目"}</th>
                              {isHS && <th>理想空間群</th>}
                              <th>所属構造</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tableItems.map((i) => {
                              const parts = i.title.split(" · ");
                              const count = claims.filter(
                                (c) => c.operation === "member_of" && c.objectId === i.id,
                              ).length;
                              return (
                                <tr
                                  key={i.id}
                                  aria-selected={subject.id === i.id}
                                  className={subject.id === i.id ? "selected" : ""}
                                >
                                  <th scope="row">
                                    <button
                                      data-atlas-class={i.id}
                                      aria-current={subject.id === i.id ? "true" : undefined}
                                      onClick={() => navigate({ kind: "item", id: i.id })}
                                    >
                                      {parts[0]}
                                    </button>
                                  </th>
                                  {isHS && <td>{parts.slice(1).join(" · ") || "—"}</td>}
                                  <td>{count ? `${count}件` : "未登録"}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      {!tableItems.length && (
                        <p>一致する分類項目はありません。絞り込みを解除してください。</p>
                      )}
                      {isHS && (
                        <p className="family-note">
                          無回転の基準と15回転系を保持しています。所属は照合した理想立方型1件のみで、実物質への割り当ては未登録です。
                        </p>
                      )}
                    </section>
                  )}
                  {subject.kind === "item" && (
                    <>
                      {!isHS && children.length > 0 && (
                        <section className="family-children">
                          <h4>下位の分類 · {children.length}</h4>
                          {children.map((c) => (
                            <div key={c.id}>
                              {itemButton(c.subjectId)}
                              {c.schemeId !== selectedScheme && (
                                <small>別体系：{schemeName(c.schemeId)}</small>
                              )}
                            </div>
                          ))}
                        </section>
                      )}
                      <section className="family-member-section">
                        <h4>所属する構造 · {members.length}</h4>
                        {!members.length ? (
                          <p className="family-empty">
                            具体的な所属構造は未登録です。下位分類に所属記録がある場合もあります。
                          </p>
                        ) : (
                          [...new Set(members.map((c) => byId.get(c.subjectId)?.kind ?? ""))].map(
                            (kind) => (
                              <div key={kind}>
                                <h5>{entityKindLabel(kind)}</h5>
                                <div className="family-member-list">
                                  {members
                                    .filter((c) => byId.get(c.subjectId)?.kind === kind)
                                    .map((c) => (
                                      <button
                                        key={c.id}
                                        data-atlas-member={c.subjectId}
                                        onClick={() =>
                                          navigate({ kind: "entity", id: c.subjectId }, c.id)
                                        }
                                      >
                                        <span>{c.subjectTitle}</span>
                                        <span aria-hidden="true">→</span>
                                      </button>
                                    ))}
                                </div>
                              </div>
                            ),
                          )
                        )}
                      </section>
                    </>
                  )}
                </>
              )}
            </div>
            <aside
              className={`atlas-inspector family-evidence ${pane === "evidence" ? "mobile-active" : ""}`}
              aria-label="選択の根拠と説明"
            >
              <button className="family-mobile-back" onClick={() => setPane("content")}>
                ← 所属・分類に戻る
              </button>
              <h3>出典と確認範囲</h3>
              <p className="family-evidence-subject">
                {subject.kind === "scheme" ? schemeName(subject.id) : name(subject.id)}
              </p>
              {selectedClaim ? (
                <RelationshipDetail
                  key={selectedClaim.id}
                  id={selectedClaim.id}
                  onFocus={chooseEntity}
                  onFailure={fail}
                />
              ) : (
                <>
                  {itemRefs.length > 0 && <RefChips refs={itemRefs} />}
                  {schemePayload && (
                    <>
                      <p>{familyBasis(schemePayload.basis)}</p>
                      <p>{schemePayload.scope}</p>
                      {schemePayload.documents.map((id: string) => (
                        <button
                          key={id}
                          onClick={() => dispatch({ type: "source", id, page: null, pdfPage: 1 })}
                        >
                          {DATA.sources[id]?.short ?? id}の文献を開く
                        </button>
                      ))}
                    </>
                  )}
                  {!itemRefs.length && !schemePayload && (
                    <p>所属記録の「根拠」から、対象と出典を確認できます。</p>
                  )}
                </>
              )}
              <div className="family-record-actions">
                <button
                  onClick={() =>
                    dispatch({
                      type: "recordReference",
                      reference: {
                        kind: subject.kind === "scheme" ? "scheme" : "entity",
                        id: subject.id,
                        mode: "family",
                      },
                    })
                  }
                >
                  対象の直接リンク・原記録
                </button>
              </div>
              {subject.kind === "entity" && (
                <details open={profileOpen} onToggle={(e) => setProfileOpen(e.currentTarget.open)}>
                  <summary>構造の説明・模型の由来</summary>
                  {profileOpen && (
                    <EntityProfile key={subject.id} id={subject.id} onSelect={chooseEntity} />
                  )}
                </details>
              )}
            </aside>
          </div>
          <footer className="family-footer">
            <span>所属・包含を表示。派生操作とは別の関係です。</span>
            <details>
              <summary>収録範囲・識別状況</summary>
              <p data-testid="identity-inventory">
                物質・相を未分離の既存カード{" "}
                {graph.entities.filter((e) => e.kind === "legacy_material_or_phase").length}{" "}
                件。文献の網羅照合は未完了です。
              </p>
            </details>
          </footer>
          <span hidden data-testid="atlas-focus" data-entity-id={subject.id} />
        </>
      )}
    </section>
  );
}
