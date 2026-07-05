import {
  EVENT_WHEN_PRIMARY,
  EVENT_WHEN_TIME,
  VENUE_ADDRESS_LINES,
  VENUE_NAME,
} from '@/lib/wedding-event-details';

export const PAGE_TITLE_RSVP = 'Vada & Wade - RSVP';
export const PAGE_TITLE_WEDDING = 'Vada & Wade — Wedding';

export const INVITATION_PAGE_DESCRIPTION = `We'd love to share our special day with you. Reply to our wedding invitation for ${EVENT_WHEN_PRIMARY}.`;

export const LANDING_PAGE_DESCRIPTION = `${EVENT_WHEN_PRIMARY} · ${EVENT_WHEN_TIME} at ${VENUE_NAME}, ${VENUE_ADDRESS_LINES[1]}. Event details and engagement gallery.`;

/** 1200×630 — large OG / Discord / Twitter preview card */
export const OG_IMAGE_URL = '/wada-og.jpg';
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const OG_IMAGE_TYPE = 'image/jpeg';
export const OG_IMAGE_ALT =
  'Vada and Wade seated together in front of a silver Toyota Crown at golden hour.';

type SocialMetaInput = {
  title: string;
  description: string;
};

export function buildSocialMetaTags({ title, description }: SocialMetaInput) {
  return [
    { title },
    { name: 'description', content: description },
    { name: 'og:title', content: title },
    { name: 'og:description', content: description },
    { name: 'og:type', content: 'website' },
    { name: 'og:image', content: OG_IMAGE_URL },
    { name: 'og:image:width', content: String(OG_IMAGE_WIDTH) },
    { name: 'og:image:height', content: String(OG_IMAGE_HEIGHT) },
    { name: 'og:image:type', content: OG_IMAGE_TYPE },
    { name: 'og:image:alt', content: OG_IMAGE_ALT },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: OG_IMAGE_URL },
    { name: 'twitter:image:alt', content: OG_IMAGE_ALT },
  ];
}
