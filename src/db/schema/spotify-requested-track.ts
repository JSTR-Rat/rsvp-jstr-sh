import { sql } from 'drizzle-orm';
import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { invite } from './invite';

export const spotifyRequestedTrack = sqliteTable(
  'spotify_requested_track',
  {
    inviteId: text('invite_id')
      .notNull()
      .references(() => invite.id, { onDelete: 'cascade' }),
    spotifyTrackId: text('spotify_track_id').notNull(),
    name: text('name').notNull(),
    artistsJson: text('artists_json').notNull(),
    albumName: text('album_name').notNull(),
    albumImageUrl: text('album_image_url'),
    durationMs: integer('duration_ms').notNull(),
    explicit: integer('explicit', { mode: 'boolean' }).notNull(),
    spotifyUrl: text('spotify_url').notNull(),
    requestedAt: text('requested_at')
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [
    primaryKey({ columns: [table.inviteId, table.spotifyTrackId] }),
  ],
);
