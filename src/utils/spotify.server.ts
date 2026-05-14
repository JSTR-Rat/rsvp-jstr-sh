/**
 * Server-only Spotify Client Credentials token + search (`cloudflare:workers` env).
 * Do not import from client bundles.
 */

import type { SpotifyTrack, SpotifyTrackSearchResponse } from '@/lib/spotify/types';
import { env } from 'cloudflare:workers';
import z from 'zod';

const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';

const tokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
});

type CachedToken = { accessToken: string; expiresAtMs: number };

let cachedToken: CachedToken | null = null;
const TOKEN_SKEW_MS = 60_000;

export async function getSpotifyAccessToken(): Promise<string> {
  const now = Date.now();
  if (
    cachedToken !== null &&
    cachedToken.expiresAtMs > now + TOKEN_SKEW_MS
  ) {
    return cachedToken.accessToken;
  }

  const clientId = env.SPOTIFY_CLIENT_ID;
  const clientSecret = env.SPOTIFY_CLIENT_SECRET;
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    cachedToken = null;
    throw new Error(
      `Spotify token request failed (${res.status}). ${text.slice(0, 200)}`,
    );
  }

  const json: unknown = await res.json();
  const parsed = tokenResponseSchema.safeParse(json);
  if (!parsed.success) {
    cachedToken = null;
    throw new Error('Spotify token response was not valid.');
  }

  const { access_token, expires_in } = parsed.data;
  cachedToken = {
    accessToken: access_token,
    expiresAtMs: now + expires_in * 1000,
  };

  return access_token;
}

const spotifyApiTrackSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    explicit: z.boolean(),
    duration_ms: z.number(),
    external_urls: z.object({ spotify: z.string() }).passthrough(),
    artists: z.array(
      z.object({ id: z.string(), name: z.string() }).passthrough(),
    ),
    album: z
      .object({
        id: z.string(),
        name: z.string(),
        images: z.array(
          z.object({
            url: z.string(),
            height: z.number().nullable(),
            width: z.number().nullable(),
          }),
        ),
      })
      .passthrough(),
  })
  .passthrough();

const spotifySearchResponseSchema = z.object({
  tracks: z.object({
    href: z.string(),
    items: z.array(spotifyApiTrackSchema.nullable()),
    limit: z.number(),
    next: z.string().nullable(),
    offset: z.number(),
    previous: z.string().nullable(),
    total: z.number(),
  }),
});

export function normalizeSpotifyTrack(
  parsed: z.infer<typeof spotifyApiTrackSchema>,
): SpotifyTrack {
  return {
    id: parsed.id,
    name: parsed.name,
    explicit: parsed.explicit,
    duration_ms: parsed.duration_ms,
    external_urls: { spotify: parsed.external_urls.spotify },
    artists: parsed.artists.map((a) => ({ id: a.id, name: a.name })),
    album: {
      id: parsed.album.id,
      name: parsed.album.name,
      images: parsed.album.images.map((img) => ({
        url: img.url,
        height: img.height,
        width: img.width,
      })),
    },
  };
}

/** Spotify Search API: limit range is 1–10 per latest docs; offset max 1000. */
export const SPOTIFY_SEARCH_LIMIT_MIN = 1;
export const SPOTIFY_SEARCH_LIMIT_MAX = 10;
export const SPOTIFY_SEARCH_OFFSET_MAX = 1000;

function spotifyPagingInts(limit: unknown, offset: unknown): {
  limit: number;
  offset: number;
} {
  const limitInt = Math.trunc(Number(limit));
  const offsetInt = Math.min(
    SPOTIFY_SEARCH_OFFSET_MAX,
    Math.trunc(Number(offset)),
  );
  if (
    !Number.isFinite(limitInt) ||
    limitInt < SPOTIFY_SEARCH_LIMIT_MIN ||
    limitInt > SPOTIFY_SEARCH_LIMIT_MAX
  ) {
    throw new Error(
      `Search limit must be an integer from ${SPOTIFY_SEARCH_LIMIT_MIN} to ${SPOTIFY_SEARCH_LIMIT_MAX}.`,
    );
  }
  if (!Number.isFinite(offsetInt) || offsetInt < 0) {
    throw new Error('Search offset must be a non-negative integer.');
  }
  return { limit: limitInt, offset: offsetInt };
}

/** GET `https://api.spotify.com/v1/search` with `type=track` (limit 1–10 per Spotify Search API). */
export async function fetchSpotifyTrackSearch(params: {
  q: string;
  limit: number;
  offset: number;
  market?: string;
}): Promise<SpotifyTrackSearchResponse> {
  const { limit, offset } = spotifyPagingInts(params.limit, params.offset);
  const accessToken = await getSpotifyAccessToken();
  const url = new URL('https://api.spotify.com/v1/search');
  url.searchParams.set('q', params.q);
  url.searchParams.set('type', 'track');
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('offset', String(offset));
  if (params.market) {
    url.searchParams.set('market', params.market);
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const raw: unknown = await res.json();

  if (!res.ok) {
    let errBody = res.statusText;
    const errObj =
      typeof raw === 'object' &&
      raw !== null &&
      'error' in raw &&
      typeof (raw as { error?: { message?: string } }).error?.message ===
        'string'
      ? (raw as { error: { message: string } }).error.message
      : null;
    errBody =
      errObj ??
      (typeof raw === 'object' && raw !== null
        ? JSON.stringify(raw).slice(0, 300)
        : String(raw));
    if (res.status === 401) {
      cachedToken = null;
    }
    throw new Error(`Spotify search failed (${res.status}): ${errBody}`);
  }

  const parsed = spotifySearchResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error('Unexpected Spotify search response shape.');
  }

  const tracks = parsed.data.tracks;
  const items: SpotifyTrack[] = [];
  for (const item of tracks.items) {
    if (item === null) continue;
    const t = spotifyApiTrackSchema.safeParse(item);
    if (!t.success) continue;
    items.push(normalizeSpotifyTrack(t.data));
  }

  return {
    tracks: {
      href: tracks.href,
      items,
      limit: tracks.limit,
      next: tracks.next,
      offset: tracks.offset,
      previous: tracks.previous,
      total: tracks.total,
    },
  };
}
