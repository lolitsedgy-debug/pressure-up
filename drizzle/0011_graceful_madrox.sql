CREATE TABLE `invoice_records` (
	`job_id` text PRIMARY KEY NOT NULL,
	`state` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`token` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `invoice_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text NOT NULL,
	`revision` integer NOT NULL,
	`snapshot_json` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invoice_sent_revision` ON `invoice_versions` (`job_id`,`revision`);--> statement-breakpoint
CREATE TABLE `marketing_approvals` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`media_id` text NOT NULL,
	`approved_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `marketing_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`content_json` text NOT NULL,
	`state` text DEFAULT 'Draft' NOT NULL,
	`token` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
