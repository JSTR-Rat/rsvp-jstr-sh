import { useLayoutEffect } from 'react';

let lockCount = 0;

/**
 * Locks document scrolling while active. Uses a refcount so nested callers do not fight each other.
 * Works alongside modal libraries that also lock scroll.
 */
export function useBodyScrollLock(locked: boolean) {
  useLayoutEffect(() => {
    if (!locked) return;

    lockCount += 1;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      lockCount -= 1;
      if (lockCount <= 0) {
        lockCount = 0;
        document.body.style.overflow = previousOverflow;
      }
    };
  }, [locked]);
}
