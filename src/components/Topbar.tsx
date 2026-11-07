import { DATA } from "../data/atlas.ts";
import type { Tab } from "../state.ts";
import { useAtlas } from "../store.ts";

const TABS: [Tab, string][] = [
  ["explore", "関係を探索"],
  ["lab", "構造ラボ"],
  ["guide", "読み方・出典"],
];

function exportData() {
  const blob = new Blob([JSON.stringify(DATA, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "crystal-atlas-data-v1.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function Topbar() {
  const { state, dispatch } = useAtlas();
  return (
    <header className="topbar">
      <div className="brand">
        <svg className="brandmark" viewBox="0 0 40 44" fill="none" aria-hidden="true">
          <path
            d="M20 2 37 12v20L20 42 3 32V12Z M3 12l17 10 17-10M20 22v20M20 2v20M3 32l17-10 17 10"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <circle cx="20" cy="22" r="3" fill="currentColor" />
        </svg>
        <div>
          <b>CRYSTAL ATLAS</b>
          <small>STRUCTURAL RELATIONSHIPS</small>
        </div>
      </div>
      <nav className="mainnav" aria-label="主な画面">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            data-tab={id}
            className={state.tab === id ? "active" : ""}
            aria-current={state.tab === id ? "page" : undefined}
            onClick={() => dispatch({ type: "tab", tab: id })}
          >
            {label}
          </button>
        ))}
      </nav>
      <div className="topactions">
        <span className="offline">OFFLINE / v1.0</span>
        <button
          id="exportBtn"
          className="small flat"
          title="文献情報を含むアトラスデータをJSONで保存"
          onClick={() => {
            exportData();
            dispatch({ type: "toast", msg: "出典を含む構造・関係データを書き出しました。" });
          }}
        >
          データを書き出す ↓
        </button>
        <button
          id="routesBtn"
          className="small"
          onClick={() => dispatch({ type: "modal", modal: { kind: "routes" } })}
        >
          学習ルート ↗
        </button>
      </div>
    </header>
  );
}

export function Hero() {
  return (
    <section className="hero">
      <div>
        <div className="eyebrow">An atlas of crystal families</div>
        <h1>違う構造を、同じ原理で見る。</h1>
        <p>
          空隙を埋める。原子を並べ分ける。多面体を回す。構造をつなぐ操作と、その根拠を探索する。
        </p>
      </div>
      <div className="stats">
        <div className="stat">
          <strong id="nodeCount">{DATA.nodes.length}</strong>
          <span>構造・模型</span>
        </div>
        <div className="stat">
          <strong id="edgeCount">{DATA.edges.length}</strong>
          <span>構造間の関係</span>
        </div>
        <div className="stat">
          <strong>{String(Object.keys(DATA.sources).length).padStart(2, "0")}</strong>
          <span>参考資料</span>
        </div>
      </div>
    </section>
  );
}
