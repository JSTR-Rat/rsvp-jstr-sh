import { useEffect } from 'react';

import type { LightboxImage } from './types';

function preloadUrl(url: string): void {
  const img = new Image();
  img.src = url;
}

/** Warms browser cache for slides adjacent to the active index. */
export function useAdjacentImagePreload(
  images: readonly LightboxImage[],
  activeIndex: number,
): void {
  useEffect(() => {
    if (images.length === 0) return;

    const prev = images[activeIndex - 1];
    const next = images[activeIndex + 1];

    if (prev) preloadUrl(prev.src);
    if (next) preloadUrl(next.src);
  }, [activeIndex, images]);
}
