CREATE TABLE `availability_blocks` (
	`id` text PRIMARY KEY NOT NULL,
	`block_date` text NOT NULL,
	`window` text DEFAULT 'all' NOT NULL,
	`start_time` text,
	`end_time` text,
	`reason` text DEFAULT 'Unavailable' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `availability_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`weekday` integer NOT NULL,
	`window` text DEFAULT 'all' NOT NULL,
	`label` text DEFAULT 'Recurring unavailable' NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text,
	`customer_id` text,
	`type` text NOT NULL,
	`channel` text DEFAULT 'manual' NOT NULL,
	`status` text DEFAULT 'queued' NOT NULL,
	`message` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE `jobs` ADD `manage_token` text;--> statement-breakpoint
ALTER TABLE `jobs` ADD `cancelled_at` text;--> statement-breakpoint
ALTER TABLE `jobs` ADD `cancellation_reason` text;--> statement-breakpoint
ALTER TABLE `jobs` ADD `cancelled_by` text;--> statement-breakpoint
ALTER TABLE `jobs` ADD `notification_status` text;