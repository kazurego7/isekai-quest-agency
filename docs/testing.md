# ローカル検証

## 自動テスト

このテストは実DBに専用ユーザーと依頼を作成し、終了時にそのデータだけを削除します。
DB名は `_test` で終わるローカル専用DBにしてください。本番DBでは実行しないでください。

PowerShell での例：

```powershell
$env:TEST_DATABASE_URL = 'postgresql://USER:PASSWORD@127.0.0.1:PORT/isekai_quest_test'
$env:DATABASE_URL = $env:TEST_DATABASE_URL
pnpm db:push --skip-generate
pnpm db:generate
pnpm test:integration
```

`TEST_BASE_URL` がない場合は、セッション情報だけをテスト用に置き換え、実際のAPI処理とDBトランザクションを実行します。この方式には Node.js 22.15 以降の `registerHooks` が必要です。

同じ検証用DBで起動したアプリに対し、実ログインとHTTP経由の処理を確認する場合：

```powershell
$env:TEST_BASE_URL = 'http://localhost:3000'
pnpm test:integration
```

アプリ側の `DATABASE_URL` とテスト側の `TEST_DATABASE_URL` は必ず同じ検証用DBに設定してください。

ビルド済みアプリを専用ポートで起動し、HTTPテスト後に自動停止する場合は、`TEST_DATABASE_URL` と `DATABASE_URL` に上記の検証用DBを指定してから実行します。

```powershell
pnpm build
pnpm test:http
```

`test:http` はサーバーとテストの接続先を `TEST_DATABASE_URL` に統一します。普段の開発サーバーや `.env.local` は変更しません。

## GitHub Actions

PRと `main`・`work`・`develop` へのpushで、専用のPostgreSQLを使ったCIが動きます。
依存ライブラリの脆弱性監査（high以上で失敗）、Lint、実DBのAPIテスト、ビルド、実ログインを含むHTTPテストを実行します。
本番DBやVercelのシークレットは不要です。Vercelへのデプロイは別のワークフローです。

## 確認する動作

- 未認証のAPIアクセス、担当外の操作、下書きの第三者閲覧を拒否する。
- APIレスポンスにパスワードハッシュを含めない。
- 下書き保存・提出・調整・合意からクエストを公開できる。
- 1人・複数人の冒険者を選定し、関連する依頼も進行中になる。
- 担当冒険者だけが完了報告でき、チェック項目の定義を改変できない。
- 写真がDBに保存され、受付による再取得・差し戻し・再提出後も表示できる。
- 達成確認で依頼が完了し、完了後の巻き戻しを拒否する。
- 同時の完了報告・クエスト公開は1件だけ成功する。

## 写真の保存

JPEG・PNG・WebPを最大5枚、1枚1MiB・合計2MiBまで受け付けます。
画像はData URLとして既存の `Quest.photos` に保存するため、別のストレージ契約は不要です。
形式・容量をサーバー側でも検証します。以前の実装でファイル名だけ保存された写真は復元できないため、再選択が必要です。

## WindowsでのPrisma Client生成

開発サーバーがPrismaのDLLを使用している間は、`db:generate` がEPERMになることがあります。
スキーマを変更した場合は、開発サーバーを停止して `db:push` と `db:generate` を実行してから再起動してください。
スキーマに変更がないDB初期化では、`db:push --skip-generate` を使えます。
