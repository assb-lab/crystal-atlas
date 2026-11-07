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

- **関係を探索**：構造名・組成・Strukturbericht記号の検索、6ファミリーの切替、SVGグラフの拡大／移動、構造・関係の詳細、一覧表示。
- **比較と学習**：2構造の横並び比較、地図内の接続経路、6つの学習ルート。
- **構造ラボ**：4つのfcc副格子の表示切替、12種類のプリセット、Canvasによる回転模型、T/O空隙占有率の数え上げ。
- **出典**：構造・関係ごとの文献箇所、印刷ページとPDFページの対応、手元のPDFのローカル関連付け、JSONデータ書き出し。

初期データは**56構造・模型、62関係、5資料**。うち**13関係**を文献確認済みの群–部分群関係として区別しています。分割時には内容を変更していません。

## ソース構成

```text
index.html                  画面のHTML
styles/main.css             レイアウト・配色・レスポンシブ対応
src/
  main.js                   UI、2D関係グラフ、検索、比較、出典、イベント
  viewer.js                 理想構造の生成とCanvas回転ビューア
  utils.js                  表示形式、検索文字列正規化、接続経路探索
  data/
    atlas.js                データセットの統合・バージョン
    structures.js           構造ノード
    relationships.js        構造間の関係
    families.js             ファミリー情報・地図配置
    sources.js              参考資料・ページ対応
    presets.js              関係の種類、学習ルート、ラボのプリセット
scripts/
  serve.mjs                 ローカル開発サーバー
  build.mjs                 静的配布版・単一HTMLの生成
tests/
  atlas.test.mjs            データ整合性・検索・幾何模型のテスト
  original-data.sha256       分割前のデータの検証用ハッシュ
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
python -m pip install playwright
python -m playwright install chromium
python tests/browser_smoke.py
```

`CHROMIUM_PATH` で既存のChromium実行ファイルを指定できます。URLナビゲーションが許可されない検証環境では `ATLAS_TEST_IN_MEMORY=1` により、分割版をネイティブES ModulesのBlob URL、単一HTML版をメモリ上のHTMLとして検証します。これはHTTP配信・`file://`ナビゲーション自体の検証とは区別してください。スクリーンショットは `test-results/` に保存されます。

## 読み方と限界

このアトラスは、全ての関係を一本の厳密なBärnighausen treeにしたものではありません。群–部分群、空隙占有、積層、反型、幾何学的な類似を区別しています。確認済み関係でも、未転記の基底・原点・位置変換がある場合は詳細に注記しています。

模型は**学習用の理想化したサイト配置**で、実測CIFではありません。矢印や最短接続経路は、実行可能な相転移・反応経路を意味しません。CIF自動分類、全230空間群の網羅、相安定性やイオン伝導率の予測は行いません。Seidel–Pöttgen論文後半のBaAl₄・CeMg₂Si₂ファミリーの詳細枝は初期版では未収録です。

参考書PDF、書籍のページ画像、全文はリポジトリに含めません。手元のPDFはブラウザ内で関連付けるだけで、サーバーには送信しません。参考資料の権利は各権利者に帰属します。このリポジトリのライセンスは未設定です。
