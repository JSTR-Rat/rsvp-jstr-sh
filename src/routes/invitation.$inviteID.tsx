import { useForm, useStore } from '@tanstack/react-form';
import {
  Link,
  createFileRoute,
  useNavigate,
  useRouter,
} from '@tanstack/react-router';
import {
  Button,
  Description,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import { useMemo, useLayoutEffect, useState } from 'react';
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
  sfShellOnDarkBackdrop,
} from '@/forms/standard-form/shared-classes';
import clsx from 'clsx';
import {
  ButtonPrimary,
  ButtonPrimaryClassName,
} from '@/components/button-primary';
import { LandingGalleryAndEventDetails } from '@/components/landing-gallery-and-event-details';
import { Lightbox } from '@/components/lightbox';
import { SaveTheDateHero } from '@/components/save-the-date-hero';
import { HeroBlurredBackground } from '@/components/hero-blurred-background';
import { VenueDetailsPanel } from '@/components/venue-details-panel';
import { ENGAGEMENT_GALLERY_ITEMS } from '@/lib/engagement-gallery-data';
import {
  type GalleryImageSearch,
  useGalleryLightboxFromSearch,
  validateGalleryImageSearch,
} from '@/lib/gallery-lightbox-search';
import { SAVE_THE_DATE_HEAD_PRELOADS } from '@/lib/save-the-date-constants';
import {
  INVITATION_PAGE_DESCRIPTION,
  PAGE_TITLE_RSVP,
  buildSocialMetaTags,
} from '@/lib/page-social-meta';
import {
  MEAL_CHOICE_OPTIONS,
  mealChoiceIdSchema,
  mealChoiceLabel,
  type MealChoiceId,
} from '@/lib/wedding-meal-options';
import {
  RSVP_CUTOFF_PASSED_ERROR_MESSAGE,
  formatRsvpCutoffDateForDisplay,
  isRsvpCutoffPassed,
} from '@/lib/wedding-event-details';
import {
  inviteHasPriorRsvpResponse,
  type InviteDbStatus,
} from '@/lib/invite-rsvp-status';
import {
  getInviteDetailsFN,
  markInviteSeenFN,
  updateInviteResponseFN,
} from '@/utils/invite.functions';
import { SpotifySongRequestPicker } from '@/components/spotify-song-request-picker';

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

function InvitationInviteeGreeting({ name }: { name: string }) {
  return (
    <p
      className="mx-auto max-w-2xl text-center text-[0.9375rem] leading-relaxed text-white/82"
      style={{ fontFamily: sfFontSans }}
    >
      Hi {name}, we would like to invite you to celebrate with us.
    </p>
  );
}

function InvitationVenueDetailsCard() {
  return <VenueDetailsPanel onOpaqueBackdrop />;
}

function InvitationSummaryLead({
  guestName,
  isJustSubmitted,
  attending,
}: {
  guestName: string;
  isJustSubmitted: boolean;
  attending: boolean;
}) {
  return (
    <div
      className="mx-auto max-w-2xl text-center"
      role="status"
      aria-live="polite"
    >
      {isJustSubmitted ? (
        <p
          className="text-[0.9375rem] leading-relaxed text-white/78"
          style={{ fontFamily: sfFontSans }}
        >
          {attending ? (
            <>
              We're grateful you can join us and can't wait to celebrate
              together. Further details will follow closer to the date.
            </>
          ) : (
            <>
              Thank you for letting us know. We'll miss you on the day. Wishing
              you well, and we hope our paths cross again soon.
            </>
          )}
        </p>
      ) : (
        <p
          className="text-[0.9375rem] leading-relaxed text-white/82"
          style={{ fontFamily: sfFontSans }}
        >
          {attending ? (
            <>Hi {guestName}, we're grateful you can join us.</>
          ) : (
            <>Hi {guestName}, thanks for letting us know you can't make it.</>
          )}
        </p>
      )}
    </div>
  );
}

const invitationSchema = z
  .object({
    rsvpStatus: z
      .union([z.literal('attending'), z.literal('unable'), z.literal('')])
      .refine((v) => v === 'attending' || v === 'unable', {
        message: 'Please select whether you will attend.',
      }),
    mealChoice: z.union([mealChoiceIdSchema, z.literal('')]),
    dietaryRequirements: z
      .string()
      .max(2000, 'Please keep dietary notes under 2000 characters.'),
    additionalNotes: z
      .string()
      .max(2000, 'Please keep additional notes under 2000 characters.'),
  })
  .superRefine((data, ctx) => {
    if (data.rsvpStatus === 'attending' && data.mealChoice === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please select a meal choice.',
        path: ['mealChoice'],
      });
    }
  });

type InvitationFormValues = {
  rsvpStatus: 'attending' | 'unable' | '';
  mealChoice: MealChoiceId | '';
  dietaryRequirements: string;
  additionalNotes: string;
};

function inviteDbMealChoiceToFormValue(
  raw: string | null | undefined,
): MealChoiceId | '' {
  if (raw === null || raw === undefined || raw === '') return '';
  const parsed = mealChoiceIdSchema.safeParse(raw);
  return parsed.success ? parsed.data : '';
}

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

export type InvitationSubmission = z.infer<typeof invitationSchema>;

export type InvitationSearch = GalleryImageSearch;

type InviteDetailsFromLoader = {
  name: string;
  status: string;
  mealChoice: string | null;
  diataryRequirements: string | null;
  additionalNotes: string | null;
};

function RsvpCutoffPastMessage() {
  return (
    <p
      className="text-center text-[0.8125rem] leading-snug text-white/50"
      style={{ fontFamily: sfFontSans }}
    >
      The RSVP cut-off date has passed. If you need to make any changes, please
      reach out to Wade or Vada directly.
    </p>
  );
}

function RsvpClosedPanel() {
  return (
    <div className={clsx(sfShellOnDarkBackdrop, 'w-full space-y-6')}>
      <h2
        className="text-center text-[1.125rem] leading-snug font-medium tracking-tight text-white/94 sm:text-[1.1875rem]"
        style={{ fontFamily: sfFontSerif }}
      >
        RSVPs are closed
      </h2>
      <RsvpCutoffPastMessage />
    </div>
  );
}

function RSVPSummary({
  inviteDetails,
  onEdit,
  rsvpCutoffPassed,
}: {
  inviteDetails: InviteDetailsFromLoader;
  onEdit: () => void;
  rsvpCutoffPassed: boolean;
}) {
  const dbStatus = inviteDetails.status as InviteDbStatus;
  const attending = dbStatus === 'attending';

  return (
    <div className={clsx(sfShellOnDarkBackdrop, 'w-full space-y-6')}>
      <h2
        className="text-center text-[1.125rem] leading-snug font-medium tracking-tight text-white/94 sm:text-[1.1875rem]"
        style={{ fontFamily: sfFontSerif }}
      >
        Your details
      </h2>

      <div
        className={clsx(
          'rounded-lg border border-white/14 bg-black/28 p-4 backdrop-blur-sm sm:p-5',
        )}
      >
        <dl className="space-y-3 text-left">
          <div className="space-y-1">
            <dt className={sfLabel} style={{ fontFamily: sfFontSans }}>
              Response
            </dt>
            <dd
              className="text-[0.9375rem] leading-snug text-white/85"
              style={{ fontFamily: sfFontSans }}
            >
              {attending ? 'Attending' : 'Unable to attend'}
            </dd>
          </div>
          {attending ? (
            <>
              <div className="space-y-1">
                <dt className={sfLabel} style={{ fontFamily: sfFontSans }}>
                  Meal choice
                </dt>
                <dd
                  className="text-[0.9375rem] leading-snug text-white/85"
                  style={{ fontFamily: sfFontSans }}
                >
                  {mealChoiceLabel(inviteDetails.mealChoice) ?? 'Not recorded'}
                </dd>
              </div>
              <div className="space-y-1">
                <dt className={sfLabel} style={{ fontFamily: sfFontSans }}>
                  Dietary requirements
                </dt>
                <dd
                  className="text-[0.9375rem] leading-snug whitespace-pre-wrap text-white/85"
                  style={{ fontFamily: sfFontSans }}
                >
                  {inviteDetails.diataryRequirements?.trim()
                    ? inviteDetails.diataryRequirements
                    : 'None specified'}
                </dd>
              </div>
              {inviteDetails.additionalNotes?.trim() ? (
                <div className="space-y-1">
                  <dt className={sfLabel} style={{ fontFamily: sfFontSans }}>
                    Additional notes
                  </dt>
                  <dd
                    className="text-[0.9375rem] leading-snug whitespace-pre-wrap text-white/85"
                    style={{ fontFamily: sfFontSans }}
                  >
                    {inviteDetails.additionalNotes}
                  </dd>
                </div>
              ) : null}
            </>
          ) : null}
        </dl>
      </div>

      {rsvpCutoffPassed ? (
        <RsvpCutoffPastMessage />
      ) : (
        <p
          className="text-center text-[0.8125rem] leading-snug text-white/50"
          style={{ fontFamily: sfFontSans }}
        >
          Need to change something? Please update your reply before{' '}
          <span className="text-white/64">
            {formatRsvpCutoffDateForDisplay()}
          </span>
          .
        </p>
      )}

      {rsvpCutoffPassed ? null : (
        <ButtonPrimary type="button" className="w-full" onClick={onEdit}>
          Edit RSVP
        </ButtonPrimary>
      )}
    </div>
  );
}

function DiscardRsvpEditsDialog({
  open,
  onClose,
  onDiscard,
}: {
  open: boolean;
  onClose: () => void;
  onDiscard: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/70 backdrop-blur-sm duration-200 ease-out data-closed:opacity-0"
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          transition
          className={clsx(
            sfShell,
            'w-full max-w-sm space-y-5 duration-200 ease-out data-closed:scale-95 data-closed:opacity-0',
          )}
          style={{ fontFamily: sfFontSans }}
        >
          <DialogTitle
            className="text-center text-[1.125rem] leading-snug font-medium tracking-tight text-white/94"
            style={{ fontFamily: sfFontSerif }}
          >
            Discard changes?
          </DialogTitle>
          <Description className="text-center text-[0.9375rem] leading-relaxed text-white/72">
            You have unsaved edits to your RSVP. If you leave now, those changes
            will be lost.
          </Description>
          <div className="flex gap-3">
            <ButtonPrimary type="button" className="flex-1" onClick={onClose}>
              Keep editing
            </ButtonPrimary>
            <Button
              type="button"
              className={clsx(
                'inline-flex flex-1 shrink-0 items-center justify-center rounded-md border px-3.5 py-2',
                'text-[0.8125rem] font-medium transition-[border-color,background-color]',
                'cursor-pointer border-red-500/55 bg-red-950/55 text-red-100 select-none',
                'hover:border-red-400/70 hover:bg-red-900/65',
                'focus-visible:ring-[3px] focus-visible:ring-red-500/35 focus-visible:outline-none',
                'active:scale-95',
              )}
              style={{ fontFamily: sfFontSans }}
              onClick={onDiscard}
            >
              Discard
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

function InvitationSectionDivider() {
  return (
    <div className="px-4 sm:px-8">
      <div aria-hidden className="mx-auto max-w-6xl border-t border-white/12" />
    </div>
  );
}

/** Scroll viewport to the RSVP section after view transitions (submit / edit). */
function scrollInvitationRsvpSectionIntoView() {
  const run = () => {
    document.getElementById('rsvp-form')?.scrollIntoView({ block: 'start' });
  };
  run();
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(run);
  });
}

export const Route = createFileRoute('/invitation/$inviteID')({
  params: invitationRouteParamsSchema,
  validateSearch: validateGalleryImageSearch,
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
    meta: buildSocialMetaTags({
      title: PAGE_TITLE_RSVP,
      description: INVITATION_PAGE_DESCRIPTION,
    }),
    links: SAVE_THE_DATE_HEAD_PRELOADS,
  }),
});

function RouteComponent() {
  const router = useRouter();
  const navigate = useNavigate();
  const { inviteID } = Route.useParams();
  const search = Route.useSearch();
  const { inviteDetails } = Route.useLoaderData();
  const { activeIndex, lightboxOpen } = useGalleryLightboxFromSearch(
    search.image,
  );

  const dbStatus = inviteDetails.status as InviteDbStatus;
  const priorSubmitted = inviteHasPriorRsvpResponse(dbStatus);
  const rsvpCutoffPassed = isRsvpCutoffPassed();

  const initialFormValues = useMemo((): InvitationFormValues => {
    return {
      rsvpStatus: inviteDbStatusToFormRsvpStatus(dbStatus),
      mealChoice: inviteDbMealChoiceToFormValue(inviteDetails.mealChoice),
      dietaryRequirements: inviteDetails.diataryRequirements ?? '',
      additionalNotes: inviteDetails.additionalNotes ?? '',
    };
  }, [
    dbStatus,
    inviteDetails.additionalNotes,
    inviteDetails.diataryRequirements,
    inviteDetails.mealChoice,
  ]);

  const [serverError, setServerError] = useState<string | null>(null);
  const [submitSucceeded, setSubmitSucceeded] = useState(false);
  const [isEditingRsvp, setIsEditingRsvp] = useState(false);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);

  const showSubmittedSummary =
    priorSubmitted && !submitSucceeded && !isEditingRsvp;

  const showRsvpSummaryUi = submitSucceeded || showSubmittedSummary;

  const form = useForm({
    defaultValues: initialFormValues,
    validators: {
      onChange: invitationSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      setServerError(null);
      try {
        const parsed = invitationSchema.safeParse(value);
        if (!parsed.success) {
          return;
        }
        const attending = parsed.data.rsvpStatus === 'attending';
        await updateInviteResponseFN({
          data: {
            id: inviteDetails.id,
            isAttending: attending,
            dietaryRequirements: attending
              ? parsed.data.dietaryRequirements.trim() || null
              : null,
            mealChoice: attending
              ? mealChoiceIdSchema.parse(parsed.data.mealChoice)
              : null,
            additionalNotes: attending
              ? parsed.data.additionalNotes.trim() || null
              : null,
          },
        });
        await router.invalidate();
        // Clear dirty state: TanStack Form compares values to initial defaultValues,
        // which are not updated when loader data changes after a successful save.
        formApi.reset(parsed.data);
        setSubmitSucceeded(true);
        setIsEditingRsvp(false);
      } catch (err: unknown) {
        console.error('RSVP submission error:', err);
        const message =
          err instanceof Error &&
          err.message === RSVP_CUTOFF_PASSED_ERROR_MESSAGE
            ? 'The RSVP cut-off date has passed. If you need to make any changes, please reach out to Wade or Vada directly.'
            : 'Something went wrong sending your reply. Please try again.';
        setServerError(message);
      }
    },
  });

  const rsvpStatus = useStore(form.store, (s) => s.values.rsvpStatus);
  const isFormDirty = useStore(form.store, (s) => s.isDirty);

  const exitEditMode = () => {
    setIsEditingRsvp(false);
    scrollInvitationRsvpSectionIntoView();
  };

  const handleCancelEdit = () => {
    if (isFormDirty) {
      setDiscardDialogOpen(true);
      return;
    }
    exitEditMode();
  };

  const handleDiscardEdits = () => {
    form.reset(initialFormValues);
    setDiscardDialogOpen(false);
    exitEditMode();
  };

  const invitationTwoColumnGrid =
    'grid w-full grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start lg:gap-x-10 xl:gap-x-12';
  /** Gap between greeting / summary lead and the two-column panels. */
  const invitationLeadToPanels = 'space-y-8 lg:space-y-10';
  /** Second grid column — `min-w-0` avoids overflow in two-column layouts. */
  const invitationSecondPane = 'min-w-0';

  useLayoutEffect(() => {
    if (!submitSucceeded) return;
    scrollInvitationRsvpSectionIntoView();
  }, [submitSucceeded]);

  const closeLightbox = () => {
    navigate({
      to: '/invitation/$inviteID',
      params: { inviteID },
      search: {},
      resetScroll: false,
    });
  };

  const goToImage = (index: number) => {
    const item = ENGAGEMENT_GALLERY_ITEMS[index];
    if (!item) return;
    navigate({
      to: '/invitation/$inviteID',
      params: { inviteID },
      search: { image: item.id },
      replace: true,
      resetScroll: false,
    });
  };

  const rsvpFormSection = (
    <div id="rsvp-form" className="px-4 py-14 sm:px-8 sm:py-16">
      <div className="mx-auto w-full max-w-88 text-white sm:max-w-[24rem] lg:max-w-[min(100%,52rem)] xl:max-w-232">
        {showRsvpSummaryUi ? (
          <div className={clsx('w-full', invitationLeadToPanels)}>
            <InvitationSummaryLead
              guestName={inviteDetails.name}
              isJustSubmitted={submitSucceeded}
              attending={dbStatus === 'attending'}
            />
            <div className={invitationTwoColumnGrid}>
              <div className="min-w-0">
                <InvitationVenueDetailsCard />
              </div>
              <div className={invitationSecondPane}>
                <RSVPSummary
                  inviteDetails={inviteDetails}
                  rsvpCutoffPassed={rsvpCutoffPassed}
                  onEdit={() => {
                    if (rsvpCutoffPassed) return;
                    if (submitSucceeded) {
                      setSubmitSucceeded(false);
                    }
                    setIsEditingRsvp(true);
                    scrollInvitationRsvpSectionIntoView();
                  }}
                />
              </div>
            </div>
          </div>
        ) : rsvpCutoffPassed ? (
          <div className={clsx('w-full', invitationLeadToPanels)}>
            <InvitationInviteeGreeting name={inviteDetails.name} />
            <div className={invitationTwoColumnGrid}>
              <div className="min-w-0">
                <InvitationVenueDetailsCard />
              </div>
              <div className={invitationSecondPane}>
                <RsvpClosedPanel />
              </div>
            </div>
          </div>
        ) : (
          <div className={clsx('w-full', invitationLeadToPanels)}>
            <InvitationInviteeGreeting name={inviteDetails.name} />
            <div className={invitationTwoColumnGrid}>
              <div className="min-w-0">
                <InvitationVenueDetailsCard />
              </div>

              <div className={invitationSecondPane}>
                <StandardFormShell
                  shellClassName={sfShellOnDarkBackdrop}
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
                    <>
                      <form.Field name="mealChoice">
                        {(field) => (
                          <StandardFormFieldRadioGroup
                            variant="stacked"
                            field={field}
                            label="Meal choice"
                            options={MEAL_CHOICE_OPTIONS.map((o) => ({
                              label: o.label,
                              value: o.value,
                            }))}
                          />
                        )}
                      </form.Field>

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

                      <form.Field name="additionalNotes">
                        {(field) => (
                          <StandardFormFieldTextarea
                            field={field}
                            label="Additional notes"
                            hint="Optional."
                            placeholder="Anything else we should know"
                            autoComplete="off"
                            rows={4}
                          />
                        )}
                      </form.Field>
                    </>
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
                    {({
                      canSubmit,
                      isSubmitting,
                      isDirty,
                      rsvpStatus: status,
                    }) =>
                      isEditingRsvp ? (
                        <div className="flex gap-3">
                          <ButtonPrimary
                            type="button"
                            className="w-full min-w-0 flex-2"
                            disabled={isSubmitting}
                            onClick={handleCancelEdit}
                          >
                            Back
                          </ButtonPrimary>
                          <div className="min-w-0 flex-3">
                            <StandardSubmitButton
                              canSubmit={canSubmit && isDirty}
                              isSubmitting={isSubmitting}
                              loadingText="Updating…"
                            >
                              Update RSVP
                            </StandardSubmitButton>
                          </div>
                        </div>
                      ) : (
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
                      )
                    }
                  </form.Subscribe>

                  {isEditingRsvp ? (
                    <DiscardRsvpEditsDialog
                      open={discardDialogOpen}
                      onClose={() => setDiscardDialogOpen(false)}
                      onDiscard={handleDiscardEdits}
                    />
                  ) : null}
                </StandardFormShell>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <HeroBlurredBackground fullPage />
      <SaveTheDateHero scrollTargetId="rsvp-form" />
      <div className="relative bg-black/80 backdrop-blur-lg">
        {rsvpFormSection}
        <InvitationSectionDivider />
        <div id="playlist" className="px-4 py-14 sm:px-8 sm:py-16">
          <div className="mx-auto w-full max-w-88 sm:max-w-[24rem] lg:max-w-[min(100%,52rem)] xl:max-w-232">
            <SpotifySongRequestPicker inviteId={inviteDetails.id} />
          </div>
        </div>
        <InvitationSectionDivider />
        <LandingGalleryAndEventDetails
          embedded
          showEventDetails={false}
          className="px-4 pt-14 pb-14 sm:px-8 sm:pt-16 sm:pb-16"
          onGalleryTileClick={(index) => {
            const id = ENGAGEMENT_GALLERY_ITEMS[index]?.id;
            navigate({
              to: '/invitation/$inviteID',
              params: { inviteID },
              search: { image: id },
              resetScroll: false,
            });
          }}
        />
      </div>
      <Lightbox
        open={lightboxOpen}
        images={ENGAGEMENT_GALLERY_ITEMS}
        activeIndex={lightboxOpen ? activeIndex : 0}
        onClose={closeLightbox}
        onNavigate={goToImage}
      />
    </>
  );
}
