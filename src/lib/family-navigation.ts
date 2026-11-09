/** Display navigation over stored assertions. No classification or equivalence is inferred. */
export interface FamilyEntity {
  id: string;
  title: string;
  kind: string;
  payload: string;
}
export interface FamilyScheme {
  id: string;
  title: string;
  payload: string;
}
export interface FamilyClaim {
  id: string;
  schemeId: string;
  operation: string;
  status: string;
  basis: string;
  description: string;
  subjectId: string;
  subjectTitle: string;
  objectId: string;
  objectTitle: string;
}
export type FamilySubject = { kind: "entity" | "item" | "scheme"; id: string };
export interface FamilyPath {
  ids: string[];
  claims: FamilyClaim[];
}
/** All recorded parent paths, including cross-scheme inclusions; never synthesize an edge. */
export function familyPaths(
  id: string,
  claims: FamilyClaim[],
  seen = new Set<string>(),
): FamilyPath[] {
  if (seen.has(id)) return [];
  const parents = claims.filter((c) => c.operation === "included_in" && c.subjectId === id);
  if (!parents.length) return [{ ids: [id], claims: [] }];
  return parents.flatMap((c) =>
    familyPaths(c.objectId, claims, new Set([...seen, id])).map((p) => ({
      ids: [...p.ids, id],
      claims: [...p.claims, c],
    })),
  );
}
export function membershipGroups(entityId: string, claims: FamilyClaim[]) {
  const memberships = claims.filter((c) => c.operation === "member_of" && c.subjectId === entityId);
  return [...new Set(memberships.map((c) => c.schemeId))].map((schemeId) => {
    const records = memberships.filter((c) => c.schemeId === schemeId);
    const paths = records.flatMap((record) =>
      familyPaths(record.objectId, claims).map((path) => ({ ...path, record })),
    );
    // Ancestor memberships remain accessible as records, but do not duplicate a longer path.
    const leaves = paths.filter(
      (p) =>
        !paths.some((q) => q.ids.length > p.ids.length && p.ids.every((id, i) => q.ids[i] === id)),
    );
    return { schemeId, records, paths: leaves };
  });
}
export const schemeNames: Record<string, string> = {
  "scheme:atlas": "Atlasのファミリー",
  "scheme:HS:1998:table1": "八面体回転 · HS 1998 Table 1",
  "scheme:legacy:G": "ペロブスカイトの構造分類 · Galasso",
  "scheme:legacy:G+GL+HS": "ペロブスカイト分類総覧 · 既存整理",
  "scheme:legacy:GL+HS": "Glazer回転系 · 既存整理",
  "scheme:legacy:CM14+K": "Aサイト秩序 · 既存整理",
  "scheme:legacy:BE11+CA03+DL+YB13": "層状岩塩の積層 · 既存整理",
  "scheme:legacy:CH12+VC07": "ハニカム構造 · 既存整理",
  "scheme:legacy:GI+K": "パイロクロア関連 · 既存整理",
  "scheme:legacy:GI": "構造別の章分類 · Galasso",
};
/** Topic links are an editorial table of contents, independent of the scientific schemes. */
export const familyTopics: {
  title: string;
  entries: { title: string; subject: FamilySubject }[];
}[] = [
  {
    title: "ペロブスカイト",
    entries: [
      { title: "分類総覧", subject: { kind: "item", id: "collection:perovskites" } },
      { title: "八面体回転 · HS 1998", subject: { kind: "scheme", id: "scheme:HS:1998:table1" } },
      { title: "Glazer回転系 · 既存整理", subject: { kind: "item", id: "collection:glazer" } },
      { title: "サイト秩序・層状構造", subject: { kind: "scheme", id: "scheme:legacy:G" } },
    ],
  },
  {
    title: "岩塩・層状構造",
    entries: [
      { title: "NaClと関連構造", subject: { kind: "item", id: "collection:galasso-4" } },
      { title: "層状岩塩 · Delmas積層", subject: { kind: "item", id: "collection:delmas" } },
      { title: "ハニカム構造", subject: { kind: "item", id: "collection:honeycomb" } },
    ],
  },
  {
    title: "蛍石・パイロクロア",
    entries: [
      { title: "パイロクロア関連の分類", subject: { kind: "item", id: "collection:pyrochlores" } },
      { title: "蛍石ファミリー（編集）", subject: { kind: "item", id: "family:fluorite" } },
    ],
  },
  {
    title: "構造別の章をたどる",
    entries: [{ title: "Galasso 第2–11章", subject: { kind: "item", id: "collection:galasso" } }],
  },
];
export const isFamilyItem = (e: FamilyEntity) =>
  ["classification", "editorial_family"].includes(e.kind);
export const familyBasis = (basis: string) =>
  basis === "editorial_navigation" || basis === "editorial"
    ? "編集ナビゲーション"
    : basis === "editorial_synthesis"
      ? "複数文献の編集整理"
      : "文献の分類";
export const familyStatus = (status?: string) =>
  status === "source_context_checked" ? "頁画像で限定確認" : "未再照合";
