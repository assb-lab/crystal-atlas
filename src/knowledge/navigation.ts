import type { AtlasMode } from "./schema.ts";
export const recordKinds = [
  "entity",
  "document",
  "assertion",
  "operation",
  "step",
  "scheme",
  "mention",
  "candidate",
  "model",
  "asset",
] as const;
export type RecordKind = (typeof recordKinds)[number];
export interface RecordReference {
  kind: RecordKind;
  id: string;
  mode?: AtlasMode;
}
export const recordSlug = (id: string) =>
  encodeURIComponent(id).replaceAll("~", "%7E").replaceAll("%", "~");
export const recordPath = (kind: RecordKind, id: string) =>
  `records/${kind}/${recordSlug(id)}.html`;
export function referenceHash(ref: RecordReference) {
  return (
    "#atlas?" +
    new URLSearchParams({
      kind: ref.kind,
      id: ref.id,
      ...(ref.mode ? { mode: ref.mode } : {}),
    }).toString()
  );
}
export function parseReference(hash: string): RecordReference | null {
  if (!hash.startsWith("#atlas?")) return null;
  const p = new URLSearchParams(hash.slice(7));
  const kind = p.get("kind");
  const id = p.get("id");
  const mode = p.get("mode");
  if (
    !recordKinds.includes(kind as RecordKind) ||
    !id ||
    id.length > 500 ||
    Array.from(id).some((c) => c.charCodeAt(0) < 32) ||
    (mode && !["family", "derivation", "symmetry"].includes(mode))
  )
    return null;
  return { kind: kind as RecordKind, id, ...(mode ? { mode: mode as AtlasMode } : {}) };
}
