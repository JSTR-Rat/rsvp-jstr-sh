/**
 * Spotify search (Client Credentials on the server) and per-invite song requests in D1.
 * Invitee-only in the sense that every call is scoped by `inviteId`; matching public invite routes,
 * callers must supply the invite UUID (same model as RSVP).
 */

import type {
  RequestedSong,
  SpotifySearchQueryParams,
  SpotifySongRequestApi,
  SpotifyTrack,
  SpotifyTrackSearchResponse,
} from '@/lib/spotify/types';
import { getDB } from '@/db';
import { invite, spotifyRequestedTrack } from '@/db/schema';
import { createServerFn } from '@tanstack/react-start';
import { and, desc, eq } from 'drizzle-orm';
import z from 'zod';
import { assertEventCutoffNotPassed } from '@/lib/wedding-event-details';
import {
  SPOTIFY_SEARCH_LIMIT_MAX,
  SPOTIFY_SEARCH_LIMIT_MIN,
  SPOTIFY_SEARCH_OFFSET_MAX,
  fetchSpotifyTrackSearch,
} from '@/utils/spotify.server';

const artistsJsonSchema = z.array(z.string());

function trackToStoredPayload(track: SpotifyTrack): Omit<
  typeof spotifyRequestedTrack.$inferInsert,
  'inviteId' | 'requestedAt'
> {
  return {
    spotifyTrackId: track.id,
    name: track.name,
    artistsJson: JSON.stringify(track.artists.map((a) => a.name)),
    albumName: track.album.name,
    albumImageUrl: track.album.images[0]?.url ?? null,
    durationMs: track.duration_ms,
    explicit: track.explicit,
    spotifyUrl: track.external_urls.spotify,
  };
}

function rowToRequestedSong(
  row: typeof spotifyRequestedTrack.$inferSelect,
): RequestedSong {
  let artists: string[] = [];
  try {
    const parsed = JSON.parse(row.artistsJson) as unknown;
    const check = artistsJsonSchema.safeParse(parsed);
    if (check.success) artists = check.data;
  } catch {
    /* keep [] */
  }
  return {
    spotifyTrackId: row.spotifyTrackId,
    name: row.name,
    artists,
    albumName: row.albumName,
    albumImageUrl: row.albumImageUrl,
    durationMs: row.durationMs,
    explicit: row.explicit,
    spotifyUrl: row.spotifyUrl,
  };
}

async function ensureInviteExists(inviteId: string): Promise<void> {
  const db = getDB();
  const found = await db
    .select({ id: invite.id })
    .from(invite)
    .where(eq(invite.id, inviteId))
    .limit(1);
  if (found.length === 0) {
    throw new Error('Invitation not found.');
  }
}

const inviteIdSchema = z.object({
  inviteId: z.uuid(),
});

const spotifyTrackInputSchema = z.object({
  id: z.string(),
  name: z.string(),
  explicit: z.boolean(),
  duration_ms: z.number(),
  external_urls: z.object({ spotify: z.string() }),
  artists: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    }),
  ),
  album: z.object({
    id: z.string(),
    name: z.string(),
    images: z.array(
      z.object({
        url: z.string(),
        height: z.number().nullable(),
        width: z.number().nullable(),
      }),
    ),
  }),
});

/** Spotify Search: limit 1–10 and offset ≤ 1000 per API; coerce JSON quirks. */
const searchInputSchema = z.object({
  q: z.string().min(1),
  limit: z
    .unknown()
    .transform((v) => Math.trunc(Number(v)))
    .pipe(
      z
        .number()
        .int()
        .min(SPOTIFY_SEARCH_LIMIT_MIN)
        .max(SPOTIFY_SEARCH_LIMIT_MAX),
    ),
  offset: z
    .unknown()
    .transform((v) =>
      Math.min(SPOTIFY_SEARCH_OFFSET_MAX, Math.trunc(Number(v))),
    )
    .pipe(z.number().int().min(0)),
  market: z.string().length(2).optional(),
});

export const getRequestedSongsFN = createServerFn({ method: 'GET' })
  .inputValidator(inviteIdSchema)
  .handler(async ({ data }): Promise<RequestedSong[]> => {
    await ensureInviteExists(data.inviteId);
    const db = getDB();
    const rows = await db
      .select()
      .from(spotifyRequestedTrack)
      .where(eq(spotifyRequestedTrack.inviteId, data.inviteId))
      .orderBy(desc(spotifyRequestedTrack.requestedAt));

    return rows.map(rowToRequestedSong);
  });

export const requestSongFN = createServerFn({ method: 'POST' })
  .inputValidator(
    inviteIdSchema.extend({ track: spotifyTrackInputSchema }),
  )
  .handler(async ({ data }): Promise<void> => {
    assertEventCutoffNotPassed();
    await ensureInviteExists(data.inviteId);
    const db = getDB();
    const payload = trackToStoredPayload(data.track);
    await db
      .insert(spotifyRequestedTrack)
      .values({
        inviteId: data.inviteId,
        ...payload,
      })
      .onConflictDoNothing({
        target: [
          spotifyRequestedTrack.inviteId,
          spotifyRequestedTrack.spotifyTrackId,
        ],
      });
  });

export const unrequestSongFN = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      inviteId: z.uuid(),
      spotifyTrackId: z.string().min(1),
    }),
  )
  .handler(async ({ data }): Promise<void> => {
    assertEventCutoffNotPassed();
    await ensureInviteExists(data.inviteId);
    const db = getDB();
    await db
      .delete(spotifyRequestedTrack)
      .where(
        and(
          eq(spotifyRequestedTrack.inviteId, data.inviteId),
          eq(spotifyRequestedTrack.spotifyTrackId, data.spotifyTrackId),
        ),
      );
  });

export const searchSpotifyTracksFN = createServerFn({ method: 'POST' })
  .inputValidator(searchInputSchema)
  .handler(async ({ data }): Promise<SpotifyTrackSearchResponse> => {
    assertEventCutoffNotPassed();
    return fetchSpotifyTrackSearch({
      q: data.q,
      limit: data.limit,
      offset: data.offset,
      market: data.market,
    });
  });

export function defaultSpotifySongRequestApi(
  inviteId: string,
): SpotifySongRequestApi {
  return {
    searchSpotifyTracks: (params: SpotifySearchQueryParams) =>
      searchSpotifyTracksFN({
        data: {
          q: params.q,
          limit: params.limit,
          offset: params.offset,
          market: params.market,
        },
      }),
    getRequestedSongs: () =>
      getRequestedSongsFN({ data: { inviteId } }),
    requestSong: (track: SpotifyTrack) =>
      requestSongFN({ data: { inviteId, track } }),
    unrequestSong: (spotifyTrackId: string) =>
      unrequestSongFN({ data: { inviteId, spotifyTrackId } }),
  };
}
