CREATE TABLE `merchants` (
	`id` text PRIMARY KEY NOT NULL,
	`company_name` text NOT NULL,
	`contact_name` text NOT NULL,
	`email` text NOT NULL,
	`vat_id` text NOT NULL,
	`phone` text,
	`street` text,
	`postal_code` text,
	`city` text,
	`country` text,
	`website` text,
	`notes` text,
	`status` text DEFAULT 'neu' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `merchants_email_unique` ON `merchants` (`email`);