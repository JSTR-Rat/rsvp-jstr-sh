/**
 * Strict types for Spotify Web API search (tracks) and the song-request feature.
 * @see https://developer.spotify.com/documentation/web-api/reference/search
 */

export type SpotifyExternalUrls = {
  spotify: string;
};

export type SpotifyImage = {
  url: string;
  height: number | null;
  width: number | null;
};

export type SpotifyArtist = {
  id: string;
  name: string;
};

export type SpotifyAlbum = {
  id: string;
  name: string;
  images: SpotifyImage[];
};

/** Track object as returned by `GET /v1/search?type=track`. */
export type SpotifyTrack = {
  id: string;
  name: string;
  explicit: boolean;
  duration_ms: number;
  external_urls: SpotifyExternalUrls;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
};

export type SpotifyTrackSearchPage = {
  href: string;
  items: SpotifyTrack[];
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
};

export type SpotifyTrackSearchResponse = {
  tracks: SpotifyTrackSearchPage;
};

/** User-facing record for a requested song (UI + persistence). */
export type RequestedSong = {
  spotifyTrackId: string;
  name: string;
  artists: string[];
  albumName: string;
  albumImageUrl: string | null;
  durationMs: number;
  explicit: boolean;
  spotifyUrl: string;
};

export type SpotifySearchQueryParams = {
  /** Raw Spotify search query (`q` query param). */
  q: string;
  limit: number;
  offset: number;
  /** ISO 3166-1 alpha-2 country code (Spotify `market` query param). */
  market?: string;
};

/**
 * Structured field filters for programmatic `q` strings (see `buildSpotifySearchQuery`).
 */
export type SpotifySearchFilters = {
  general?: string;
  track?: string;
  artist?: string;
  album?: string;
  year?: string;
  genre?: string;
  isrc?: string;
};

export type SpotifySongRequestPickerProps = {
  /** Invite this guest is acting as — all requests are stored under this id. */
  inviteId: string;
  /** Maximum number of songs that may be requested; omit for no cap. */
  maxRequests?: number;
  /** Spotify track search `limit`; API allows at most 10 per request. */
  pageSize?: number;
  /** ISO market code (2 letters) sent with search; not shown in the UI. */
  defaultMarket?: string;
  className?: string;
  /**
   * Swap server calls (e.g. tests). Must respect the same `inviteId` contract.
   */
  api?: SpotifySongRequestApi;
};

export type SpotifySongRequestApi = {
  searchSpotifyTracks: (
    params: SpotifySearchQueryParams,
  ) => Promise<SpotifyTrackSearchResponse>;
  getRequestedSongs: () => Promise<RequestedSong[]>;
  requestSong: (track: SpotifyTrack) => Promise<void>;
  unrequestSong: (spotifyTrackId: string) => Promise<void>;
};
