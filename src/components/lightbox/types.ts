export type LightboxImage = {
  /** Stable id for shareable URLs (must be URL-safe as used in query strings) */
  id: string;
  src: string;
  placeholderSrc?: string;
  alt: string;
  width?: number;
  height?: number;
  title?: string;
  description?: string;
};
