import type { OccupationSpec } from "../knowledge/occupation.ts";
import { parameterValue } from "../knowledge/presentation.ts";

export function OccupationDetails({ spec }: { spec: OccupationSpec }) {
  return (
    <section
      className="occupation-details"
      aria-label="空隙占有の対象仕様"
      data-testid="occupation-spec"
    >
      <h4>空隙占有の対象</h4>
      <dl className="extraction-parameters">
        <div>
          <dt>骨格モチーフ</dt>
          <dd>
            理想fccモチーフ <code>{spec.hostMotifId}</code>
          </dd>
        </div>
        <div>
          <dt>骨格を作る原子種</dt>
          <dd>{spec.hostSpecies}</dd>
        </div>
        <div>
          <dt>空隙を占有する原子種</dt>
          <dd>{spec.guestSpecies}</dd>
        </div>
        <div>
          <dt>空隙の種類</dt>
          <dd>{parameterValue(spec.voidKind)}</dd>
        </div>
        <div>
          <dt>文献の占有範囲</dt>
          <dd>{parameterValue(spec.selection)}</dd>
        </div>
      </dl>
      <p>{spec.condition}</p>
      <p>
        元素役割の由来：
        {spec.roleBasis === "prototype_cross_check"
          ? "プロトタイプとの補助照合"
          : "本文・図に基づく骨格選択の解釈"}
      </p>
      <p>{spec.roleNote}</p>
      <p>{spec.cellScope}</p>
      <p>空隙の向き・座標・占有率の数値や、特定のWyckoff対応は今回指定していません。</p>
    </section>
  );
}
