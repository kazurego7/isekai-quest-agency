ALTER TABLE `quests` ADD `publishVersion` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `quests` ADD `categoryId` text REFERENCES requestTypes(id);--> statement-breakpoint
ALTER TABLE `quests` ADD `regionId` text REFERENCES requestRegions(id);--> statement-breakpoint
ALTER TABLE `quests` ADD `location` text;--> statement-breakpoint
ALTER TABLE `quests` ADD `deadlineMode` text DEFAULT 'unknown' NOT NULL;--> statement-breakpoint
ALTER TABLE `quests` ADD `deadlineDate` text;--> statement-breakpoint
ALTER TABLE `quests` ADD `publicNote` text;--> statement-breakpoint
ALTER TABLE `quests` ADD `publicAttachments` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `quests` ADD `recruitCount` integer;--> statement-breakpoint
ALTER TABLE `quests` ADD `minimumRank` text;--> statement-breakpoint
ALTER TABLE `quests` ADD `participationNote` text;--> statement-breakpoint
ALTER TABLE `quests` ADD `grossReward` integer;--> statement-breakpoint
ALTER TABLE `quests` ADD `commissionRate` integer;--> statement-breakpoint
ALTER TABLE `quests` ADD `commissionAmount` integer;--> statement-breakpoint
ALTER TABLE `quests` ADD `netReward` integer;--> statement-breakpoint
ALTER TABLE `quests` ADD `distributionMode` text;--> statement-breakpoint
ALTER TABLE `quests` ADD `distributionNote` text;--> statement-breakpoint
ALTER TABLE `quests` ADD `meetingAt` text;--> statement-breakpoint
ALTER TABLE `quests` ADD `meetingPlace` text;