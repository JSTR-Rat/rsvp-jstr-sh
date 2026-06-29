import { WeddingInviteStationeryEmail } from '@/emails/wedding-invite-email-stationery';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_dev-only/email-preview/wedding-invite-stationery',
)({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: 'Dev — Wedding invite (stationery) preview' }],
  }),
});

function RouteComponent() {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="min-h-svh p-6">
      <p className="mb-4 font-sans text-sm text-amber-200/90">
        Dev-only preview — formal card layout inspired by the paper invitation
        reference; dark palette and florals match the public homepage (Cormorant
        Garamond + Jost).
      </p>
      <WeddingInviteStationeryEmail
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
