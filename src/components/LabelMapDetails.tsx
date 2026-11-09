import type { LabelMapSpec } from "../knowledge/derivation.ts";
export function LabelMapDetails({ spec }: { spec: LabelMapSpec }) {
  return (
    <section aria-label="ラベル写像の対象仕様" data-testid="label-map-spec">
      <h4>理想配置のラベル写像</h4>
      <p>
        {spec.inputLabels.join(" / ")} → {spec.outputLabel}（共通の抽象ラベル）
      </p>
      <p>{spec.scope}</p>
      <p>
        配置点の集合を保ってラベルの区別を外します。到達する最小セル・原点・Wyckoff対応は未検証です。特定の元素の置換反応・実相転移を記録するものではありません。
      </p>
    </section>
  );
}
