import { VENUE_MAP_EMBED_URL, VENUE_NAME } from '@/lib/wedding-event-details';
import { tw } from '@/lib/tw-merge';

type VenueMapEmbedProps = {
  className?: string;
};

export function VenueMapEmbed({ className }: VenueMapEmbedProps) {
  return (
    <div
      className={tw(
        'overflow-hidden rounded-lg border border-white/12 bg-black/35 shadow-[0_28px_64px_-12px_rgba(0,0,0,0.55)] sm:h-full',
        className,
      )}
    >
      <iframe
        title={`Map showing ${VENUE_NAME}`}
        src={VENUE_MAP_EMBED_URL}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="aspect-4/3 h-auto w-full border-0 sm:aspect-auto sm:h-full sm:min-h-0"
        allowFullScreen
      />
    </div>
  );
}
