CREATE TABLE `owner_preferences` (
	`id` text PRIMARY KEY NOT NULL,
	`cards_json` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `website_content` (
	`id` text PRIMARY KEY NOT NULL,
	`draft_json` text NOT NULL,
	`published_json` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`publish_id` text,
	`base_contact_json` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `website_media` (
	`id` text PRIMARY KEY NOT NULL,
	`object_key` text NOT NULL,
	`thumbnail_key` text,
	`name` text NOT NULL,
	`content_type` text NOT NULL,
	`category` text NOT NULL,
	`archived` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `website_public_media` (
	`media_id` text PRIMARY KEY NOT NULL,
	FOREIGN KEY (`media_id`) REFERENCES `website_media`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `website_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`content_json` text NOT NULL,
	`description` text NOT NULL,
	`created_at` text NOT NULL
);
