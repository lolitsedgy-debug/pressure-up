CREATE TABLE `trip_edits` (
	`id` text PRIMARY KEY NOT NULL,
	`trip_id` text NOT NULL,
	`before_json` text NOT NULL,
	`after_json` text NOT NULL,
	`reason` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`trip_id`) REFERENCES `trip_records`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `jobs` ADD `eta` text;--> statement-breakpoint
ALTER TABLE `jobs` ADD `eta_updated_at` text;--> statement-breakpoint
ALTER TABLE `jobs` ADD `duration_minutes` integer DEFAULT 120 NOT NULL;--> statement-breakpoint
ALTER TABLE `jobs` ADD `updates_opt_in` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `notifications` ADD `provider_id` text;--> statement-breakpoint
ALTER TABLE `notifications` ADD `destination` text;--> statement-breakpoint
ALTER TABLE `notifications` ADD `sent_at` text;
--> statement-breakpoint
UPDATE jobs SET duration_minutes=CASE WHEN price>500 THEN 360 WHEN price>350 THEN 300 WHEN price>180 THEN 180 ELSE 120 END;
