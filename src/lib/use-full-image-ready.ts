import { useLayoutEffect, useRef, useState } from 'react';

/**
 * Full-res `load` often fires before hydration (SSR/cache), so `onLoad` alone misses it — sync from `complete` after mount.
 */
export function useFullImageReady(src: string) {
  const [fullReady, setFullReady] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useLayoutEffect(() => {
    setFullReady(false);

    const el = imgRef.current;
    if (!el) return;

    const markReady = () => setFullReady(true);

    if (el.complete && el.naturalWidth > 0) {
      markReady();
      return;
    }

    el.addEventListener('load', markReady);
    el.addEventListener('error', markReady);
    return () => {
      el.removeEventListener('load', markReady);
      el.removeEventListener('error', markReady);
    };
  }, [src]);

  return { fullReady, imgRef };
}
