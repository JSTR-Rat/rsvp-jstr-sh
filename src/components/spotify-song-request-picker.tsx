import {
  sfControlText,
  sfFontSans,
  sfFontSerif,
  sfLabel,
} from '@/forms/standard-form/shared-classes';
import { isRsvpCutoffPassed } from '@/lib/wedding-event-details';
import type {
  RequestedSong,
  SpotifySongRequestPickerProps,
  SpotifyTrack,
} from '@/lib/spotify/types';
import { defaultSpotifySongRequestApi } from '@/utils/spotify-song-request.functions';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { ChevronDown, ExternalLink, Minus, Plus } from 'lucide-react';
import { useEffect, useId, useMemo, useState } from 'react';

/** Spotify Search API maximum `limit` per request (see Spotify Web API reference). */
const SPOTIFY_SEARCH_PAGE_CAP = 10;

/** Delay before Spotify search runs after the user stops typing. */
const SEARCH_DEBOUNCE_MS = 380;

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(value);
    }, delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

const rowIconButtonBase = clsx(
  'inline-flex size-9 shrink-0 items-center justify-center rounded-md border',
  'transition-[border-color,background-color,transform]',
  'focus-visible:ring-[3px] focus-visible:outline-none',
  'active:scale-95',
  'disabled:pointer-events-none disabled:opacity-35',
);

const rowLinkButtonClass = clsx(
  rowIconButtonBase,
  'border-white/18 bg-white/6 text-white/88',
  'hover:border-white/28 hover:bg-white/10',
  'focus-visible:border-white/40 focus-visible:ring-white/22',
);

const rowAddButtonClass = clsx(
  rowIconButtonBase,
  'border-emerald-400/45 bg-emerald-950/45 text-emerald-50',
  'hover:border-emerald-300/60 hover:bg-emerald-900/55',
  'focus-visible:ring-emerald-400/35',
);

const rowRemoveButtonClass = clsx(
  rowIconButtonBase,
  'border-rose-400/45 bg-rose-950/45 text-rose-50',
  'hover:border-rose-300/60 hover:bg-rose-900/55',
  'focus-visible:ring-rose-400/35',
);

function TrackResultSkeletonRow() {
  return (
    <div
      className="flex animate-pulse items-center gap-3.5 px-3 py-3.5 sm:gap-4 sm:px-4 sm:py-4"
      aria-hidden
    >
      <div className="size-12 shrink-0 rounded-md bg-white/10 sm:size-14" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-[min(100%,13rem)] max-w-[75%] rounded bg-white/10" />
        <div className="h-3.5 w-[min(100%,20rem)] max-w-[92%] rounded bg-white/8" />
      </div>
      <div className="flex shrink-0 gap-1">
        <div className="size-9 rounded-md bg-white/10" />
        <div className="size-9 rounded-md bg-white/10" />
      </div>
    </div>
  );
}

function TrackResultSkeletonList({
  count,
  statusId,
}: {
  count: number;
  statusId: string;
}) {
  const n = Math.max(1, Math.min(count, SPOTIFY_SEARCH_PAGE_CAP));
  return (
    <div
      className="overflow-hidden rounded-lg border border-white/12 bg-black/25"
      aria-labelledby={statusId}
      role="status"
    >
      <p id={statusId} className="sr-only">
        Loading search results…
      </p>
      <ul className="divide-y divide-white/8">
        {Array.from({ length: n }, (_, i) => (
          <li key={i}>
            <TrackResultSkeletonRow />
          </li>
        ))}
      </ul>
    </div>
  );
}

function RequestedSongSkeletonRow() {
  return (
    <div
      className="flex animate-pulse items-center gap-3.5 py-3.5 sm:gap-4 sm:py-4"
      aria-hidden
    >
      <div className="size-12 shrink-0 rounded-md bg-white/10 sm:size-14" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-[min(100%,14rem)] max-w-[72%] rounded bg-white/10" />
        <div className="h-3.5 w-[min(100%,22rem)] max-w-[94%] rounded bg-white/8" />
      </div>
      <div className="flex shrink-0 gap-1">
        <div className="size-9 rounded-md bg-white/10" />
        <div className="size-9 rounded-md bg-white/10" />
      </div>
    </div>
  );
}

function RequestedSongSkeletonList({
  rows,
  labelId,
}: {
  rows: number;
  labelId: string;
}) {
  return (
    <div
      className="mt-2 divide-y divide-white/8 overflow-hidden rounded-lg border border-white/12 bg-black/20"
      role="status"
      aria-labelledby={labelId}
    >
      <p id={labelId} className="sr-only">
        Loading requested songs…
      </p>
      {Array.from({ length: Math.max(2, rows) }, (_, i) => (
        <div key={i} className="px-1 sm:px-0">
          <RequestedSongSkeletonRow />
        </div>
      ))}
    </div>
  );
}

function formatDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

function trackToRequestedSong(track: SpotifyTrack): RequestedSong {
  const albumImageUrl = track.album.images.find((i) => i.url)?.url ?? null;
  return {
    spotifyTrackId: track.id,
    name: track.name,
    artists: track.artists.map((a) => a.name),
    albumName: track.album.name,
    albumImageUrl,
    durationMs: track.duration_ms,
    explicit: track.explicit,
    spotifyUrl: track.external_urls.spotify,
  };
}

type ActiveSearch = {
  q: string;
  limit: number;
  market?: string;
};

export function SpotifySongRequestPicker({
  inviteId,
  maxRequests,
  pageSize = SPOTIFY_SEARCH_PAGE_CAP,
  defaultMarket = 'US',
  className,
  api,
}: SpotifySongRequestPickerProps) {
  const queryClient = useQueryClient();
  const baseId = useId();

  const effectivePageSize = useMemo(() => {
    const n = Math.trunc(Number(pageSize));
    if (!Number.isFinite(n) || n < 1) return SPOTIFY_SEARCH_PAGE_CAP;
    return Math.min(SPOTIFY_SEARCH_PAGE_CAP, n);
  }, [pageSize]);

  const apiImpl = useMemo(
    () => api ?? defaultSpotifySongRequestApi(inviteId),
    [api, inviteId],
  );

  const playlistClosed = isRsvpCutoffPassed();

  const [query, setQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState<ActiveSearch | null>(null);
  const [requestedSectionOpen, setRequestedSectionOpen] = useState(true);

  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);

  const queryTrimmed = query.trim();
  const debouncedTrimmed = debouncedQuery.trim();

  const requestedQueryKey = ['spotify-requested-songs', inviteId] as const;

  const requestedQuery = useQuery({
    queryKey: requestedQueryKey,
    queryFn: () => apiImpl.getRequestedSongs(),
  });

  const searchQuery = useQuery({
    queryKey: [
      'spotify-track-search',
      activeSearch?.q,
      activeSearch?.limit,
      activeSearch?.market,
    ],
    queryFn: () => {
      if (!activeSearch) {
        throw new Error('Search is not active');
      }
      return apiImpl.searchSpotifyTracks({
        q: activeSearch.q,
        limit: activeSearch.limit,
        offset: 0,
        market: activeSearch.market,
      });
    },
    enabled:
      !playlistClosed &&
      !!activeSearch &&
      activeSearch.q.trim().length > 0 &&
      activeSearch.limit > 0,
  });

  useEffect(() => {
    if (!queryTrimmed || playlistClosed) {
      setActiveSearch(null);
    }
  }, [queryTrimmed, playlistClosed]);

  useEffect(() => {
    if (playlistClosed) return;
    const q = debouncedTrimmed;
    if (!q) {
      return;
    }
    if (q !== queryTrimmed) {
      return;
    }
    const m = defaultMarket.trim().toUpperCase();
    setActiveSearch({
      q,
      limit: effectivePageSize,
      market: m.length === 2 ? m : undefined,
    });
  }, [debouncedTrimmed, queryTrimmed, defaultMarket, effectivePageSize, playlistClosed]);

  const isSearchStale =
    queryTrimmed.length > 0 && queryTrimmed !== debouncedTrimmed;

  const resultsLoading =
    !!queryTrimmed &&
    !searchQuery.isError &&
    (!activeSearch ||
      isSearchStale ||
      !!(activeSearch && (searchQuery.isFetching || searchQuery.isPending)));

  const skeletonTrackCount = activeSearch?.limit ?? effectivePageSize;
  const searchSkeletonStatusId = `${baseId}-spotify-results-skeleton`;
  const requestedSkeletonStatusId = `${baseId}-spotify-requested-skeleton`;

  const requested = requestedQuery.data ?? [];
  const requestedIds = useMemo(
    () => new Set(requested.map((r) => r.spotifyTrackId)),
    [requested],
  );

  const requestCount = requested.length;
  const atLimit = maxRequests !== undefined && requestCount >= maxRequests;

  const requestMutation = useMutation({
    mutationFn: (track: SpotifyTrack) => apiImpl.requestSong(track),
    onMutate: async (track) => {
      await queryClient.cancelQueries({ queryKey: requestedQueryKey });
      const previous = queryClient.getQueryData<RequestedSong[]>(
        requestedQueryKey,
      );
      queryClient.setQueryData<RequestedSong[]>(requestedQueryKey, (old = []) => {
        if (old.some((song) => song.spotifyTrackId === track.id)) return old;
        return [trackToRequestedSong(track), ...old];
      });
      return { previous };
    },
    onError: (_error, _track, context) => {
      if (context?.previous) {
        queryClient.setQueryData(requestedQueryKey, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: requestedQueryKey });
    },
  });

  const unrequestMutation = useMutation({
    mutationFn: (spotifyTrackId: string) =>
      apiImpl.unrequestSong(spotifyTrackId),
    onMutate: async (spotifyTrackId) => {
      await queryClient.cancelQueries({ queryKey: requestedQueryKey });
      const previous = queryClient.getQueryData<RequestedSong[]>(
        requestedQueryKey,
      );
      queryClient.setQueryData<RequestedSong[]>(requestedQueryKey, (old = []) =>
        old.filter((song) => song.spotifyTrackId !== spotifyTrackId),
      );
      return { previous };
    },
    onError: (_error, _spotifyTrackId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(requestedQueryKey, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: requestedQueryKey });
    },
  });

  const pendingRequestTrackId = requestMutation.isPending
    ? requestMutation.variables?.id
    : null;
  const pendingUnrequestTrackId = unrequestMutation.isPending
    ? unrequestMutation.variables
    : null;

  const tracksPage = searchQuery.data?.tracks;

  return (
    <section
      className={clsx('space-y-6', className)}
      style={{ fontFamily: sfFontSans }}
    >
      <header className="space-y-1">
        <h2
          className="text-[1.125rem] font-medium tracking-tight text-white sm:text-[1.25rem]"
          style={{ fontFamily: sfFontSerif }}
        >
          Wedding Playlist
        </h2>
        {playlistClosed ? null : (
          <p className="text-[0.8125rem] leading-relaxed text-white/60">
            {maxRequests !== undefined ? (
              <>
                Have a song you&apos;d love to hear? Search below and add it to
                the playlist — up to {maxRequests} song
                {maxRequests === 1 ? '' : 's'} per guest.
              </>
            ) : (
              <>
                Have a song you&apos;d love to hear? Search below and add it to
                the playlist.
              </>
            )}
          </p>
        )}
        <p className="text-[0.75rem] text-white/48">
          {maxRequests !== undefined ? (
            <>
              {requestCount}/{maxRequests} songs requested
            </>
          ) : (
            <>
              {requestCount} song{requestCount === 1 ? '' : 's'} requested
            </>
          )}
        </p>
      </header>

      {playlistClosed ? null : (
        <div className="rounded-lg border border-white/12 bg-black/35 p-4 backdrop-blur-sm sm:p-5">
          <div>
            <label htmlFor={`${baseId}-q`} className={sfLabel}>
              Search tracks
            </label>
            <input
              id={`${baseId}-q`}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Song, artist, or keywords"
              autoComplete="off"
              enterKeyHint="search"
              className={sfControlText(false)}
            />
          </div>
        </div>
      )}

      {!playlistClosed && searchQuery.isError ? (
        <div
          className="rounded-md border border-red-400/42 bg-red-950/42 p-4 text-[0.8125rem] text-red-100/95 backdrop-blur-sm"
          role="alert"
        >
          {searchQuery.error instanceof Error
            ? searchQuery.error.message
            : 'Something went wrong while searching. Please try again.'}
        </div>
      ) : null}

      {!playlistClosed && queryTrimmed && !searchQuery.isError ? (
        <div className="space-y-4" aria-busy={resultsLoading}>
          {resultsLoading ? (
            <TrackResultSkeletonList
              count={skeletonTrackCount}
              statusId={searchSkeletonStatusId}
            />
          ) : activeSearch &&
            searchQuery.isSuccess &&
            tracksPage &&
            tracksPage.items.length === 0 ? (
            <p className="rounded-lg border border-dashed border-white/14 px-4 py-10 text-center text-[0.9375rem] text-white/55">
              No tracks match this search. Try different keywords.
            </p>
          ) : activeSearch && searchQuery.isSuccess && tracksPage ? (
            <ul className="divide-y divide-white/8 overflow-hidden rounded-lg border border-white/12 bg-black/25">
              {tracksPage.items.map((track) => (
                <li key={track.id}>
                  <TrackResultRow
                    track={track}
                    requested={requestedIds.has(track.id)}
                    atLimit={atLimit}
                    disableRequest={pendingRequestTrackId === track.id}
                    disableUnrequest={pendingUnrequestTrackId === track.id}
                    allowRemove={!playlistClosed}
                    onRequest={() => requestMutation.mutate(track)}
                    onUnrequest={() => unrequestMutation.mutate(track.id)}
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {!playlistClosed && !queryTrimmed ? (
        <p className="text-center text-[0.8125rem] text-white/48">
          Start typing to search Spotify.
        </p>
      ) : null}

      <div className="rounded-lg border border-white/12 bg-black/30">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-[0.8125rem] font-medium text-white/85 transition hover:bg-white/5 sm:px-5"
          onClick={() => setRequestedSectionOpen((o) => !o)}
          aria-expanded={requestedSectionOpen}
        >
          <span style={{ fontFamily: sfFontSerif }} className="text-[1rem]">
            Requested songs ({requested.length})
          </span>
          <ChevronDown
            className={clsx(
              'h-5 w-5 shrink-0 text-white/55 transition',
              requestedSectionOpen && 'rotate-180',
            )}
            aria-hidden
          />
        </button>
        {requestedSectionOpen ? (
          <div className="border-t border-white/10 px-4 pb-4 sm:px-5">
            {requestedQuery.isError ? (
              <p className="mt-3 text-[0.8125rem] text-red-300/95" role="alert">
                Could not load requested songs.
              </p>
            ) : requestedQuery.isLoading ? (
              <RequestedSongSkeletonList
                rows={5}
                labelId={requestedSkeletonStatusId}
              />
            ) : requested.length === 0 ? (
              <p className="mt-3 text-[0.8125rem] text-white/52">
                You haven&apos;t requested any songs yet.
              </p>
            ) : (
              <ul className="mt-2 divide-y divide-white/8">
                {requested.map((song) => (
                  <li key={song.spotifyTrackId} className="px-1 sm:px-0">
                    <RequestedSongRow
                      song={song}
                      allowRemove={!playlistClosed}
                      disableUnrequest={
                        pendingUnrequestTrackId === song.spotifyTrackId
                      }
                      onUnrequest={() =>
                        unrequestMutation.mutate(song.spotifyTrackId)
                      }
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function TrackResultRow({
  track,
  requested,
  atLimit,
  disableRequest,
  disableUnrequest,
  allowRemove,
  onRequest,
  onUnrequest,
}: {
  track: SpotifyTrack;
  requested: boolean;
  atLimit: boolean;
  disableRequest: boolean;
  disableUnrequest: boolean;
  allowRemove: boolean;
  onRequest: () => void;
  onUnrequest: () => void;
}) {
  const art = track.album.images.find((i) => i.url)?.url ?? null;
  const artists = track.artists.map((a) => a.name).join(', ');
  const requestDisabled = (!requested && atLimit) || disableRequest;

  const detailTitle = [
    track.name,
    track.explicit ? '(E)' : null,
    artists,
    track.album.name,
    formatDuration(track.duration_ms),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="flex items-center gap-3.5 px-3 py-3.5 sm:gap-4 sm:px-4 sm:py-4">
      <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-white/6 sm:size-14">
        {art ? (
          <img
            src={art}
            alt=""
            className="size-full object-cover"
            width={56}
            height={56}
            loading="lazy"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-[0.6rem] text-white/35">
            —
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-0.5" title={detailTitle}>
        <div className="flex min-w-0 items-baseline gap-x-1.5">
          <span className="truncate text-[0.9375rem] leading-tight font-medium text-white/92">
            {track.name}
          </span>
          {track.explicit ? (
            <span className="shrink-0 rounded border border-amber-400/28 bg-amber-950/35 px-1 py-px text-[0.6rem] font-semibold tracking-wider text-amber-100/90 uppercase">
              E
            </span>
          ) : null}
        </div>
        <p className="truncate text-[0.8125rem] leading-snug text-white/58">
          <span className="text-white/70">{artists}</span>
          <span className="text-white/35"> · </span>
          <span>{track.album.name}</span>
          <span className="text-white/35"> · </span>
          <span className="text-white/55 tabular-nums">
            {formatDuration(track.duration_ms)}
          </span>
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <a
          href={track.external_urls.spotify}
          target="_blank"
          rel="noopener noreferrer"
          className={rowLinkButtonClass}
          aria-label={`Open “${track.name}” in Spotify`}
        >
          <ExternalLink className="size-4" aria-hidden />
        </a>
        <div className="relative size-9 shrink-0">
          {allowRemove ? (
            <button
              type="button"
              className={clsx(
                rowRemoveButtonClass,
                'absolute inset-0',
                requested
                  ? 'opacity-100'
                  : 'pointer-events-none opacity-0',
              )}
              aria-label={`Remove “${track.name}” from requests`}
              aria-hidden={!requested}
              tabIndex={requested ? 0 : -1}
              disabled={!requested || disableUnrequest}
              onClick={onUnrequest}
            >
              <Minus className="size-4 stroke-[3]" aria-hidden />
            </button>
          ) : null}
          <button
            type="button"
            className={clsx(
              rowAddButtonClass,
              allowRemove && 'absolute inset-0',
              requested ? 'pointer-events-none opacity-0' : 'opacity-100',
            )}
            aria-label={`Request “${track.name}”`}
            aria-hidden={requested}
            tabIndex={requested ? -1 : 0}
            disabled={requestDisabled}
            onClick={onRequest}
          >
            <Plus className="size-4 stroke-[3]" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

function RequestedSongRow({
  song,
  allowRemove,
  disableUnrequest,
  onUnrequest,
}: {
  song: RequestedSong;
  allowRemove: boolean;
  disableUnrequest: boolean;
  onUnrequest: () => void;
}) {
  const art = song.albumImageUrl;
  const artists = song.artists.join(', ');
  const detailTitle = [
    song.name,
    song.explicit ? '(E)' : null,
    artists,
    song.albumName,
    formatDuration(song.durationMs),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="flex items-center gap-3.5 py-3.5 first:pt-2 sm:gap-4 sm:py-4">
      <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-white/6 sm:size-14">
        {art ? (
          <img
            src={art}
            alt=""
            className="size-full object-cover"
            width={56}
            height={56}
            loading="lazy"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-[0.6rem] text-white/35">
            —
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-0.5" title={detailTitle}>
        <div className="flex min-w-0 items-baseline gap-x-1.5">
          <span className="truncate text-[0.9375rem] leading-tight font-medium text-white/92">
            {song.name}
          </span>
          {song.explicit ? (
            <span className="shrink-0 rounded border border-amber-400/28 bg-amber-950/35 px-1 py-px text-[0.6rem] font-semibold tracking-wider text-amber-100/90 uppercase">
              E
            </span>
          ) : null}
        </div>
        <p className="truncate text-[0.8125rem] leading-snug text-white/58">
          <span className="text-white/70">{artists}</span>
          <span className="text-white/35"> · </span>
          <span>{song.albumName}</span>
          <span className="text-white/35"> · </span>
          <span className="text-white/55 tabular-nums">
            {formatDuration(song.durationMs)}
          </span>
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <a
          href={song.spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={rowLinkButtonClass}
          aria-label={`Open “${song.name}” in Spotify`}
        >
          <ExternalLink className="size-4" aria-hidden />
        </a>
        {allowRemove ? (
          <button
            type="button"
            className={rowRemoveButtonClass}
            aria-label={`Remove “${song.name}” from requests`}
            disabled={disableUnrequest}
            onClick={onUnrequest}
          >
            <Minus className="size-4 stroke-[3]" aria-hidden />
          </button>
        ) : null}
      </div>
    </div>
  );
}

export type { SpotifySongRequestPickerProps } from '@/lib/spotify/types';
