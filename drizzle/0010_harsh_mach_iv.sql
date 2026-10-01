CREATE TABLE `ad_spend` (
	`id` text PRIMARY KEY NOT NULL,
	`source` text NOT NULL,
	`campaign` text DEFAULT '' NOT NULL,
	`period_start` text NOT NULL,
	`period_end` text NOT NULL,
	`amount` real NOT NULL,
	`note` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `estimate_funnels` (
	`id` text PRIMARY KEY NOT NULL,
	`source` text DEFAULT 'Unknown' NOT NULL,
	`campaign` text DEFAULT '' NOT NULL,
	`started_at` text NOT NULL,
	`submitted_at` text,
	`generated_at` text,
	`sent_at` text,
	`booked_at` text,
	`completed_at` text,
	`paid_at` text,
	`job_id` text
);
--> statement-breakpoint
CREATE INDEX `funnel_started` ON `estimate_funnels` (`started_at`);--> statement-breakpoint
ALTER TABLE `expenses` ADD `receipt_sha256` text;--> statement-breakpoint
ALTER TABLE `expenses` ADD `receipt_dhash` text;--> statement-breakpoint
ALTER TABLE `expenses` ADD `receipt_details` text DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE `expenses` ADD `submission_key` text;--> statement-breakpoint
ALTER TABLE `jobs` ADD `funnel_id` text;--> statement-breakpoint
ALTER TABLE `jobs` ADD `lead_source` text DEFAULT 'Unknown' NOT NULL;--> statement-breakpoint
ALTER TABLE `jobs` ADD `campaign` text DEFAULT '' NOT NULL;