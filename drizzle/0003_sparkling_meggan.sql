CREATE TABLE `requestRegions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `requestTypes` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `requests` ADD `formatVersion` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `requests` ADD `categoryId` text REFERENCES requestTypes(id);--> statement-breakpoint
ALTER TABLE `requests` ADD `regionId` text REFERENCES requestRegions(id);--> statement-breakpoint
ALTER TABLE `requests` ADD `deadlineMode` text DEFAULT 'unknown' NOT NULL;--> statement-breakpoint
ALTER TABLE `requests` ADD `deadlineDate` text;--> statement-breakpoint
ALTER TABLE `requests` ADD `rewardMode` text DEFAULT 'consult' NOT NULL;--> statement-breakpoint
ALTER TABLE `requests` ADD `rewardAmount` integer;--> statement-breakpoint
ALTER TABLE `requests` ADD `attachments` text DEFAULT '[]' NOT NULL;
--> statement-breakpoint
INSERT INTO requestTypes(id,name) VALUES ('hunt','討伐'),('gather','採集'),('explore','探索・調査'),('escort','護衛'),('rescue','救助'),('other','その他');
--> statement-breakpoint
INSERT INTO requestRegions(id,name) VALUES ('capital','王都'),('north','王都北部'),('south','王都南部'),('east','王都東部'),('west','王都西部'),('frontier','辺境'),('other','その他の地域');
