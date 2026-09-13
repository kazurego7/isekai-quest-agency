CREATE TABLE `publicationDrafts` (
	`id` text PRIMARY KEY NOT NULL,
	`fields` text NOT NULL,
	`checklist` text DEFAULT '[]' NOT NULL,
	`attachmentIds` text DEFAULT '[]' NOT NULL,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`id`) REFERENCES `requests`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `quests` ADD `locationMode` text DEFAULT 'specified' NOT NULL;