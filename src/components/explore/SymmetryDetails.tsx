import { useEffect, useState } from "react";
import { getKnowledgeDB } from "../../knowledge/client.ts";
import {
  SYMMETRY_MAPPING_QUERY,
  SYMMETRY_MODEL_QUERY,
  SYMMETRY_VALIDATION_QUERY,
} from "../../knowledge/queries.ts";
import type { SymmetryMapping } from "../../knowledge/symmetry.ts";
export function SymmetryDetails({ assertionId }: { assertionId: string }) {
  const [record, setRecord] = useState<{
    id: string;
    mapping: SymmetryMapping;
    validation: Record<string, unknown> | null;
    model: Record<string, unknown> | null;
  } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let live = true;
    void getKnowledgeDB()
      .then(async (db) => {
        const rows = await db.query(SYMMETRY_MAPPING_QUERY, { id: assertionId });
        const row = rows[0];
        if (!row) {
          if (live) setRecord(null);
          return;
        }
        const [v, m] = await Promise.all([
          db.query(SYMMETRY_VALIDATION_QUERY, { id: String(row.id) }),
          db.query(SYMMETRY_MODEL_QUERY, { id: String(row.id) }),
        ]);
        if (live)
          setRecord({
            id: assertionId,
            mapping: JSON.parse(String(row.payload)),
            validation: v[0] ? JSON.parse(String(v[0].payload)) : null,
            model: m[0] ? JSON.parse(String(m[0].payload)) : null,
          });
      })
      .catch((e) => {
        if (live) setError(String(e));
      });
    return () => {
      live = false;
    };
  }, [assertionId]);
  const r = record?.id === assertionId ? record : null;
  return (
    <section className="symmetry-spec" aria-label="対称性対応の設定と検証">
      {error ? (
        <p role="alert">{error}</p>
      ) : r ? (
        <div data-testid="symmetry-spec">
          <h4>設定・転記・検証を区別</h4>
          <p>
            文献：
            {r.mapping.literatureState === "page_image_checked"
              ? "頁画像で限定確認"
              : "既存strict・未再照合"}{" "}
            ／ 数値：
            {r.mapping.transcriptionState === "not_transcribed"
              ? "未転記"
              : "転記と明示したセル解釈"}
          </p>
          <p>
            {r.mapping.parent.symbol}（{r.mapping.parent.number ?? "番号未転記"}） →{" "}
            {r.mapping.child.symbol}（{r.mapping.child.number ?? "番号未転記"}）
          </p>
          <p>上位設定：{r.mapping.parent.setting ?? "未転記"}</p>
          <p>下位設定：{r.mapping.child.setting ?? "未転記"}</p>
          <p>
            種類：
            {r.mapping.subgroupKind === "unknown"
              ? "未転記（t/k/iを推定しない）"
              : r.mapping.subgroupKind}{" "}
            ／ 指数：{r.mapping.index ?? "未転記"}
          </p>
          <p>規約：{r.mapping.convention}</p>
          <p>
            基底 P：{r.mapping.basis ? JSON.stringify(r.mapping.basis) : "未転記"} ／ 原点 p：
            {r.mapping.origin ? JSON.stringify(r.mapping.origin) : "未転記"}
          </p>
          <p>
            Wyckoff分裂：
            {r.mapping.wyckoff
              ? `${r.mapping.wyckoff.from} → ${r.mapping.wyckoff.to.join(" + ")}`
              : "未転記"}
          </p>
          <p>{r.mapping.interpretation}</p>
          {r.validation ? (
            <>
              <p>
                <strong>宣言した理想模型で代数検証済み</strong>：上位{" "}
                {String(r.validation.parentOperations)} ／ 下位{" "}
                {String(r.validation.subgroupOperations)} 演算、指数 {String(r.validation.index)}
                、共通の並進 {String(r.validation.translationCosets)} 剰余類。
              </p>
              <p>群の閉包・包含・同じ並進群・4+4の軌道分裂を整数座標で検証。</p>
              <ul>
                {(r.validation.limitations as string[]).map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
              <details>
                <summary>検証に用いた模型と手法</summary>
                <pre>{JSON.stringify({ model: r.model, validation: r.validation }, null, 2)}</pre>
              </details>
            </>
          ) : (
            <p>変換行列・Wyckoff対応の機械検証は未実施です。</p>
          )}
        </div>
      ) : (
        <p>詳細な設定レコードは未登録、または照会中です。</p>
      )}
    </section>
  );
}
