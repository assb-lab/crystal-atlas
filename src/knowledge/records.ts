import { TABLES } from "./schema.ts";
import type { RecordKind } from "./navigation.ts";
export const recordTables: Record<RecordKind, { table: string; title: string; payload: string }> = {
  entity: { table: "Entity", title: "title", payload: "payload" },
  document: { table: "Document", title: "title", payload: "payload" },
  assertion: { table: "Assertion", title: "label", payload: "payload" },
  operation: { table: "OperationDefinition", title: "title", payload: "payload" },
  step: { table: "OperationStep", title: "operation", payload: "payload" },
  scheme: { table: "ClassificationScheme", title: "title", payload: "payload" },
  mention: { table: "Mention", title: "rawName", payload: "payload" },
  candidate: { table: "RelationCandidate", title: "operation", payload: "payload" },
  model: { table: "StructureModel", title: "id", payload: "payload" },
  asset: { table: "Asset", title: "id", payload: "payload" },
};
export function recordQuery(kind: RecordKind, all = false) {
  const t = recordTables[kind];
  const extra = TABLES.find((table) => table.name === t.table)!
    .columns.map((c) => c[0])
    .filter((name) => !["id", t.title, t.payload].includes(name))
    .map((name) => `,r.${name} AS ${name}`)
    .join("");
  return `MATCH (r:${t.table}${all ? "" : " {id:$id}"}) RETURN r.id AS id,r.${t.title} AS title,r.${t.payload} AS payload${extra} ORDER BY r.id`;
}
export const recordLabels: Record<RecordKind, string> = {
  entity: "対象・分類項目",
  document: "文献",
  assertion: "主張",
  operation: "操作の定義",
  step: "操作手順",
  scheme: "分類体系",
  mention: "登場候補",
  candidate: "関係候補",
  model: "座標モデル",
  asset: "文献資産",
};
