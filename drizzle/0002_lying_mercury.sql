ALTER TABLE `customizations` ADD `includePhoto` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `customizations` ADD `photoUrl` text;--> statement-breakpoint
ALTER TABLE `customizations` ADD `photoKey` text;