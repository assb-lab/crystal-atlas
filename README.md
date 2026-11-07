# Crystal Atlas — 結晶構造の関係地図

結晶構造を、**空隙占有・原子の規則化・歪み・積層・群–部分群関係**から探索するインタラクティブアトラスです。単一HTML版 v1.0 を、データ・UI・描画・CSSに分割しました。フレームワークや外部CDNへの依存はありません。

## 起動

Node.js 22以上を使用します。依存パッケージのインストールは不要です。

```sh
git clone https://github.com/assb-lab/crystal-atlas.git
cd crystal-atlas
npm run dev
```

`http://127.0.0.1:4173` をブラウザで開いてください。ポート変更は `npm run dev -- --port 8080` です。分割版はES Modulesを使用するため、`index.html` の直接ダブルクリックではなくHTTPサーバー経由で開きます。

## ビルド・オフライン版

```sh
npm run build
```

| 出力 | 用途 |
| --- | --- |
| `dist/index.html` と `dist/src/`・`dist/styles/` | 静的Webサーバーに配置する分割版 |
| `dist/crystal-atlas.html` | データ・JS・CSSを内蔵した単一HTML。ダブルクリックでオフライン利用可能 |

`dist/` は生成物です。編集するのはルートの `index.html`、`src/`、`styles/` です。GitHub Pages等へのデプロイやリポジトリ設定の変更は、この初期登録には含めていません。

## 機能

- **関係を探索** — 構造名・組成・Strukturbericht記号の検索、26ファミリーの切替、SVGグラフの拡大／移動、構造・関係の詳細、一覧表示。⌘KまたはCtrl+Kで、現在のファミリーやタブをまたいだ全件検索を開けます。
- **比較と学習** — 2つの単位胞を同期回転・ズームし、格子定数、Wyckoff位置、サイト占有、構造間の直接の関係を比較。地図内の接続経路と16の学習ルート。
- **構造ラボ**：4つのfcc副格子の表示切替、12種類のプリセット、Canvasによる回転模型、T/O空隙占有率の数え上げ。
- **出典**：構造・関係ごとの文献箇所、印刷ページとPDFページの対応、手元のPDFのローカル関連付け、JSONデータ書き出し。

v1.4 は**272構造、342関係、21資料**を収録し、全構造に回転できる単位胞を用意しています。うち**14関係**は文献確認済みの群–部分群関係です。Galasso の2冊で扱う構造に加え、LLZO・NASICON・LGPSなどの固体電解質、リン酸塩、ケイ酸塩、ゼオライト、混合アニオン化合物を収録しています。

派生矢印を持つ親構造は上段、派生構造は下段に自動配置します。「岡本佳比古の派生図」から、格子の貫入、四つのfcc副格子、充填面の規則化、岩塩・NiAs型からの派生、ブロック置換、層状シアー、Ir酸化物の関連構造を図番号別に探索できます。

単位胞と比較画面、構造ラボに、実格子方向のa・b・c、逆格子方向のa*・b*・c*、反対側からの−a・−b・−cの投影ボタンがあります。軸方向の投影では平行投影を使用し、単斜晶・三斜晶でも実格子と逆格子を区別します。比較画面では同じ軸名を各単位胞の格子に適用します。

## ソース構成

```text
index.html                  画面のHTML
styles/main.css             レイアウト・配色・レスポンシブ対応
src/
  main.js                   UI、2D関係グラフ、検索、比較、出典、イベント
  viewer.js                 単位胞の展開とCanvas回転ビューア
  model-panels.js            サイト凡例と比較用モデルパネル
  utils.js                  表示形式、検索文字列正規化、接続経路探索
  data/
    atlas.js                データセットの統合・バージョン
    structures.js           構造ノード
    models.js               格子定数・Wyckoff位置・分率座標・座標の出典
    expansion.js            拡充した構造と構造間の関係
    expansion-models.js     拡充した構造の単位胞座標
    breadth.js              電解質・ケイ酸塩・開放骨格などの構造と比較
    breadth-models.js       回折精密化とIZA-SCの理想化骨格による単位胞座標
    okamoto.js              岡本の図別派生フローと追加構造・関係
    okamoto-models.js       岡本の派生図で比較する単位胞の代表座標
    relationships.js        構造間の関係
    families.js             ファミリー情報・地図配置
    sources.js              参考資料・ページ対応
    presets.js              関係の種類、学習ルート、ラボのプリセット
scripts/
  serve.mjs                 ローカル開発サーバー
  build.mjs                 静的配布版・単一HTMLの生成
tests/
  atlas.test.mjs            データ整合性・検索・幾何模型のテスト
  dataset.sha256             現行データの検証用ハッシュ
  browser_smoke.py           任意実行のブラウザ操作テスト
```

データ追加の項目は [データモデル](docs/DATA_MODEL.md)、参考資料は [出典一覧](docs/SOURCES.md) を参照してください。

## テスト

```sh
npm test        # Node.js標準テストランナー。追加依存なし
npm run check   # テストとビルド
```

ブラウザ操作テストを実行する場合のみ、PythonとPlaywrightを用意します。

```sh
uv run --no-project --with playwright -- python -m playwright install chromium
uv run --no-project --with playwright -- python tests/browser_smoke.py
```

`CHROMIUM_PATH` で既存のChromium実行ファイルを指定できます。URLナビゲーションが許可されない検証環境では `ATLAS_TEST_IN_MEMORY=1` により、分割版をネイティブES ModulesのBlob URL、単一HTML版をメモリ上のHTMLとして検証します。これはHTTP配信・`file://`ナビゲーション自体の検証とは区別してください。スクリーンショットは `test-results/` に保存されます。

## 読み方と限界

このアトラスは、全ての関係を一本の厳密なBärnighausen treeにしたものではありません。群–部分群、空隙占有、積層、反型、幾何学的な類似を区別しています。確認済み関係でも、未転記の基底・原点・位置変換がある場合は詳細に注記しています。

座標はプロトタイプ、文献の構造データ、計算緩和、平均構造、理想模型に区別しています。格子定数とサイトは採用した代表セルに対応します。比較ビューはセルごとに表示倍率を調整し、座標変換を行わずに回転を同期します。矢印と接続列は文献に基づく構造の関係を表します。

手元のPDFは Git 除外済みの `refs/` に置けます。アプリでは「参考資料とページ対応」から、ブラウザ内でPDFを関連付けます。参考資料の権利は各権利者に帰属します。このリポジトリのライセンスは未設定です。
