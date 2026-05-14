import type { SpotifySearchFilters } from '@/lib/spotify/types';

/**
 * Escape user-supplied values for Spotify `q` field strings wrapped in double quotes.
 */
export function escapeSpotifyFieldValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/**
 * Build a Spotify search `q` string from structured filters.
 * Omits empty / whitespace-only values.
 *
 * @example
 * buildSpotifySearchQuery({
 *   general: "love",
 *   artist: "Taylor Swift",
 *   track: "Lover",
 *   year: "2019",
 * })
 * // → `love artist:"Taylor Swift" track:"Lover" year:2019`
 */
export function buildSpotifySearchQuery(filters: SpotifySearchFilters): string {
  const parts: string[] = [];

  const general = filters.general?.trim();
  if (general) {
    parts.push(general);
  }

  const addQuotedField = (key: string, raw?: string) => {
    const t = raw?.trim();
    if (!t) return;
    parts.push(`${key}:"${escapeSpotifyFieldValue(t)}"`);
  };

  addQuotedField('track', filters.track);
  addQuotedField('artist', filters.artist);
  addQuotedField('album', filters.album);

  const year = filters.year?.trim();
  if (year) {
    parts.push(`year:${year}`);
  }

  addQuotedField('genre', filters.genre);

  const isrc = filters.isrc?.trim();
  if (isrc) {
    parts.push(`isrc:${escapeSpotifyFieldValue(isrc)}`);
  }

  return parts.join(' ').trim();
}
