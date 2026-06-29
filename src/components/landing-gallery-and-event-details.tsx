import { MosaicGallery } from '@/components/mosaic-gallery';
import { VenueDetailsPanel } from '@/components/venue-details-panel';
import { VenueMapEmbed } from '@/components/venue-map-embed';
import { ENGAGEMENT_MOSAIC_IMAGES } from '@/lib/engagement-gallery-data';
import { saveTheDateFontSerif } from '@/lib/save-the-date-constants';
import clsx from 'clsx';

type LandingGalleryAndEventDetailsProps = {
  onGalleryTileClick: (index: number) => void;
  /** When true, event details appear above the gallery (invitation page). */
  eventDetailsFirst?: boolean;
  /** When false, only the gallery is shown (e.g. invitation — details live in RSVP). */
  showEventDetails?: boolean;
  /**
   * When true, omit the outer backdrop shell — parent provides a single shared
   * `bg-black/80 backdrop-blur-lg` wrapper (avoids a visible seam between sections).
   */
  embedded?: boolean;
  className?: string;
};

function EventDetailsSection({ className }: { className?: string }) {
  return (
    <section
      id="event-details"
      aria-labelledby="event-details-heading"
      className={clsx('text-white', className)}
    >
      <h2
        id="event-details-heading"
        className="mb-10 text-center font-serif text-3xl font-medium tracking-tight sm:text-4xl"
        style={{ fontFamily: saveTheDateFontSerif }}
      >
        Event details
      </h2>
      <div className="mx-auto flex max-w-4xl flex-col gap-8 sm:grid sm:max-w-6xl sm:grid-cols-2 sm:items-stretch sm:gap-x-10 sm:gap-y-0 xl:gap-x-12">
        <VenueDetailsPanel
          onOpaqueBackdrop
          showTitle={false}
          className="min-w-0"
        />
        <VenueMapEmbed className="relative z-10 min-w-0" />
      </div>
    </section>
  );
}

function GallerySection({
  onGalleryTileClick,
  className,
}: {
  onGalleryTileClick: (index: number) => void;
  className?: string;
}) {
  return (
    <section id="gallery" aria-labelledby="gallery-heading" className={className}>
      <h2
        id="gallery-heading"
        className="mb-10 text-center font-serif text-3xl font-medium tracking-tight text-white sm:text-4xl"
        style={{ fontFamily: saveTheDateFontSerif }}
      >
        Gallery
      </h2>
      <MosaicGallery
        images={ENGAGEMENT_MOSAIC_IMAGES}
        onTileClick={onGalleryTileClick}
        className="pb-4"
      />
    </section>
  );
}

const sectionDivider =
  'mt-16 border-t border-white/12 pt-16 sm:mt-20 sm:pt-20';

export function LandingGalleryAndEventDetails({
  onGalleryTileClick,
  eventDetailsFirst = false,
  showEventDetails = true,
  embedded = false,
  className,
}: LandingGalleryAndEventDetailsProps) {
  const content = (
    <div className="mx-auto max-w-6xl text-white">
      {!showEventDetails ? (
        <GallerySection onGalleryTileClick={onGalleryTileClick} />
      ) : eventDetailsFirst ? (
        <>
          <EventDetailsSection />
          <GallerySection
            onGalleryTileClick={onGalleryTileClick}
            className={sectionDivider}
          />
        </>
      ) : (
        <>
          <GallerySection onGalleryTileClick={onGalleryTileClick} />
          <EventDetailsSection className={sectionDivider} />
        </>
      )}
    </div>
  );

  if (embedded) {
    return <div className={className}>{content}</div>;
  }

  return (
    <div
      className={clsx(
        'min-h-svh bg-black/80 px-4 py-14 backdrop-blur-lg sm:px-8 sm:py-16',
        className,
      )}
    >
      {content}
    </div>
  );
}
