# データモデル

`src/data/atlas.js` が各データモジュールを統合し、UI・JSON書き出し・テスト・単一HTMLビルドに同じデータを供給します。

追加資料に基づく構造・関係は `expansion.js`、単位胞の座標は `expansion-models.js` に格納します。両者は共通の構造IDで対応します。

## 構造ノード: `structures.js`

必須項目は `id`、`name`、`formula`、`family`、`sg`、`desc`、`packing`、`coord`、`link`、`refs`、`x`、`y` です。

| 項目 | 意味 |
| --- | --- |
| `id` | 一意な内部ID。関係・ルート・模型から参照 |
| `family` | `families.js` にあるファミリーID |
| `sg` | 出典に沿った空間群・対称性の表示文字列 |
| `packing`, `coord`, `link` | 骨格、配位環境、多面体・部分構造の連結 |
| `occ` | 任意。全T孔・全O孔をそれぞれ分母にした `[T, O]` 占有率 |
| `host` | `occ` の基準となる充填粒子。`occ` を設定した場合に必要 |
| `refs` | 参照箇所の配列。例: `{s: 'M06', p: 161, sec: 'Fig.15.3'}` |
| `x`, `y` | ファミリー内のグラフ座標 |
| `model` | 任意。`viewer.js` が生成できる既存理想模型のID。座標データは構造IDで参照 |
| `aliases`, `note` | 任意。検索別名、注意点 |

## 単位胞の座標データ `models.js`

構造IDごとに `kind`、`source`、`spaceGroup`、`parameters`、`groups` を指定します。`parameters` は `[a, b, c, α, β, γ]` です。長さは Å、角度は度です。`schematic` の長さには相対値を使います。

`groups` の各要素は `wyckoff`、`occupants`（元素名から占有率への対応）、`positions`（その軌道を展開した分率座標、各成分は [0, 1)）を持ちます。占有率の和が1未満の場合、残りを空孔として表示します。混合占有は同じ位置に対する平均です。境界上の描画用の像はビューアが展開します。

`kind` は `prototype`、`literature`、`computed`、`average`、`schematic` のいずれかです。座標を参照した資料を `source.label` と任意の `source.url` に記載します。座標の設定や代表組成が構造カードの説明と異なるときは `note` に明記します。

## 関係: `relationships.js`

必須項目は `id`、`a`、`b`、`kind`、`label`、`desc`、`refs` です。`a` と `b` は構造IDです。

`kind` は `symmetry`、`occupation`、`ordering`、`distortion`、`stacking`、`analogy`、`antitype` のいずれかです。ラベル・配色・説明は `presets.js` の `KINDS` にあります。

群–部分群として出典確認した関係には `strict: true` を付け、`index`、`basis`、`split` に部分群の種類・指数、基底／原点／セル、サイト対応を記載します。未転記・未検証の詳細は説明中で明示してください。単に空間群が似ているという理由で `strict` を設定しないでください。

`undirected: true` は方向を主張しない関係です。比較画面の接続経路探索は、表示上の矢印の向きによらず無向グラフとして動作します。

## 出典: `sources.js`

各参照の `s` が出典IDを指します。PDFページ番号は通常、**印刷ページ `p` + 出典の `offset`** です。前付けや挿入ページの影響で差が変わる場合は、参照ごとに `pdfPage` を指定します。どちらも1始まりです。公開PDFには `url`、手元で関連付ける資料には `filename` を指定します。`citation` は画面に表示する正式な書誌情報です。Web資料を参照するときは `p` を省略し、出典の `article` または個別の `ref.url` にリンク先を指定します。

## 更新時

構造や関係を追加したら、一意なID、既存の接続先、参照箇所、骨格の基準を確認し、`npm run check` を実行してください。データのハッシュ一致テストと件数テストは、意図的なデータ更新時に変更内容を確認した上で更新します。ファミリー配置は手動座標です。

ビルドスクリプトはこのアプリの名前付きES Modulesに限定した処理です。新たなimport構文や同名のトップレベル変数を導入した際は、単一HTMLビルドの互換性も確認してください。
