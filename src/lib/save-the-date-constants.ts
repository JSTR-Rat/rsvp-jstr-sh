/** Save-the-date hero — backgrounds, copy, and typography shared with `/`. */

export const SAVE_THE_DATE_TAGLINE =
  "We'd love to share our special day with you. Formal invitation to follow.";

/** Portrait / phone — tiny placeholder, then full WebP */
export const SAVE_THE_DATE_BG_PLACEHOLDER_MOBILE =
  '/images/generated/gallery/engagement_01_gallery.webp';
export const SAVE_THE_DATE_BG_FULL_MOBILE =
  '/images/generated/lightbox/engagement_01_lightbox.webp';
/** Wider layouts — matching pair */
export const SAVE_THE_DATE_BG_PLACEHOLDER_DESKTOP =
  '/images/generated/gallery/engagement_04_gallery.webp';
export const SAVE_THE_DATE_BG_FULL_DESKTOP =
  '/images/generated/lightbox/engagement_04_lightbox.webp';

export const SAVE_THE_DATE = {
  month: 'NOVEMBER',
  weekday: 'SATURDAY',
  day: '21',
  time: '4:00 PM',
  year: '2026',
  tagline: SAVE_THE_DATE_TAGLINE,
} as const;

export const saveTheDateFontSans = "'Jost', system-ui, sans-serif";
export const saveTheDateFontSerif =
  "'Cormorant Garamond', Georgia, 'Times New Roman', serif";

export const SAVE_THE_DATE_FONT_STYLESHEET =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@400;500&display=swap';

export const SAVE_THE_DATE_HEAD_PRELOADS = [
  {
    rel: 'preload' as const,
    as: 'image' as const,
    href: SAVE_THE_DATE_BG_PLACEHOLDER_MOBILE,
    media: '(max-width: 767px)',
    fetchPriority: 'high' as const,
  },
  {
    rel: 'preload' as const,
    as: 'image' as const,
    href: SAVE_THE_DATE_BG_PLACEHOLDER_DESKTOP,
    media: '(min-width: 768px)',
    fetchPriority: 'high' as const,
  },
];
