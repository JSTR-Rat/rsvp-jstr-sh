import type { ReactNode } from 'react';
import {
  WeddingAdminRsvpEmail,
  WeddingInviteeRsvpEmail,
  type RsvpEmailDetails,
} from '@/emails/wedding-rsvp-email-stationery';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_dev-only/email-preview/rsvp-notifications',
)({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: 'Dev — RSVP notification email previews' }],
  }),
});

const sampleAttending: RsvpEmailDetails = {
  guestName: 'Alex Example',
  guestEmail: 'alex@example.com',
  isAttending: true,
  mealChoiceLabel:
    'Steak with crispy smashed potato & seasonal greens (gf)',
  dietaryRequirements: 'Nut allergy',
  additionalNotes: 'Happy to sit with the Smith family if possible.',
};

const sampleNotAttending: RsvpEmailDetails = {
  guestName: 'Jordan Example',
  guestEmail: 'jordan@example.com',
  isAttending: false,
  mealChoiceLabel:
    'Coq Au Vin with Swiss brown mushrooms, French shallots, bacon & tarragon served with a side of assorted sauteed beans',
  dietaryRequirements: 'Vegetarian',
  additionalNotes: null,
};

function PreviewSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-16 border-b border-white/10 pb-16 last:mb-0 last:border-b-0 last:pb-0">
      <h2 className="mb-4 font-sans text-sm font-medium tracking-wide text-amber-200/90">
        {title}
      </h2>
      {children}
    </section>
  );
}

function RouteComponent() {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const inviteLink = origin
    ? `${origin}/invitation/dev-preview-token`
    : '/invitation/dev-preview-token';
  const dashboardLink = origin
    ? `${origin}/dashboard/invites/dev-preview-token`
    : '/dashboard/invites/dev-preview-token';

  return (
    <div className="min-h-svh p-6">
      <p className="mb-8 font-sans text-sm text-amber-200/90">
        Dev-only preview — four RSVP notification variants (invitee received /
        updated, admin new / updated). Styling matches the stationery invitation
        email.
      </p>

      <PreviewSection title="Invitee — first submission (attending)">
        <WeddingInviteeRsvpEmail
          kind="received"
          inviteLink={inviteLink}
          {...sampleAttending}
        />
      </PreviewSection>

      <PreviewSection title="Invitee — updated (not attending, preserved meal on admin only)">
        <WeddingInviteeRsvpEmail
          kind="updated"
          inviteLink={inviteLink}
          {...sampleNotAttending}
        />
      </PreviewSection>

      <PreviewSection title="Admin — new RSVP">
        <WeddingAdminRsvpEmail
          kind="new"
          dashboardLink={dashboardLink}
          {...sampleAttending}
        />
      </PreviewSection>

      <PreviewSection title="Admin — RSVP updated">
        <WeddingAdminRsvpEmail
          kind="updated"
          dashboardLink={dashboardLink}
          {...sampleNotAttending}
        />
      </PreviewSection>
    </div>
  );
}
