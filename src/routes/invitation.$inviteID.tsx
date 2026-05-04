import { useForm, useStore } from '@tanstack/react-form';
import { Link, createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { z } from 'zod';
import {
  StandardFormFieldRadioGroup,
  StandardFormFieldTextarea,
  StandardFormLayout,
  StandardFormShell,
  StandardServerError,
  StandardSubmitButton,
} from '@/forms/standard-form';
import {
  sfFontSans,
  sfFontSerif,
  sfLabel,
  sfShell,
} from '@/forms/standard-form/shared-classes';
import clsx from 'clsx';
import { ButtonPrimaryClassName } from '@/components/button-primary';
import {
  HERO_BLURRED_BG_DESKTOP,
  HERO_BLURRED_BG_MOBILE,
} from '@/components/hero-blurred-background';
import { ENGAGEMENT_MOSAIC_IMAGES } from '@/lib/engagement-gallery-data';
import {
  getInviteDetailsFN,
  markInviteSeenFN,
  updateInviteResponseFN,
} from '@/utils/invite.functions';

const PAGE_TITLE = 'Wade & Vada - RSVP';
const PAGE_DESCRIPTION =
  'Reply to our wedding invitation: Saturday 21 November 2026.';

/** Route path `/invitation/$inviteID` — UUID before loader / server calls. */
const invitationRouteParamsSchema = z.object({
  inviteID: z.uuid(),
});

class InvitationNotFoundError extends Error {
  override name = 'InvitationNotFoundError';
  constructor() {
    super('Invitation not found.');
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

function InvitationRouteError({
  error,
  reset,
}: {
  error: unknown;
  reset: () => void;
}) {
  let title = 'Something went wrong';
  let body =
    'Please try again in a moment. If this keeps happening, contact Wade or Vada.';

  if (error instanceof z.ZodError) {
    title = 'Invalid invitation link';
    body =
      'That link doesn’t look quite right. Double-check the address or open the link from your invitation email.';
  } else if (error instanceof InvitationNotFoundError) {
    title = 'Invitation not found';
    body =
      'We couldn’t find an invitation for this link. It may have been removed or the address might be mistyped.';
  }

  return (
    <StandardFormLayout heroPhotoBackdrop title={title}>
      <div
        className={clsx(sfShell, 'mx-auto max-w-md space-y-6')}
        style={{ fontFamily: sfFontSans }}
      >
        <p
          className="text-center text-[0.9375rem] leading-relaxed text-white/82"
          role="alert"
        >
          {body}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className={ButtonPrimaryClassName}
            style={{ fontFamily: sfFontSans }}
          >
            Try again
          </button>
          <Link
            to="/"
            className={clsx(
              ButtonPrimaryClassName,
              'inline-flex items-center justify-center no-underline',
            )}
            style={{ fontFamily: sfFontSans }}
          >
            Back to home
          </Link>
        </div>
      </div>
    </StandardFormLayout>
  );
}

const VENUE_MAPS_URL = 'https://share.google/b3HZFm5IH1EMDesTd';
const VENUE_WEBSITE_URL = 'https://greendays.net.au/';

const VENUE_NAME = 'Greendays';
const VENUE_ADDRESS_LINE_1 = '8/6 Ashmore Road, Bundall QLD 4217';
const VENUE_ADDRESS_LINE_2 = 'Gold Coast, Queensland';

const EVENT_WHEN_PRIMARY = 'Saturday 21 November 2026';
const EVENT_WHEN_TIME = '4:00 PM';

/** Mosaic indices for thank-you strip: varied crops; all link to `#gallery`. */
const THANK_YOU_GALLERY_PREVIEW: readonly [number, number, number] = [0, 5, 10];

const invitationSchema = z.object({
  rsvpStatus: z
    .union([z.literal('attending'), z.literal('unable'), z.literal('')])
    .refine((v) => v === 'attending' || v === 'unable', {
      message: 'Please select whether you will attend.',
    }),
  dietaryRequirements: z
    .string()
    .max(2000, 'Please keep dietary notes under 2000 characters.'),
});

type InvitationFormValues = {
  rsvpStatus: 'attending' | 'unable' | '';
  dietaryRequirements: string;
};

/** Matches `invite.status` in `src/db/schema/invite.ts`. */
type InviteDbStatus =
  | 'not-sent'
  | 'sent'
  | 'seen'
  | 'attending'
  | 'not-attending';

/**
 * Map persisted invite status → radio `rsvpStatus`.
 * DB `attending` / `not-attending` align with form choices; `not-sent` / `sent` / `seen`
 * mean no selection yet (`''`).
 */
function inviteDbStatusToFormRsvpStatus(
  status: InviteDbStatus,
): InvitationFormValues['rsvpStatus'] {
  switch (status) {
    case 'attending':
      return 'attending';
    case 'not-attending':
      return 'unable';
    case 'not-sent':
    case 'sent':
    case 'seen':
      return '';
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

function inviteHasPriorRsvpResponse(status: InviteDbStatus): boolean {
  return status === 'attending' || status === 'not-attending';
}

export type InvitationSubmission = z.infer<typeof invitationSchema>;

const thankYouGalleryLinkClass = clsx(
  'font-medium text-slate-200/95 underline decoration-white/20 underline-offset-[0.24em]',
  'transition-colors hover:text-white hover:decoration-white/45',
  'focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-white/45 focus-visible:outline-none',
);

function ThankYouBody({
  lastSubmission,
}: {
  lastSubmission: InvitationSubmission | null;
}) {
  const previews = THANK_YOU_GALLERY_PREVIEW.map(
    (i) => ENGAGEMENT_MOSAIC_IMAGES[i],
  );

  return (
    <div className="w-full space-y-10">
      <div className="space-y-5 text-center" role="status" aria-live="polite">
        <p
          className="text-[0.9375rem] leading-relaxed text-white/78"
          style={{ fontFamily: sfFontSans }}
        >
          {lastSubmission?.rsvpStatus === 'unable' ? (
            <>
              Thank you for letting us know. We'll miss you on the day. Wishing
              you well, and we hope our paths cross again soon.
            </>
          ) : (
            <>
              We're grateful you can join us and can't wait to celebrate
              together. Further details will follow closer to the date.
            </>
          )}
        </p>
        <Link
          to="/"
          hash="gallery"
          resetScroll={false}
          className={clsx(
            thankYouGalleryLinkClass,
            'inline-block text-[0.8125rem]',
          )}
        >
          Browse the gallery
        </Link>
      </div>

      <div className="space-y-3 border-t border-white/15 pt-10">
        <div className="space-y-2">
          <p
            className="block text-center text-[0.66rem] font-medium tracking-[0.22em] text-white/86 uppercase"
            style={{ fontFamily: sfFontSans }}
          >
            Engagement
          </p>
          <p
            className="text-center text-[0.8125rem] leading-snug text-white/74"
            style={{ fontFamily: sfFontSans }}
          >
            A few moments from our session; each opens the gallery.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {previews.map((img, idx) => (
            <Link
              key={img.src}
              to="/"
              hash="gallery"
              resetScroll={false}
              aria-label={`Open the engagement gallery${
                previews.length > 1 ? ` (photo ${idx + 1})` : ''
              }`}
              className={clsx(
                'group relative aspect-3/4 overflow-hidden rounded-md outline-none',
                'ring-1 ring-white/10 transition-[ring-color,transform] duration-200',
                'hover:ring-white/22 hover:brightness-105',
                'focus-visible:ring-2 focus-visible:ring-white/45',
              )}
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                decoding="async"
                className="size-full object-cover transition duration-300 group-hover:scale-[1.04]"
                width={img.width}
                height={img.height}
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/invitation/$inviteID')({
  params: invitationRouteParamsSchema,
  errorComponent: InvitationRouteError,
  component: RouteComponent,
  loader: async ({ params, cause }) => {
    const inviteDetails = await getInviteDetailsFN({
      data: { id: params.inviteID },
    });
    if (inviteDetails === null) {
      throw new InvitationNotFoundError();
    }
    if (cause === 'enter') {
      await markInviteSeenFN({ data: { id: inviteDetails.id } });
    }
    return { inviteDetails };
  },
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: 'description', content: PAGE_DESCRIPTION },
    ],
    links: [
      {
        rel: 'preload',
        as: 'image',
        href: HERO_BLURRED_BG_MOBILE,
        media: '(max-width: 767px)',
        fetchPriority: 'high',
      },
      {
        rel: 'preload',
        as: 'image',
        href: HERO_BLURRED_BG_DESKTOP,
        media: '(min-width: 768px)',
        fetchPriority: 'high',
      },
    ],
  }),
});

function RouteComponent() {
  const { inviteDetails } = Route.useLoaderData();

  const dbStatus = inviteDetails.status as InviteDbStatus;
  const priorSubmitted = inviteHasPriorRsvpResponse(dbStatus);

  const initialFormValues = useMemo((): InvitationFormValues => {
    return {
      rsvpStatus: inviteDbStatusToFormRsvpStatus(dbStatus),
      dietaryRequirements: inviteDetails.diataryRequirements ?? '',
    };
  }, [dbStatus, inviteDetails.diataryRequirements]);

  const [serverError, setServerError] = useState<string | null>(null);
  const [submitSucceeded, setSubmitSucceeded] = useState(false);
  const [lastSubmission, setLastSubmission] =
    useState<InvitationSubmission | null>(null);

  const form = useForm({
    defaultValues: initialFormValues,
    validators: {
      onChange: invitationSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      try {
        const parsed = invitationSchema.safeParse(value);
        if (!parsed.success) {
          return;
        }
        const updateResult = await updateInviteResponseFN({
          data: {
            id: inviteDetails.id,
            isAttending: parsed.data.rsvpStatus === 'attending',
            dietaryRequirements: parsed.data.dietaryRequirements,
          },
        });
        console.log({ updateResult });
        setLastSubmission(parsed.data);
        setSubmitSucceeded(true);
      } catch (err: unknown) {
        console.error('RSVP submission error:', err);
        setServerError(
          'Something went wrong sending your reply. Please try again.',
        );
      }
    },
  });

  const rsvpStatus = useStore(form.store, (s) => s.values.rsvpStatus);

  return (
    <StandardFormLayout
      heroPhotoBackdrop
      title={submitSucceeded ? 'So glad to hear from you' : 'Wade & Vada'}
      subtitle={
        submitSucceeded
          ? undefined
          : 'We would be honoured to celebrate with you.'
      }
    >
      {submitSucceeded ? (
        <ThankYouBody lastSubmission={lastSubmission} />
      ) : (
        <>
          <div
            className={clsx(sfShell, 'space-y-5')}
            style={{ fontFamily: sfFontSans }}
          >
            <p
              className="text-[0.9375rem] leading-relaxed text-white/82"
              style={{ fontFamily: sfFontSans }}
            >
              Hi {inviteDetails.name}, we would like to invite you to celebrate
              with us.
            </p>

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
              <p className={sfLabel} style={{ fontFamily: sfFontSans }}>
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
                  {VENUE_ADDRESS_LINE_1}
                </p>
                <p className="text-[0.9rem] leading-snug text-white/68">
                  {VENUE_ADDRESS_LINE_2}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <a
                  href={VENUE_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={ButtonPrimaryClassName}
                  style={{ fontFamily: sfFontSans }}
                >
                  Open venue in Maps
                </a>
                <a
                  href={VENUE_WEBSITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={ButtonPrimaryClassName}
                  style={{ fontFamily: sfFontSans }}
                >
                  Greendays website
                </a>
              </div>
            </div>
          </div>

          <StandardFormShell
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <StandardServerError error={serverError} />

            <form.Field name="rsvpStatus">
              {(field) => (
                <StandardFormFieldRadioGroup
                  field={field}
                  label="Can you attend?"
                  options={[
                    { label: 'Attending', value: 'attending' },
                    { label: 'Unable to make it', value: 'unable' },
                  ]}
                />
              )}
            </form.Field>

            {rsvpStatus === 'attending' ? (
              <form.Field name="dietaryRequirements">
                {(field) => (
                  <StandardFormFieldTextarea
                    field={field}
                    label="Dietary requirements"
                    hint="Optional. Allergies, dietary needs, or none."
                    placeholder="e.g. Nut allergy, vegetarian, or none"
                    autoComplete="off"
                    rows={4}
                  />
                )}
              </form.Field>
            ) : null}

            <form.Subscribe
              selector={(state) => ({
                canSubmit: state.canSubmit,
                isSubmitting: state.isSubmitting,
                // `isTouched` turns true on blur even when nothing changed; `isDirty`
                // only reflects value updates (TanStack sets both on real edits via setFieldValue).
                isDirty: state.isDirty,
                rsvpStatus: state.values.rsvpStatus,
              })}
            >
              {({ canSubmit, isSubmitting, isDirty, rsvpStatus: status }) => (
                <StandardSubmitButton
                  canSubmit={canSubmit && isDirty}
                  isSubmitting={isSubmitting}
                  loadingText={
                    priorSubmitted
                      ? 'Updating…'
                      : status === 'unable'
                        ? 'Confirming…'
                        : 'Sending…'
                  }
                >
                  {priorSubmitted
                    ? 'Update RSVP'
                    : status === 'unable'
                      ? 'Confirm'
                      : 'Send RSVP'}
                </StandardSubmitButton>
              )}
            </form.Subscribe>

            <div
              className="text-center text-[0.8125rem] leading-snug text-white/48"
              style={{ fontFamily: sfFontSans }}
            >
              <Link
                to="/"
                target="_blank"
                hash="gallery"
                rel="noopener noreferrer"
                className={clsx(
                  'font-medium text-slate-200/95 underline decoration-white/18 underline-offset-[0.24em] transition-colors',
                  'hover:text-white hover:decoration-white/45',
                  'focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-white/45 focus-visible:outline-none',
                )}
              >
                Open the engagement gallery
              </Link>
            </div>
          </StandardFormShell>
        </>
      )}
    </StandardFormLayout>
  );
}
