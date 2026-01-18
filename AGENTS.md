# エージェント向けメモ

## DB連携の進め方（標準フロー）
1. 画面のデータ要件を整理する（保存/表示/更新の対象）
2. `prisma/schema.prisma` を更新する
3. `pnpm db:push` でDBへ反映する
4. `pnpm db:generate` でPrisma Clientを更新する
5. APIと画面をDB連携に切り替える
6. 画面の作成→一覧→詳細→更新の流れで動作確認する

## 補足
- スキーマ変更時は `db:push` と `db:generate` をセットで実行する
- ローカルDBは `pnpm db:up` で起動する（compose.yml）
