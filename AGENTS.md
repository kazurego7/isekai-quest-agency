# エージェント向けメモ

## DB連携の進め方（標準フロー）
1. 画面のデータ要件を整理する（保存/表示/更新の対象）
2. `db/schema.ts` を更新する（Cloudflare D1 / Drizzle）
3. `npm run db:generate` で新しいSQLマイグレーションを生成・確認する
4. READMEの手順で未適用のSQLだけをローカルD1へ適用する
5. APIと画面をDB連携に切り替える
6. 画面の作成→一覧→詳細→更新の流れで動作確認する

## 補足
- 正式なコードはこのプロジェクト直下のSites版。npmとpackage-lock.jsonを使用する。
- ローカルD1・R2の実データは `.wrangler/state` に保存する。削除・初期化しない。
- 通常利用は `npm run build:tailscale` → `npm run start:tailscale`（5177、/isekai、圧縮済み配信）。コード変更後は再ビルド・再起動する。
- 編集時は `npm run dev`（5177）または `npm run dev:tailscale`（5177、/isekai）。開発用配信を普段のリモート利用に使わない。
- 公開用 `dist` とローカル用 `.local/tailscale-build` を混同しない。ローカル用ビルドはSitesへ公開しない。
- Windows自動起動は `scripts/start-background.ps1`。PostgreSQL・Prismaは使用しない。
- 公開は既存の `.openai/hosting.json` のSiteを再利用する。

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
