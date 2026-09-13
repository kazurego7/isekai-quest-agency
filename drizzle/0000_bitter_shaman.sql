CREATE TABLE `adventurers` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`rank` text NOT NULL,
	`role` text NOT NULL,
	`note` text,
	`source` text NOT NULL,
	`appliedAt` text,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `adventurers_userId_unique` ON `adventurers` (`userId`);--> statement-breakpoint
CREATE UNIQUE INDEX `adventurers_code_unique` ON `adventurers` (`code`);--> statement-breakpoint
CREATE TABLE `applications` (
	`questId` text NOT NULL,
	`adventurerId` text NOT NULL,
	`appliedAt` text NOT NULL,
	PRIMARY KEY(`questId`, `adventurerId`),
	FOREIGN KEY (`questId`) REFERENCES `quests`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`adventurerId`) REFERENCES `adventurers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `mutationGuard` (
	`id` text PRIMARY KEY NOT NULL,
	`valid` integer NOT NULL,
	CONSTRAINT "mutation_guard_valid" CHECK("mutationGuard"."valid" = 1)
);
--> statement-breakpoint
CREATE TABLE `owner` (
	`singleton` integer PRIMARY KEY NOT NULL,
	`authId` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `quests` (
	`id` text PRIMARY KEY NOT NULL,
	`requestId` text NOT NULL,
	`title` text NOT NULL,
	`status` text NOT NULL,
	`receptionistId` text,
	`adventurerId` text,
	`reward` text,
	`rank` text,
	`detail` text,
	`deliverables` text,
	`supplies` text,
	`mapNotes` text,
	`risk` text,
	`channel` text,
	`slots` text,
	`summary` text,
	`reportComment` text,
	`reviewNote` text,
	`checklist` text DEFAULT '[]' NOT NULL,
	`photos` text DEFAULT '[]' NOT NULL,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`requestId`) REFERENCES `requests`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`receptionistId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`adventurerId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `quests_requestId_unique` ON `quests` (`requestId`);--> statement-breakpoint
CREATE INDEX `quests_status_created` ON `quests` (`status`,`createdAt`);--> statement-breakpoint
CREATE TABLE `requests` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`status` text NOT NULL,
	`requesterId` text NOT NULL,
	`receptionistId` text,
	`purpose` text,
	`location` text,
	`deadline` text,
	`risk` text,
	`reward` text,
	`requesterNote` text,
	`notes` text,
	`summary` text,
	`requesterAgreed` integer DEFAULT false NOT NULL,
	`receptionistAgreed` integer DEFAULT false NOT NULL,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`requesterId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`receptionistId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `requests_requester_created` ON `requests` (`requesterId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `requests_status` ON `requests` (`status`);--> statement-breakpoint
CREATE TABLE `selections` (
	`questId` text NOT NULL,
	`adventurerId` text NOT NULL,
	`selectedAt` text NOT NULL,
	PRIMARY KEY(`questId`, `adventurerId`),
	FOREIGN KEY (`questId`) REFERENCES `quests`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`adventurerId`) REFERENCES `adventurers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `selections_adventurer` ON `selections` (`adventurerId`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`authId` text NOT NULL,
	`userId` text NOT NULL,
	`displayName` text NOT NULL,
	`userType` text NOT NULL,
	`role` text NOT NULL,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_authId_unique` ON `users` (`authId`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_userId_unique` ON `users` (`userId`);