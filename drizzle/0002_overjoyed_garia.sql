CREATE TABLE `mileage` (
	`id` text PRIMARY KEY NOT NULL,
	`trip_date` text NOT NULL,
	`vehicle` text NOT NULL,
	`origin` text NOT NULL,
	`destination` text NOT NULL,
	`purpose` text NOT NULL,
	`start_odometer` real NOT NULL,
	`end_odometer` real NOT NULL,
	`job_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_mileage_trip_date` ON `mileage` (`trip_date`);--> statement-breakpoint
ALTER TABLE `availability_rules` ADD `start_time` text;--> statement-breakpoint
ALTER TABLE `availability_rules` ADD `end_time` text;--> statement-breakpoint
ALTER TABLE `jobs` ADD `paid_at` text;--> statement-breakpoint
ALTER TABLE `jobs` ADD `paid_amount` real;