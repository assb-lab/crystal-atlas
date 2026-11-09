# Crystal Atlas の知識グラフ基盤

Family（分類）・Derivation（構造派生）・Symmetry（対称性）は、同じLadybugDBの3つの表示です。Derivationを既定にし、既存の全世代充填ツリーと、DBに登録した操作・根拠の閲覧を併用します。

この段階は既存収録データを移行する基盤です。refs全文を網羅したDB、全構造の機械検証済み変換、原子周期グラフ、ページごとの抽出完了を意味しません。

## 正本と生成物

- 正本：`src/data/` の既存データ、`src/knowledge/dataset.ts` の明示的な移行・操作注釈、`src/knowledge/schema.ts` のスキーマ。
- `pnpm build:db`：LadybugDB 0.22.3のNode向けWASMで、同じ入力からDBを再生成します。
- `.atlas-build/`：Git除外した生成DB、版・SHA-256・件数のmanifest、照合用JSON、DDL。キャッシュ判定の前に実エンジン版を確認し、ストレージ版、生成処理のソース、入力、DB・JSON・DDLそれぞれの内容をハッシュで照合します。補助ファイルの欠落も再生成の対象です。
- `dist/knowledge/`：静的配信用のDB・manifest・Worker・モジュール・ライセンス・照合用JSON・DDL。DB・モジュール・Workerは内容ハッシュ付きファイル名にし、配信manifestのfilesで一組を指定します。クライアントはmanifestを毎回再検証してから、その組のファイルを読み込みます。
- `dist/crystal-atlas.html`：DBとWorkerも内蔵し、file://で読み込む版。WASM関連の内蔵により従来版より大きくなります。

現時点の配信版はViteの静的SPAです。構造ごとのSSGページ生成はまだ実装していません。APIサーバーやDBサーバー、外部CDNは不要です。

## レコードと関係

物理スキーマの定義は `src/knowledge/schema.ts`、生成DDLは `dist/knowledge/schema.cypher` を参照してください。

| ノード                         | 意味                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------ |
| Entity                         | 構造型、基本充填、既存の物質・相カード、分類、編集上の概念。kindで区別               |
| Assertion                      | 主語・目的語を持つ独立した主張。domain、操作、根拠の性質、再照合状態、原データを保持 |
| OperationStep                  | 派生の操作と対象、パラメータ。HasStepのordinalで操作順を表現                         |
| Document / SourceSpan          | 版を含む書誌と、印刷頁・PDF頁・図表・URL等の参照位置                                 |
| StructureModel                 | 格子・座標・占有率・出典の既存モデル。Modelsで対象に接続                             |
| DerivationRoute                | 文献の図にある提示順。RouteMemberのordinalは合成反応順序を表さない                   |
| Asset / Mention                | Assetはファイル指紋と目録。Mentionは原表記・登場位置を持つ候補（対応未確定）         |
| CoverageReview / ProcessingRun | 範囲別の調査状態と目録・候補抽出の活動。科学的照合の完了とは区別                     |
| RelationCandidate              | 根拠と登場記録の端点を持つ未確定の派生・比較候補。Assertionとは別                    |

`Subject`・`Object`がAssertionとEntityを、`HasEvidence`・`InDocument`がAssertionと文献箇所を結びます。構造型・物質・相を名前や化学式だけで名寄せしません。既存の物質・相を混在するカードは `legacy_material_or_phase` として保持し、今後の文献照合で分離します。

Familyの既存 `family` 属性は編集上の所属として移行します。構造カードの文献参照を分類の証拠へ流用しません。横断分類はその分類に付いている文献箇所を保持し、複数所属と包含を許します。

Derivationには有向の空隙占有・規則化・歪み・積層・反型の記述を移します。無向の比較はcomparisonとして残します。既存の短い記述を自動で多数の操作へ分解せず、まず一段の記述として原文情報を保存します。詳細未転記のtargetはNULLです。構造構築の説明は、実験で確認した相転移や合成経路と区別します。

comparisonはDerivationの「比較（派生操作ではない）」区分で閲覧でき、派生操作の件数には含めません。操作の対象・数値に付けた注釈は、文献該当箇所との再照合が未実施であることを個別に表示します。根拠がない場合もbasisを確認し、編集上の所属と出典未登録の主張を区別します。Family・Symmetryで構造を選んでも、非表示の充填ツリーの分類・選択・折り畳み・探索履歴を変更しません。

Symmetryは独立したAssertionです。既存のstrictは `literature_confirmed` として引き継ぎ、未確認関係は `unverified` です。変換行列・原点移動・Wyckoff対応は推測で数値化せずNULLにします。文章で転記済みのbasis・splitは原データとして保存します。現在の全関係は移行後の再照合が未実施です。

同じ構造変化について操作も対称性対応も明示されている場合、別レコードを `ExplainsSymmetryOf` でつなぎます。最初の注釈は既存e6（fccの3:1規則化）、e24（bccの色分け）、e56（ルチル型の八面体回転）です。単に空間群の組が一致するという理由で対応を作りません。

## ブラウザ実行と互換対応

WASMはレコード探索を開いたときに読み込み、ページ内で一つのWorkerを共有します。配布DBの長さ・ハッシュ（Web Crypto利用時）・スキーマ版・エンジン版・ストレージ版を確認し、仮想FSへ一度だけ配置してreadOnlyで開きます。画面の問い合わせは固定のCypherとパラメータバインドを使用し、一つの接続上で直列化します。読み込み失敗は画面に表示し、再試行できます。起動後にWorkerが停止して照会が応答しなくなった場合も、5秒で照会エラーを表示し、再試行でWorkerを終了してからDBを開き直します。終了待ちは2秒に制限し、所有するBlob URLを解放します。初回起動にはベンダー既定のタイムアウトが適用されます。JSONへの暗黙の代替照会はしません。

0.22.3の公式async Workerは、WasmFS側に存在しない `FS.writeFile` を呼びます。このため配布時に `src/knowledge/worker-compat.ts` の限定的な互換処理を適用します。`/atlas.lbdb` の初回配置だけに対し、エクスポート済みの `FS.createDataFile` で読み取り専用ファイルを作ります。node_modulesやWASMバイナリは変更しません。期待する呼び出しが一箇所でなければビルドを失敗させ、上流更新時に再検討を必須にします。

標準の単一スレッド版を使うため、COOP/COEPやSharedArrayBufferは不要です。OPFS、ローカル編集の永続化、複数タブからの書き込み、共同編集はこの実装に含みません。

WorkerのパスはURLオブジェクトで渡します。パッケージ内のthreadsが文字列URLに適用するimportScriptsラッパーを避け、標準のWorkerとして起動します。これにより、file://の単一HTMLでも内蔵Blobから起動できます。ブラウザのセキュリティ設定は変更しません。

## 検証

```sh
pnpm check
pnpm test
pnpm test:db
pnpm build
pnpm e2e
```

`test:db` は生成DBを読み取り専用で再オープンし、全テーブルの全行・全列を移行前の投影データと照合します。3表示・比較・操作・対称性との対応の実照会、出典、パラメータの扱い、書き込み拒否も確認します。ブラウザE2Eでは同じ生成DBを実WASMで開き、配信版とネットワークを無効化した単一HTML版の操作・出典・表示切替・再読み込み、デスクトップと390pxでの表示を確認します。さらに破損したDBの再取得、Workerを実際に停止した後の再接続、別Atlasでの選択による充填ツリーの状態保持を検証します。

物理スキーマv2では、文献候補をCandidateAsset、確認済み対応をHasAsset、目録生成活動をCataloguedByで接続します。[文献目録と調査台帳](LITERATURE_CATALOG.md)を参照してください。

後続の実装は、登場記録の抽出と名寄せ、構造型／物質／相の分離、形式化したサイト対応、周期グラフ等をそれぞれIssueに切り出します。

## 文献からの抽出候補（スキーマv3）

Mentionは原表記と特定のSourceSpanを持ち、同じ名前の別の登場位置も独立したレコードです。CandidateRefersToは既存Entityとの対応候補で、確定したRefersToとは別です。

RelationCandidateは派生または比較の未確定候補で、CandidateSubject/ObjectでMentionに、CandidateEvidenceで根拠箇所に、CandidateMatchesで既存Assertionの照合対象に接続します。CandidateMatchesは同一性を断定せず、逆向きや異なる出発点・操作についてnoteを保持します。新規Assertionや群–部分群の厳密な対応へ自動昇格しません。

初回バッチはKのPDF 2–3頁です。ProcessingRunに対象SHA・PDF頁・確認した印刷頁・実施者・範囲と制限を保持し、MentionByRun / CandidateByRun / ByRunで登場記録・関係候補・対象台帳に接続します。図と本文にある構築説明と、編集上の比較をbasisで区別します。原子の追加を含む貫入、空孔占有、同種元素への変更を同じ操作へ統合しません。新規13箇所だけにLocatedInを付け、文献全体や既存出典の頁対応を確認したとは扱いません。詳細は[抽出パイロット](EXTRACTION_PILOT.md)を参照してください。

## 候補の採否と採用結果（スキーマv4）

CandidateDecisionで元候補を保持したまま初回判断を追加します。採用した登場記録のRefersToと、採用した関係の独立したAssertionを判断・根拠・活動へ接続します。Kの初回判断は登場記録9採用・1保留、関係4採用・6保留です。既存の科学的主張や調査範囲を一括変更せず、採用分も文脈の照合と数値検証を区別して表示します。[候補の初回判断](CANDIDATE_DECISIONS.md)を参照してください。

## 格子型と構造モチーフ・判断履歴（スキーマv5）

Issue #25で`bravais_lattice_type`を独立したEntityのkindとして追加しました。既存fccモチーフとcF格子型を、根拠と適用範囲のある`description`のAssertionで記述します。この関係は3Atlas共通の対象プロフィールで表示し、Family所属・Derivation操作・Symmetry対応とは別に扱います。旧ID・原子モデルは維持します。

保留Mentionを新設格子型へ再照合した判断を追加し、`SupersedesDecision`（新→旧）で履歴を保持します。履歴照会と現在の判断照会を区別し、初回の保留を上書きしません。採用済み関係の撤回・改訂一般は未実装です。根拠・意味・現在件数は[候補の判断記録](CANDIDATE_DECISIONS.md#issue-25格子型の識別と保留1件の再照合)に記載します。
