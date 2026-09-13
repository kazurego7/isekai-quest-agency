import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, primaryKey, index, check } from "drizzle-orm/sqlite-core";
const timestamps = () => ({ createdAt: text().notNull(), updatedAt: text().notNull(), revision: integer().notNull().default(0) });
export const users = sqliteTable("users", {
  id: text().primaryKey(), authId: text().notNull().unique(), userId: text().notNull().unique(),
  displayName: text().notNull(), userType: text().notNull(), role: text().notNull(), themePreference: text().notNull().default("system"), ...timestamps(),
});
// Claimed only during initial owner-private publication; later users cannot replace it.
export const owner = sqliteTable("owner", { singleton: integer().primaryKey(), authId: text().notNull() });
export const requestTypes = sqliteTable("requestTypes", {id:text().primaryKey(),name:text().notNull()});
export const requestRegions = sqliteTable("requestRegions", {id:text().primaryKey(),name:text().notNull()});
export const requests = sqliteTable("requests", {
  id: text().primaryKey(), title: text().notNull(), status: text().notNull(),
  requesterId: text().notNull().references(() => users.id), receptionistId: text().references(() => users.id),
  formatVersion: integer().notNull().default(0), categoryId: text().references(() => requestTypes.id), regionId: text().references(() => requestRegions.id), deadlineMode: text().notNull().default("unknown"), deadlineDate: text(), rewardMode: text().notNull().default("consult"), rewardAmount: integer(), attachments: text().notNull().default("[]"),
  purpose: text(), location: text(), deadline: text(), risk: text(), reward: text(), requesterNote: text(),
  notes: text(), summary: text(), previousConditions: text(), requesterAgreed: integer({mode:"boolean"}).notNull().default(false),
  receptionistAgreed: integer({mode:"boolean"}).notNull().default(false), ...timestamps(),
}, t => [index("requests_requester_created").on(t.requesterId,t.createdAt), index("requests_status").on(t.status)]);
export const adventurers = sqliteTable("adventurers", {
  id: text().primaryKey(), userId: text().notNull().unique().references(() => users.id), code: text().notNull().unique(),
  name: text().notNull(), rank: text().notNull(), role: text().notNull(), note: text(), source: text().notNull(), appliedAt: text(), ...timestamps(),
});
export const quests = sqliteTable("quests", {
  id: text().primaryKey(), requestId: text().notNull().unique().references(() => requests.id), title: text().notNull(), status: text().notNull(),
  receptionistId: text().references(() => users.id), adventurerId: text().references(() => users.id), reward: text(), rank: text(),
  locationMode: text().notNull().default("specified"),
  publishVersion: integer().notNull().default(0), categoryId: text().references(() => requestTypes.id), regionId: text().references(() => requestRegions.id), location: text(), deadlineMode: text().notNull().default("unknown"), deadlineDate: text(), publicNote: text(), publicAttachments: text().notNull().default("[]"),
  recruitCount: integer(), minimumRank: text(), participationNote: text(), grossReward: integer(), commissionRate: integer(), commissionAmount: integer(), netReward: integer(), distributionMode: text(), distributionNote: text(), meetingAt: text(), meetingPlace: text(),
  detail: text(), deliverables: text(), supplies: text(), mapNotes: text(), risk: text(), channel: text(), slots: text(),
  summary: text(), reportComment: text(), reviewNote: text(), checklist: text().notNull().default("[]"), photos: text().notNull().default("[]"), ...timestamps(),
}, t => [index("quests_status_created").on(t.status,t.createdAt)]);
export const applications = sqliteTable("applications", {
  questId: text().notNull().references(() => quests.id, {onDelete:"cascade"}),
  adventurerId: text().notNull().references(() => adventurers.id), appliedAt: text().notNull(),
}, t => [primaryKey({columns:[t.questId,t.adventurerId]})]);
export const selections = sqliteTable("selections", {
  questId: text().notNull().references(() => quests.id, {onDelete:"cascade"}),
  adventurerId: text().notNull().references(() => adventurers.id), selectedAt: text().notNull(),
}, t => [primaryKey({columns:[t.questId,t.adventurerId]}),index("selections_adventurer").on(t.adventurerId)]);
export const mutationGuard = sqliteTable("mutationGuard", {
  id: text().primaryKey(), valid: integer().notNull(),
}, t => [check("mutation_guard_valid", sql`${t.valid} = 1`)]);

export const publicationDrafts = sqliteTable("publicationDrafts", {
  id: text().primaryKey().references(() => requests.id, {onDelete:"cascade"}), fields: text().notNull(), checklist: text().notNull().default("[]"), attachmentIds: text().notNull().default("[]"), additionalAttachments: text().notNull().default("[]"), ...timestamps(),
});
