/** Canonical when & where — keep in sync across invitation UI and invite email. */

/** Calendar date (YYYY-MM-DD) after which guest RSVP replies are closed (end of day, Brisbane). */
export const RSVP_CUTOFF_DATE = '2026-10-24';

const RSVP_CUTOFF_TIME_ZONE = 'Australia/Brisbane';

/** Instant after which `updateInviteResponseFN` rejects new or changed replies. */
export function getRsvpCutoffInstant(): Date {
  return new Date(`${RSVP_CUTOFF_DATE}T23:59:59.999+10:00`);
}

export function isRsvpCutoffPassed(now: Date = new Date()): boolean {
  return now.getTime() > getRsvpCutoffInstant().getTime();
}

/** Human-readable cut-off for guest-facing copy (e.g. "Friday 24 October 2026"). */
export function formatRsvpCutoffDateForDisplay(): string {
  const [year, month, day] = RSVP_CUTOFF_DATE.split('-').map(Number);
  const noonUtc = new Date(Date.UTC(year, month - 1, day, 12));
  return new Intl.DateTimeFormat('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: RSVP_CUTOFF_TIME_ZONE,
  }).format(noonUtc);
}

export const RSVP_CUTOFF_PASSED_ERROR_MESSAGE =
  'The RSVP cut-off date has passed.';

/** Throws when guest-facing changes (RSVP, playlist, etc.) are no longer allowed. */
export function assertEventCutoffNotPassed(): void {
  if (isRsvpCutoffPassed()) {
    throw new Error(RSVP_CUTOFF_PASSED_ERROR_MESSAGE);
  }
}

export const EVENT_WHEN_PRIMARY = 'Saturday 21 November 2026';
export const EVENT_WHEN_TIME = '4:00 PM';

export const VENUE_NAME = 'Greendays Restaurant and Bar';
export const VENUE_ADDRESS_LINES = [
  '8/6 Ashmore Road, Bundall QLD 4217',
  'Gold Coast, Queensland',
] as const;

export const VENUE_MAPS_URL = 'https://maps.app.goo.gl/XeMvNqZUKTbXv4Ka6';
export const VENUE_WEBSITE_URL = 'https://greendays.net.au/';

const VENUE_ADDRESS_QUERY = `${VENUE_NAME}, ${VENUE_ADDRESS_LINES[0]}`;

/** Google Maps iframe embed — no API key; used on the public landing page. */
export const VENUE_MAP_EMBED_URL = `https://maps.google.com/maps?q=${encodeURIComponent(VENUE_ADDRESS_QUERY)}&z=15&output=embed`;
