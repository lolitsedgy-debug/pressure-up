CREATE TABLE `business_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text DEFAULT 'Pressure Up' NOT NULL,
	`owner_name` text DEFAULT 'Edgar Torres' NOT NULL,
	`phone` text NOT NULL,
	`email` text NOT NULL,
	`website` text NOT NULL,
	`owner_photo_key` text
);
