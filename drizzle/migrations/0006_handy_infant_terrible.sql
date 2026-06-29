CREATE TABLE `received_email` (
	`id` text PRIMARY KEY NOT NULL,
	`resend_email_id` text NOT NULL,
	`svix_id` text NOT NULL,
	`message_id` text,
	`from_address` text NOT NULL,
	`subject` text NOT NULL,
	`to_addresses_json` text NOT NULL,
	`cc_addresses_json` text,
	`bcc_addresses_json` text,
	`html_body` text,
	`text_body` text,
	`headers_json` text,
	`attachments_json` text,
	`received_at` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `received_email_resend_email_id_idx` ON `received_email` (`resend_email_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `received_email_svix_id_idx` ON `received_email` (`svix_id`);