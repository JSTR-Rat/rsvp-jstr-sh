import { useEffect, useRef, useState } from 'react';
import { VENUE_MAP_EMBED_URL, VENUE_NAME } from '@/lib/wedding-event-details';
import { tw } from '@/lib/tw-merge';

const TAP_SLOP_PX = 10;

type VenueMapEmbedProps = {
  className?: string;
};

export function VenueMapEmbed({ className }: VenueMapEmbedProps) {
  const [interactive, setInteractive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!interactive) return;

    const onPointerDown = (event: PointerEvent) => {
      const container = containerRef.current;
      if (!container?.contains(event.target as Node)) {
        setInteractive(false);
      }
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    return () =>
      document.removeEventListener('pointerdown', onPointerDown, true);
  }, [interactive]);

  const activateIfTap = (clientX: number, clientY: number) => {
    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    if (!start) return;

    const dx = clientX - start.x;
    const dy = clientY - start.y;
    if (Math.hypot(dx, dy) < TAP_SLOP_PX) {
      setInteractive(true);
    }
  };

  const onShieldPointerDown = (event: React.PointerEvent) => {
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
  };

  const onShieldPointerUp = (event: React.PointerEvent) => {
    activateIfTap(event.clientX, event.clientY);
  };

  const onShieldPointerCancel = () => {
    pointerStartRef.current = null;
  };

  const onShieldKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setInteractive(true);
    }
  };

  return (
    <div
      ref={containerRef}
      className={tw(
        'relative overflow-hidden rounded-lg border border-white/12 bg-black/35 shadow-[0_28px_64px_-12px_rgba(0,0,0,0.55)] sm:h-full',
        className,
      )}
    >
      <iframe
        title={`Map showing ${VENUE_NAME}`}
        src={VENUE_MAP_EMBED_URL}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className={tw(
          'aspect-4/3 h-auto w-full border-0 sm:aspect-auto sm:h-full sm:min-h-0',
          !interactive && 'pointer-events-none',
        )}
        allowFullScreen
      />

      {!interactive ? (
        <div
          role="button"
          tabIndex={0}
          aria-label="Tap to interact with map"
          className={tw(
            'absolute inset-0 z-10 flex touch-manipulation cursor-pointer items-end justify-center bg-linear-to-t from-black/40 via-transparent to-transparent pb-4',
            'focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-white/24 focus-visible:outline-none',
          )}
          onPointerDown={onShieldPointerDown}
          onPointerUp={onShieldPointerUp}
          onPointerCancel={onShieldPointerCancel}
          onKeyDown={onShieldKeyDown}
        >
          <span className="rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-white/85">
            Tap to interact
          </span>
        </div>
      ) : null}
    </div>
  );
}
