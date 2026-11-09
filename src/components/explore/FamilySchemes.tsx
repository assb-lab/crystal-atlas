import { useViewState } from "../../lib/view-state.ts";
import { useEffect, useState } from "react";
import { getKnowledgeDB } from "../../knowledge/client.ts";
import {
  CLASSIFICATION_SCHEMES_QUERY,
  CLASSIFICATION_ITEMS_QUERY,
  CLASSIFICATION_CLAIMS_QUERY,
  ENTITY_CLASSIFICATIONS_QUERY,
  EVIDENCE_QUERY,
} from "../../knowledge/queries.ts";
import { RefChips } from "../RefChips.tsx";
import { DATA } from "../../data/atlas.ts";
import { useAtlas } from "../../store.ts";
import type { Ref } from "../../types.ts";
type Row = Record<string, unknown>;
export function FamilySchemes({
  focus,
  onSelect,
}: {
  focus: string;
  onSelect: (id: string) => void;
}) {
  const { dispatch } = useAtlas();
  const [scheme, setScheme] = useViewState("family:scheme", "scheme:HS:1998:table1");
  const [schemes, setSchemes] = useState<Row[]>([]);
  const [detail, setDetail] = useState<{
    scheme: string;
    focus: string;
    items: Row[];
    claims: Row[];
    memberships: Row[];
    refs: Record<string, Ref[]>;
  } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let live = true;
    void getKnowledgeDB()
      .then((db) => db.query(CLASSIFICATION_SCHEMES_QUERY))
      .then((rows) => {
        if (live) setSchemes(rows);
      })
      .catch((e) => {
        if (live) setError(String(e));
      });
    return () => {
      live = false;
    };
  }, []);
  useEffect(() => {
    let live = true;
    void getKnowledgeDB()
      .then(async (db) => {
        const [items, claims, memberships] = await Promise.all([
          db.query(CLASSIFICATION_ITEMS_QUERY, { id: scheme }),
          db.query(CLASSIFICATION_CLAIMS_QUERY, { id: scheme }),
          db.query(ENTITY_CLASSIFICATIONS_QUERY, { id: focus }),
        ]);
        const ids = [...new Set([...claims, ...memberships].map((r) => String(r.id)))];
        const refs = Object.fromEntries(
          await Promise.all(
            ids.map(async (id) => [
              id,
              (await db.query(EVIDENCE_QUERY, { id })).map(
                (r) => JSON.parse(String(r.reference)) as Ref,
              ),
            ]),
          ),
        );
        if (live) {
          setError("");
          setDetail({ scheme, focus, items, claims, memberships, refs });
        }
      })
      .catch((e) => {
        if (live) setError(String(e));
      });
    return () => {
      live = false;
    };
  }, [scheme, focus]);
  const meta = schemes.find((s) => s.id === scheme);
  const p = meta ? JSON.parse(String(meta.payload)) : null;
  return (
    <section className="scheme-explorer" aria-label="文献別の分類体系">
      <h3>文献別の分類体系</h3>
      <label htmlFor="classificationScheme">体系（{schemes.length}件すべて）</label>
      <select id="classificationScheme" value={scheme} onChange={(e) => setScheme(e.target.value)}>
        {schemes.map((s) => (
          <option key={String(s.id)} value={String(s.id)}>
            {String(s.title)}
          </option>
        ))}
      </select>
      {p && (
        <>
          <p>
            {p.basis === "literature_classification"
              ? "文献の分類体系"
              : p.basis === "editorial_navigation"
                ? "編集上のナビゲーション"
                : "複数文献を使った編集上の整理"}{" "}
            · {p.status === "imported_not_revalidated" ? "既存収録・未再照合" : "頁画像で限定確認"}
          </p>
          <p>{p.scope}</p>
        </>
      )}
      {error ? (
        <p role="alert">{error}</p>
      ) : detail?.scheme === scheme && detail.focus === focus ? (
        <div data-testid="scheme-ready" data-scheme={detail.scheme}>
          <h4>選択対象の所属を体系間で比較（{detail.memberships.length}件すべて）</h4>
          <ul>
            {detail.memberships.map((m) => (
              <li key={String(m.id)}>
                <button onClick={() => setScheme(String(m.schemeId))}>
                  {String(m.schemeTitle)}
                </button>{" "}
                · {String(m.itemTitle)} ·{" "}
                {m.basis === "editorial"
                  ? "編集上の所属"
                  : m.status === "imported_not_revalidated"
                    ? "未再照合"
                    : "文献の限定確認"}
                <RefChips refs={detail.refs[String(m.id)] ?? []} />
              </li>
            ))}
          </ul>
          <details open>
            <summary>分類項目（{detail.items.length}件すべて）</summary>
            <ul>
              {detail.items.map((i) => (
                <li key={String(i.id)}>
                  <button onClick={() => onSelect(String(i.id))}>{String(i.title)}</button>
                </li>
              ))}
            </ul>
          </details>
          <details>
            <summary>所属・包含（{detail.claims.length}件すべて）</summary>
            <ul>
              {detail.claims.map((c) => (
                <li key={String(c.id)}>
                  <button onClick={() => onSelect(String(c.subjectId))}>
                    {String(c.subjectTitle)}
                  </button>{" "}
                  {c.operation === "included_in" ? "⊂" : "∈"}{" "}
                  <button onClick={() => onSelect(String(c.objectId))}>
                    {String(c.objectTitle)}
                  </button>
                  <p>{String(c.description)}</p>
                  <RefChips refs={detail.refs[String(c.id)] ?? []} />
                  {c.operation === "member_of" && (
                    <button
                      onClick={() => {
                        if (DATA.nodes.some((n) => n.id === c.subjectId))
                          dispatch({ type: "selectNode", id: String(c.subjectId), jump: false });
                        dispatch({ type: "atlasMode", mode: "derivation" });
                      }}
                    >
                      この対象をDerivationで見る
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </details>
        </div>
      ) : (
        <p role="status">体系を照会中…</p>
      )}
    </section>
  );
}
