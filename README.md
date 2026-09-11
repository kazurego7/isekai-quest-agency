# 異世界クエスト斡旋アプリ

Next.js / NextAuth / Prisma / PostgreSQL による、依頼・合意・クエスト公開・冒険者選定・完了確認のアプリです。

## Windowsでのローカル開発

Node.js 24 LTS（最低22.15）、pnpm 11.19.0、PowerShell 7、PostgreSQLのコマンド（`initdb`・`pg_ctl`・`psql`・`createdb`）が使える環境で実行します。

```powershell
pnpm install --frozen-lockfile
pnpm db:local
pnpm db:push --skip-generate
pnpm db:generate
pnpm db:local:staff
pnpm dev
```

- 開発用DBは `.local/postgres` に保存し、`127.0.0.1:55432` でのみ接続を受け付けます。既存の5432番ポートのDBとは別です。
- `db:local` は `.env.local` のDB接続先をこの開発用DBに設定します。既存の認証用シークレットなどは保持します。
- 受付ユーザーのログイン情報は `.local/receptionist.txt` に保存します。再実行しても既存パスワードは変更しません。
- 一般ユーザーは画面の「新規登録」から作成できます。
- 2回目以降は `pnpm db:local` と `pnpm dev` で起動します。DBの停止は `pnpm db:local:stop` です。
- `.local` と `.env.local` はGit管理対象外です。`.local/postgres` にはデータがあるため削除しないでください。
- Prismaのコマンドも `.env.local` を読み込みます。環境変数を明示した場合はそちらが優先されます。

Dockerを使う場合は `pnpm db:up` で `compose.yml` のDBを起動し、その接続先を `.env.local` に設定してください。

テスト手順・写真の制限・Windowsでの注意事項は [docs/testing.md](docs/testing.md) を参照してください。

## ビルドと起動

```powershell
pnpm lint
pnpm build
pnpm start
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。
本番環境では `DATABASE_URL`・`NEXTAUTH_URL`・十分にランダムな `NEXTAUTH_SECRET` を設定してください。
本番でシークレットが未設定の場合は起動を拒否します。

## GitHub Actions + Vercel (build in CI)

This repo ships with `.github/workflows/vercel-deploy.yml` to build on GitHub Actions and deploy via the Vercel CLI.

Required repository secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

To get the IDs, run locally:

```bash
pnpm dlx vercel@latest login
pnpm dlx vercel@latest link
cat .vercel/project.json
```

Then add the values to GitHub repository secrets.
