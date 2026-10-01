CREATE TABLE `cost_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`base_address` text DEFAULT '' NOT NULL,
	`default_vehicle` text
);
--> statement-breakpoint
CREATE TABLE `supplies` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`unit` text NOT NULL,
	`low_at` real DEFAULT 1 NOT NULL,
	`archived` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `supply_movements` (
	`id` text PRIMARY KEY NOT NULL,
	`supply_id` text NOT NULL,
	`quantity` real NOT NULL,
	`unit_cost` real DEFAULT 0 NOT NULL,
	`kind` text NOT NULL,
	`job_id` text,
	`expense_id` text,
	`movement_date` text NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`supply_id`) REFERENCES `supplies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`expense_id`) REFERENCES `expenses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_supply_purchase_once` ON `supply_movements` (`expense_id`);--> statement-breakpoint
CREATE TABLE `trip_jobs` (
	`job_id` text PRIMARY KEY NOT NULL,
	`trip_id` text NOT NULL,
	FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`trip_id`) REFERENCES `trip_records`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `trip_records` (
	`id` text PRIMARY KEY NOT NULL,
	`trip_date` text NOT NULL,
	`vehicle_id` text,
	`route_json` text DEFAULT '[]' NOT NULL,
	`purpose` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`estimated_miles` real,
	`actual_miles` real,
	`eligible_miles` real,
	`method` text DEFAULT 'review' NOT NULL,
	`rate` real,
	`confirmed_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` text PRIMARY KEY NOT NULL,
	`nickname` text NOT NULL,
	`details` text DEFAULT '' NOT NULL,
	`plate` text DEFAULT '' NOT NULL,
	`vin` text DEFAULT '' NOT NULL,
	`starting_odometer` real,
	`start_date` text,
	`archived` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE `jobs` ADD `customer_note` text DEFAULT '' NOT NULL;