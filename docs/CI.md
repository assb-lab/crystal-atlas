# 継続検証

Issue #29で、main／developへのpush、両ブランチ向けPR、手動起動に対する`Verify Atlas`を追加しました。実行結果は各PRのチェックとGitHub Actionsのログで確認します。ワークフローを追加したことと、GitHub上で検証が成功したことを区別してください。

Node 26.13.0・pnpm 12.18.0を指定し、lockfile固定で依存をインストールします。GitHub Actionsは確認したリリースのコミットSHAに固定しています。既存の依存管理設定を緩和しません。ブラウザはPlaywrightが管理するChromiumをインストールし、ローカル既定のChromeとは別に指定します。

`pnpm verify`でformat/lint/typecheck、ユニット、LadybugDB全行・全列の読み取り専用照合、配信版／単一HTMLビルド、実ブラウザE2Eを実行します。CIにはrefsを置かず、PDF・全文・頁画像・秘密情報を要求しません。台帳と公開可能な要約メタデータだけで生成・照会を検証します。PDF現物の科学的照合をCIが代行するものではありません。

ジョブは25分で終了し、同じrefの新しい実行で前の実行を取り消します。ブラウザは2worker、再試行による成功の水増しは行いません。失敗した実行では`test-results/`のスクリーンショット・トレース・エラー文脈を14日間保持します。成果物への秘密情報追加を前提にしていません。

権限はcontents: readのみで、チェックアウトの認証情報も保持しません。デプロイ、PRのマージ、ブランチ削除は実行しません。

設定は[setup-node](https://github.com/actions/setup-node)、[pnpm/action-setup](https://github.com/pnpm/action-setup)、[Playwright CI](https://playwright.dev/docs/ci-intro)の公式資料を確認して作成しました。
