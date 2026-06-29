import { WeddingInviteStationeryHeroEmail } from '@/emails/wedding-invite-email-stationery-hero';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dev-only/email-preview/wedding-invite')(
  {
    component: RouteComponent,
    head: () => ({
      meta: [{ title: 'Dev — Wedding invite email preview' }],
    }),
  },
);

function RouteComponent() {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="min-h-svh p-6">
      <p className="mb-4 font-sans text-sm text-amber-200/90">
        Dev-only preview — same template as Resend (`sendInvitationEmail`). Not
        available in production builds.
      </p>
      <WeddingInviteStationeryHeroEmail
        guestName="Alex Example"
        inviteLink={
          origin
            ? `${origin}/invitation/dev-preview-token`
            : '/invitation/dev-preview-token'
        }
      />
    </div>
  );
}
