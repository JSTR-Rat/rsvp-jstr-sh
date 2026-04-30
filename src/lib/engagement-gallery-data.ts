import type { LightboxImage } from '@/components/lightbox';
import type {
  MosaicGalleryImage,
  MosaicNormalizedCrop,
} from '@/components/mosaic-gallery';

/** Original JPEG pixel dimensions (aspect ratio matches generated WebP). Order: engagement_01 … engagement_15. */
const ENGAGEMENT_SOURCE_SIZE: readonly (readonly [number, number])[] = [
  [3506, 5259],
  [3315, 4972],
  [3280, 4920],
  [3411, 5116],
  [3261, 4892],
  [3308, 4962],
  [3465, 5197],
  [3279, 4919],
  [3102, 4653],
  [3129, 4693],
  [3326, 4989],
  [3648, 5472],
  [3251, 4876],
  [5472, 3648],
  [3233, 4849],
] as const;

/**
 * Normalized crops (0–1, left/top/width/height) for mosaic tiles only — primary subject
 * regions from the originals; lightbox still shows the full frame.
 */
export const ENGAGEMENT_MOSAIC_CROPS: readonly MosaicNormalizedCrop[] = [
  { x: 0.33, y: 0.311, w: 0.396, h: 0.597 },
  { x: 0.27, y: 0.16, w: 0.5, h: 0.77 },
  { x: 0.05, y: 0.08, w: 0.9, h: 0.62 },
  { x: 0.12, y: 0.37, w: 0.56, h: 0.43 },
  { x: 0.1, y: 0.22, w: 0.8, h: 0.48 },
  { x: 0.06, y: 0.08, w: 0.88, h: 0.82 },
  { x: 0.1, y: 0.14, w: 0.8, h: 0.72 },
  { x: 0.34, y: 0.2, w: 0.61, h: 0.68 },
  { x: 0.23, y: 0.2, w: 0.49, h: 0.75 },
  { x: 0, y: 0.31, w: 0.89, h: 0.65 },
  { x: 0.03, y: 0.28, w: 0.72, h: 0.66 },
  { x: 0.28, y: 0.08, w: 0.62, h: 0.72 },
  { x: 0.12, y: 0.28, w: 0.84, h: 0.71 },
  { x: 0.22, y: 0.25, w: 0.51, h: 0.4 },
  { x: 0.18, y: 0.22, w: 0.64, h: 0.52 },
] as const;

export const ENGAGEMENT_GENERATED_BASE = '/images/generated';

function engagementStem(index1: number): string {
  return `engagement_${String(index1).padStart(2, '0')}`;
}

/** Stable ids for `?image=` (shareable lightbox URLs) */
export const ENGAGEMENT_GALLERY_ITEMS: LightboxImage[] = ENGAGEMENT_SOURCE_SIZE.map(
  ([width, height], i) => {
    const n = i + 1;
    const stem = engagementStem(n);
    const id = `engagement-${String(n).padStart(2, '0')}`;
    return {
      id,
      src: `${ENGAGEMENT_GENERATED_BASE}/lightbox/${stem}_lightbox.webp`,
      placeholderSrc: `${ENGAGEMENT_GENERATED_BASE}/placeholders/${stem}_placeholder.webp`,
      alt: `Engagement photograph ${n}`,
      width,
      height,
      title: `Photo ${n}`,
    };
  },
);

export const ENGAGEMENT_MOSAIC_IMAGES: MosaicGalleryImage[] = ENGAGEMENT_GALLERY_ITEMS.map(
  (item, index) => {
    const stem = engagementStem(index + 1);
    const mosaicCrop = ENGAGEMENT_MOSAIC_CROPS[index];
    return {
      src: `${ENGAGEMENT_GENERATED_BASE}/gallery/${stem}_gallery.webp`,
      placeholderSrc: item.placeholderSrc,
      alt: item.alt,
      width: item.width,
      height: item.height,
      mosaicCrop,
    };
  },
);
