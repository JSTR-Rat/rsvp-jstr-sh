import { ENGAGEMENT_GENERATED_BASE } from '@/lib/engagement-gallery-data';

/**
 * Same trio as the homepage thank-you preview (`THANK_YOU_GALLERY_PREVIEW`):
 * mosaic indices 0, 5, 10 → engagement_01, _06, _11.
 */
const INVITE_EMAIL_GALLERY_STEMS = [1, 6, 11] as const;

export const INVITE_EMAIL_GALLERY: readonly {
  pathname: string;
  alt: string;
}[] = INVITE_EMAIL_GALLERY_STEMS.map((n) => ({
  pathname: `${ENGAGEMENT_GENERATED_BASE}/gallery/engagement_${String(n).padStart(2, '0')}_gallery.jpg`,
  alt: `Engagement photograph ${n}`,
}));

/** Absolute image URL for email clients; falls back to site-root path if `inviteLink` is not parseable. */
export function resolveEmailPublicAssetUrl(
  inviteLink: string,
  pathname: string,
): string {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  try {
    return new URL(path, new URL(inviteLink).origin).href;
  } catch {
    return path;
  }
}

/** Link to the homepage gallery section (same host as the invitation). */
export function siteHomeGalleryUrl(inviteLink: string): string {
  try {
    return `${new URL(inviteLink).origin}/#gallery`;
  } catch {
    return '/#gallery';
  }
}
