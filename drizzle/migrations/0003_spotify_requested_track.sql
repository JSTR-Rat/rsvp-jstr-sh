CREATE TABLE `spotify_requested_track` (
	`invite_id` text NOT NULL,
	`spotify_track_id` text NOT NULL,
	`name` text NOT NULL,
	`artists_json` text NOT NULL,
	`album_name` text NOT NULL,
	`album_image_url` text,
	`duration_ms` integer NOT NULL,
	`explicit` integer NOT NULL,
	`spotify_url` text NOT NULL,
	`requested_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	PRIMARY KEY(`invite_id`, `spotify_track_id`),
	FOREIGN KEY (`invite_id`) REFERENCES `invite`(`id`) ON UPDATE no action ON DELETE cascade
);
