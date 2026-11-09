import type { Atlas, Ref } from "../types.ts";
import type { Cell } from "./schema.ts";
export interface ClassificationRegistry {
  id: string;
  title: string;
  scope: string;
  basis: "literature_classification" | "editorial_synthesis" | "editorial_navigation";
  documents: string[];
  items: { id: string; title: string; parentId?: string; refs: Ref[] }[];
  memberships: { id: string; entityId: string; itemId: string; scope: string; refs: Ref[] }[];
}
/** Validate the complete registry before appending any row. Same names never merge schemes. */
export function appendClassification(
  rows: Record<string, Cell[][]>,
  registry: ClassificationRegistry,
) {
  const entities = new Set(rows.Entity!.map((r) => String(r[0])));
  const documents = new Set(rows.Document!.map((r) => String(r[0])));
  const ids = new Set<string>();
  if (
    !registry.id ||
    !registry.title ||
    !registry.scope ||
    rows.ClassificationScheme!.some((r) => r[0] === registry.id)
  )
    throw new Error("Invalid/duplicate classification scheme");
  if (registry.basis === "literature_classification" && !registry.documents.length)
    throw new Error("Literature scheme needs documents");
  for (const d of registry.documents)
    if (!documents.has(d)) throw new Error("Unknown scheme document");
  for (const item of registry.items) {
    if (!item.id || !item.title || ids.has(item.id) || entities.has(item.id))
      throw new Error("Duplicate classification item");
    ids.add(item.id);
  }
  const refs = (rr: Ref[]) => {
    if (registry.basis === "literature_classification" && !rr.length)
      throw new Error("Missing classification evidence");
    for (const r of rr)
      if (!documents.has(r.s) || !registry.documents.includes(r.s) || !r.sec)
        throw new Error("Invalid classification evidence");
  };
  for (const item of registry.items) {
    refs(item.refs);
    const seen = new Set([item.id]);
    let parent = item.parentId;
    while (parent) {
      if (!ids.has(parent) || seen.has(parent))
        throw new Error("Invalid/cyclic classification inclusion");
      seen.add(parent);
      parent = registry.items.find((i) => i.id === parent)!.parentId;
    }
  }
  const claimIds = new Set(rows.Assertion!.map((r) => String(r[0])));
  for (const m of registry.memberships) {
    if (!entities.has(m.entityId) || !ids.has(m.itemId) || !m.scope || claimIds.has(m.id))
      throw new Error("Invalid classification membership");
    claimIds.add(m.id);
    refs(m.refs);
  }
  const add = (t: string, ...v: Cell[]) => rows[t]!.push(v);
  add("ClassificationScheme", registry.id, registry.title, JSON.stringify(registry));
  for (const d of registry.documents) add("SchemeDocument", registry.id, d);
  function claim(id: string, from: string, to: string, op: string, scope: string, rr: Ref[]) {
    add(
      "Assertion",
      id,
      "family",
      op,
      "分類体系内の" + (op === "member_of" ? "所属" : "包含"),
      scope,
      "source_context_checked",
      registry.basis,
      JSON.stringify({
        scope,
        reviewer: "Codex",
        reviewedOn: "2026-11-09",
        verification: "page_image_checked",
        machineVerification: "not_applicable",
      }),
    );
    add("Subject", id, from);
    add("Object", id, to);
    add("ClaimInScheme", id, registry.id);
    rr.forEach((r, i) => {
      const sid = `${id}:evidence:${i}`;
      add("SourceSpan", sid, JSON.stringify(r));
      add("InDocument", sid, r.s);
      add("HasEvidence", id, sid);
    });
  }
  for (const item of registry.items) {
    add("Entity", item.id, item.title, "classification", JSON.stringify(item));
    add("SchemeItem", registry.id, item.id);
    if (item.parentId)
      claim(
        `contains:${item.id}`,
        item.id,
        item.parentId,
        "included_in",
        registry.scope,
        item.refs,
      );
  }
  for (const m of registry.memberships)
    claim(m.id, m.entityId, m.itemId, "member_of", m.scope, m.refs);
}
/** Existing curation remains imported; multi-source navigation is not attributed to every author. */
export function appendLegacySchemes(rows: Record<string, Cell[][]>, data: Atlas) {
  const add = (t: string, ...v: Cell[]) => rows[t]!.push(v);
  const grouped = new Map<
    string,
    { title: string; basis: string; documents: string[]; scope: string }
  >();
  grouped.set("scheme:atlas", {
    title: "Atlas · 編集上のファミリー",
    basis: "editorial_navigation",
    documents: [],
    scope: "カードの一般参照は所属根拠に流用しない。",
  });
  for (const [id] of Object.entries(data.families))
    add("SchemeItem", "scheme:atlas", `family:${id}`);
  for (const n of data.nodes) add("ClaimInScheme", `family:${n.id}`, "scheme:atlas");
  const collectionScheme = new Map<string, string>();
  for (const c of data.collections) {
    const documents = [...new Set(c.refs.map((r) => r.s))].sort();
    const id = `scheme:legacy:${documents.join("+") || "editorial"}`;
    grouped.set(id, {
      title:
        documents.length === 1
          ? `${data.sources[documents[0]!]!.short} · 既存収録分類`
          : `${documents.join(" / ")} · 既存の複数文献整理`,
      basis: documents.length === 1 ? "literature_classification" : "editorial_synthesis",
      documents,
      scope:
        "既存分類の移行。頁単位の再照合は未実施。複数文献の整理は個々の著者の分類主張と扱わない。",
    });
    collectionScheme.set(c.id, id);
    add("SchemeItem", id, `collection:${c.id}`);
    for (const entity of c.ids) add("ClaimInScheme", `collection:${c.id}:${entity}`, id);
  }
  for (const c of data.collections)
    if (c.parent) add("ClaimInScheme", `inclusion:${c.id}`, collectionScheme.get(c.id)!);
  for (const [id, value] of grouped) {
    add(
      "ClassificationScheme",
      id,
      value.title,
      JSON.stringify({ ...value, status: "imported_not_revalidated" }),
    );
    for (const d of value.documents) add("SchemeDocument", id, d);
  }
}
