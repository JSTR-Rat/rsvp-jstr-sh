import { useEffect, useRef } from 'react';
import { ENGAGEMENT_GALLERY_ITEMS } from '@/lib/engagement-gallery-data';

export type GalleryImageSearch = {
  image?: string;
};

export function validateGalleryImageSearch(
  raw: Record<string, unknown>,
): GalleryImageSearch {
  return {
    image:
      typeof raw.image === 'string' && raw.image.length > 0
        ? raw.image
        : undefined,
  };
}

export function useGalleryLightboxFromSearch(image: string | undefined) {
  const activeIndex = image
    ? ENGAGEMENT_GALLERY_ITEMS.findIndex((i) => i.id === image)
    : -1;
  const lightboxOpen = activeIndex >= 0;

  const hasRunSearchUrlEffectOnce = useRef(false);
  const prevImageSearchRef = useRef<string | undefined>(undefined);
  const closeLightboxWithBackRef = useRef(false);

  useEffect(() => {
    if (!hasRunSearchUrlEffectOnce.current) {
      hasRunSearchUrlEffectOnce.current = true;
      prevImageSearchRef.current = image;
      return;
    }
    const prev = prevImageSearchRef.current;
    prevImageSearchRef.current = image;
    if (!image) {
      closeLightboxWithBackRef.current = false;
    } else if (!prev) {
      closeLightboxWithBackRef.current = true;
    }
  }, [image]);

  return { activeIndex, lightboxOpen, closeLightboxWithBackRef };
}
