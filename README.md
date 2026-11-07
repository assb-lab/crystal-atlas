# Crystal Atlas — 結晶構造の関係地図

結晶構造を、**空隙占有・原子の規則化・歪み・積層・群–部分群関係**から探索するインタラクティブアトラスです。React + TypeScript で実装し、[Vite+](https://viteplus.dev/)（`vp`）でビルド・テスト・整形・lint を行います。

## 必要なもの

| ツール  | バージョン                                                      |
| ------- | --------------------------------------------------------------- |
| Node.js | 26 以上                                                         |
| pnpm    | 12（`package.json` の `devEngines` で固定。違う版なら自動取得） |
| Chrome  | E2Eテストのみ。インストール済みの Google Chrome を使用します    |

## 起動

```sh
git clone https://github.com/assb-lab/crystal-atlas.git
cd crystal-atlas
pnpm install
pnpm dev
```

`http://localhost:4173` をブラウザで開いてください。

## ビルド・オフライン版

```sh
pnpm build
```

| 出力                                | 用途                                                                  |
| ----------------------------------- | --------------------------------------------------------------------- |
| `dist/index.html` と `dist/assets/` | 静的Webサーバーに配置する版。相対パスなので任意のサブパスに置けます   |
| `dist/crystal-atlas.html`           | JS・CSS・データを内蔵した単一HTML。ダブルクリックでオフライン利用可能 |

`pnpm preview` でビルド結果を確認できます。`dist/` は生成物です。単一HTMLは `vp build --mode standalone` で、`vite.config.ts` の `standaloneHtml` プラグインが生成します。

## 機能

- **関係を探索**：構造名・組成・Strukturbericht記号の検索、6ファミリーの切替、SVGグラフの拡大／移動、構造・関係の詳細、一覧表示。
  - **全体地図**：ファミリーごとのタイル（縮小図・件数・代表構造）と、ファミリー間の関係を本数付きの1本の線にまとめた表示。線を選ぶと関係一覧、タイルを選ぶとファミリーの地図に入ります。
  - **ファミリー地図**：「全体地図 ›」のパンくず、選択構造の他ファミリーとのつながり（地図上部のタグからジャンプ）。
  - **パネル**：デスクトップでは左右のパネルが画面端に固定。`[` / `]` キーまたはアイコンで折りたたみ（状態はブラウザに保存）。
- **比較と学習**：2構造の横並び比較、地図内の接続経路、6つの学習ルート。
- **構造ラボ**：4つのfcc副格子の表示切替、12種類のプリセット、Canvasによる回転模型、T/O空隙占有率の数え上げ。
- **出典**：構造・関係ごとの文献箇所、印刷ページとPDFページの対応、手元のPDFのローカル関連付け、JSONデータ書き出し。

初期データは**56構造・模型、62関係、5資料**。うち**13関係**を文献確認済みの群–部分群関係として区別しています。

## ソース構成

```text
index.html                    Viteのエントリーページ
vite.config.ts                Vite+ 設定（ビルド・テスト・整形・lint・単一HTML生成）
playwright.config.ts          E2Eテスト設定
src/
  main.tsx                    Reactの起動
  App.tsx                     画面全体、状態の保持、パネル状態の保存
  state.ts                    画面状態と遷移（純粋なreducer）
  store.ts                    状態のContextと共通フック
  types.ts                    データの型
  components/
    Topbar.tsx                ヘッダー・ヒーロー
    explore/                  関係を探索（サイドバー、地図、全体地図、詳細、比較トレイ）
    lab/Lab.tsx               構造ラボ
    guide/Guide.tsx           読み方・出典
    Modal.tsx                 比較・学習ルートのダイアログ
    RefChips.tsx              出典ボタン
    CrystalCanvas.tsx         回転模型のReactラッパー
  lib/
    graph.ts                  表示対象の抽出、地図の幾何、ファミリー間の束ね
    viewer.ts                 理想構造の生成とCanvas回転ビューア
    format.ts                 分数表記、検索文字列正規化、接続経路探索
  data/
    atlas.ts                  データセットの統合・バージョン
    structures.ts             構造ノード
    relationships.ts          構造間の関係
    families.ts               ファミリー情報
    sources.ts                参考資料・ページ対応
    presets.ts                関係の種類、学習ルート、ラボのプリセット
  styles/main.css             レイアウト・配色・レスポンシブ対応
tests/
  unit/                       データ整合性・reducer・地図幾何のテスト（Vitest）
  e2e/smoke.spec.ts           配信版と単一HTMLのブラウザ操作テスト（Playwright）
```

データ追加の項目は [データモデル](docs/DATA_MODEL.md)、参考資料は [出典一覧](docs/SOURCES.md) を参照してください。

## 開発コマンド

```sh
pnpm check     # 整形・lint・型チェック（vp check。自動修正は pnpm exec vp check --fix）
pnpm test      # ユニットテスト（vp test run）
pnpm build     # 型チェック後に配信版と単一HTMLを生成
pnpm e2e       # ビルド済みの dist/ に対するE2Eテスト
pnpm verify    # 上記すべてを順に実行
```

E2Eテストはインストール済みの Google Chrome を使います（ブラウザのダウンロード不要）。別のブラウザを使う場合は `PLAYWRIGHT_CHANNEL` を指定するか、`pnpm exec playwright install chromium` の後に `PLAYWRIGHT_CHANNEL=chromium` を指定してください。
