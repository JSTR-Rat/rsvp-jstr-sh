import { VenueIconLink } from '@/components/venue-icon-link';
import {
  sfFontSans,
  sfFontSerif,
  sfLabel,
  sfShell,
  sfShellOnDarkBackdrop,
} from '@/forms/standard-form/shared-classes';
import {
  EVENT_WHEN_PRIMARY,
  EVENT_WHEN_TIME,
  VENUE_ADDRESS_LINES,
  VENUE_MAPS_URL,
  VENUE_NAME,
  VENUE_WEBSITE_URL,
} from '@/lib/wedding-event-details';
import { tw } from '@/lib/tw-merge';
import clsx from 'clsx';

type VenueDetailsPanelProps = {
  /** Panel sits on an opaque dark section (e.g. home gallery) rather than a photo backdrop. */
  onOpaqueBackdrop?: boolean;
  /** Show the in-panel “Event details” heading (default; hidden on home when the section provides it). */
  showTitle?: boolean;
  className?: string;
};

export function VenueDetailsPanel({
  onOpaqueBackdrop = false,
  showTitle = true,
  className,
}: VenueDetailsPanelProps) {
  return (
    <div
      className={tw(
        clsx(
          onOpaqueBackdrop ? sfShellOnDarkBackdrop : sfShell,
          'min-w-0 space-y-5',
        ),
        className,
      )}
      style={{ fontFamily: sfFontSans }}
    >
      {showTitle ? (
        <h2
          className="text-center text-[1.125rem] leading-snug font-medium tracking-tight text-white/94 sm:text-[1.1875rem] lg:text-left"
          style={{ fontFamily: sfFontSerif }}
        >
          Event details
        </h2>
      ) : null}

      <div className="space-y-1">
        <p className={sfLabel} style={{ fontFamily: sfFontSans }}>
          When
        </p>
        <p
          className="text-[1.05rem] leading-snug font-medium text-white/92 sm:text-[1.125rem]"
          style={{ fontFamily: sfFontSerif }}
        >
          {EVENT_WHEN_PRIMARY}
        </p>
        <p className="text-[0.9rem] text-white/68">{EVENT_WHEN_TIME}</p>
      </div>

      <div className="space-y-3">
        <p
          className="block text-[0.66rem] font-medium tracking-[0.22em] text-white/86 uppercase"
          style={{ fontFamily: sfFontSans }}
        >
          Venue
        </p>
        <div className="space-y-0.5">
          <p
            className="text-[1.05rem] leading-snug font-medium text-white/92 sm:text-[1.125rem]"
            style={{ fontFamily: sfFontSerif }}
          >
            {VENUE_NAME}
          </p>
          <p className="text-[0.9rem] leading-snug text-white/72">
            {VENUE_ADDRESS_LINES[0]}
          </p>
          <p className="text-[0.9rem] leading-snug text-white/68">
            {VENUE_ADDRESS_LINES[1]}
          </p>
        </div>
        <div className="flex gap-2 pt-1">
          <VenueIconLink
            href={VENUE_MAPS_URL}
            label="Open venue in Maps"
            icon="maps"
          />
          <VenueIconLink
            href={VENUE_WEBSITE_URL}
            label="Venue website"
            icon="website"
          />
        </div>
      </div>
    </div>
  );
}
