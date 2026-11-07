# データモデル

`src/data/atlas.js` が各データモジュールを統合し、UI・JSON書き出し・テスト・単一HTMLビルドに同じデータを供給します。

Galassoと関連資料からの拡充分は `expansion.js` と `expansion-models.js`、固体電解質・開放骨格などの拡充分は `breadth.js` と `breadth-models.js` に格納します。それぞれ構造IDで構造カードと単位胞座標を対応させます。

`okamoto.js` と `okamoto-models.js` は岡本の図別派生フローに対応します。`DATA.flows` の各項目は `id`、`title`、`desc`、`edges`（関係IDの配列）、`refs` を持ちます。資料フローでは操作の記述方向に矢印を表示します。図17のCaCl₂→ルチルの高対称化は、確認済みの群–部分群矢印の逆向きになるため、一般の関係データでは無向の比較として保持しています。

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
| `x`, `y` | 参考配置。同順位内の並べ替えにxを使用 |
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

構造や関係を追加したら、一意なID、既存の接続先、参照箇所、骨格の基準を確認し、`npm run check` を実行してください。データのハッシュ一致テストと件数テストは、意図的なデータ更新時に変更内容を確認した上で更新します。表示位置は有向関係の階層から自動で求めます。

`flow-layout.js` は有向関係から階層を求め、親を上段に配置します。無向の比較線は階層を決めません。有向関係に循環を追加した場合は配置の回帰テストが失敗します。

ビルドスクリプトはこのアプリの名前付きES Modulesに限定した処理です。新たなimport構文や同名のトップレベル変数を導入した際は、単一HTMLビルドの互換性も確認してください。

## 横断分類

分類拡充分は `classification-structures.js`、`classification-models.js`、原著の書誌情報は `classification-sources.js` に収録します。`classifications.js` の `DATA.collections` は `id`、`group`（選択欄の見出し）、`title`、`desc`、`ids`（構造IDの配列）、`refs` を持ちます。`parent` と `short` で上位・下位分類間の移動を定義します。

比較表 `table` は `title`、`headings`、`rows` を持ち、各行は `cells` と `ids` で構成します。未収録の構造型は `ids: []` として、文献のみの項目であることをセル内に明示します。既存構造へのリンクは分類内の構造だけを指定します。`DATA.structureLabels[id]` の `key`、`value`、`detail`、`refs` はインスペクターと検索に使います。Glazerの理想回転群と、極性・秩序を伴う実物質の空間群を区別してください。

階層の描画は有向関係の順位を求めた後、各順位を画面幅に応じて1〜3列に折り返します。`x`、`y` は保存された参考配置（`x` は同順位の並べ替え）であり、実際の描画位置は自動で決まります。
