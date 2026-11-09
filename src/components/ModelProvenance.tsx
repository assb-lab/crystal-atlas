import { modelKindLabel } from "../knowledge/presentation.ts";

export interface ModelRecord {
  id: string;
  kind: string;
  payload: string;
  note?: string;
}
export function ModelProvenance({ records }: { records: ModelRecord[] }) {
  return (
    <section aria-label="座標モデルの由来" className="model-provenance">
      <h4>座標モデルの由来</h4>
      {!records.length ? (
        <p>この対象に接続した座標モデルは未登録です。</p>
      ) : (
        records.map((record) => {
          const data = JSON.parse(record.payload) as {
            source: { label: string; url?: string };
            cell: {
              parameters: number[];
              spaceGroupNumber: number;
              lengthUnit: string;
              setting: null | string;
              origin: null | string;
            };
            conditions: { temperatureK: number | null; pressurePa: number | null };
            occupancy: { wyckoff: string; occupants: Record<string, number>; positions: number }[];
            note: string | null;
            sourceWarnings: string[];
          };
          return (
            <details key={record.id} data-testid="model-provenance">
              <summary>
                {modelKindLabel(record.kind)} · {record.id}
              </summary>
              <p>既存収録の模型です。座標の再照合・精密化／計算緩和の状態確認は未実施です。</p>
              <p>
                {data.source.url ? (
                  <a href={data.source.url} target="_blank" rel="noopener">
                    {data.source.label} ↗
                  </a>
                ) : (
                  data.source.label
                )}
              </p>
              <dl className="extraction-parameters">
                <div>
                  <dt>採用セル [a,b,c,α,β,γ]</dt>
                  <dd>
                    {data.cell.parameters.join(", ")} ·{" "}
                    {data.cell.lengthUnit === "relative" ? "相対長さ" : "Å"} / °
                  </dd>
                </div>
                <div>
                  <dt>記録の空間群番号</dt>
                  <dd>{data.cell.spaceGroupNumber}</dd>
                </div>
                <div>
                  <dt>設定・原点</dt>
                  <dd>
                    {data.cell.setting ?? "設定未転記"} / {data.cell.origin ?? "原点未転記"}
                  </dd>
                </div>
                <div>
                  <dt>温度・圧力</dt>
                  <dd>
                    {data.conditions.temperatureK === null
                      ? "温度未転記"
                      : `${data.conditions.temperatureK} K`}{" "}
                    /{" "}
                    {data.conditions.pressurePa === null
                      ? "圧力未転記"
                      : `${data.conditions.pressurePa} Pa`}
                  </dd>
                </div>
              </dl>
              <p>
                分率座標。部分占有は記録の値を保持し、欠損や混合占有を自動で実試料の状態へ読み替えません。
              </p>
              <ul>
                {data.occupancy.map((g, i) => (
                  <li key={i}>
                    {g.wyckoff} ·{" "}
                    {Object.entries(g.occupants)
                      .map(([e, v]) => `${e}: ${v}`)
                      .join(" / ")}{" "}
                    · 展開位置 {g.positions}
                  </li>
                ))}
              </ul>
              {[
                ...new Set(
                  [...data.sourceWarnings, data.note, record.note].filter(
                    (note): note is string => !!note,
                  ),
                ),
              ].map((note) => (
                <p key={note}>{note}</p>
              ))}
            </details>
          );
        })
      )}
    </section>
  );
}
