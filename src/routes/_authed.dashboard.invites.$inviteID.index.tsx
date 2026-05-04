import { ButtonPrimary, ButtonPrimaryClassName } from '@/components/button-primary';
import { invite } from '@/db/schema';
import { StandardFormPanel } from '@/forms/standard-form';
import { StandardServerError } from '@/forms/standard-form';
import {
  sfFontSans,
  sfFontSerif,
  sfLabel,
} from '@/forms/standard-form/shared-classes';
import {
  adminDeleteInviteFN,
  adminGetInviteDetailFN,
  adminSendInviteEmailFN,
} from '@/utils/invite.functions';
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
  useRouter,
} from '@tanstack/react-router';
import clsx from 'clsx';
import { useState } from 'react';

type InviteRow = typeof invite.$inferSelect;

function inviteStatusLabel(status: InviteRow['status']): string {
  switch (status) {
    case 'not-sent':
      return 'Not sent';
    case 'sent':
      return 'Sent';
    case 'seen':
      return 'Seen';
    case 'attending':
      return 'Attending';
    case 'not-attending':
      return 'Not attending';
    default:
      return status;
  }
}

function formatTs(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export const Route = createFileRoute('/_authed/dashboard/invites/$inviteID/')({
  staticData: {
    title: 'Invite details',
  },
  loader: async ({ params }) => {
    const data = await adminGetInviteDetailFN({ data: { id: params.inviteID } });
    if (data.invite === null) {
      throw redirect({ to: '/dashboard' });
    }
    return {
      invite: data.invite,
      emailDeliveryConfigured: data.emailDeliveryConfigured,
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { invite: inviteRow, emailDeliveryConfigured } = Route.useLoaderData();
  const router = useRouter();
  const navigate = useNavigate();
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendBusy, setSendBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  async function handleSendEmail() {
    setSendError(null);
    setSendSuccess(false);
    setSendBusy(true);
    try {
      await adminSendInviteEmailFN({ data: { id: inviteRow.id } });
      await router.invalidate();
      setSendSuccess(true);
    } catch (err: unknown) {
      console.error('Send invite email:', err);
      setSendError(
        err instanceof Error ? err.message : 'Could not send the email.',
      );
    } finally {
      setSendBusy(false);
    }
  }

  async function handleDeleteInvite() {
    const ok = window.confirm(
      `Remove invite for "${inviteRow.name}" (${inviteRow.email})? This cannot be undone.`,
    );
    if (!ok) return;

    setDeleteError(null);
    setDeleteBusy(true);
    try {
      await adminDeleteInviteFN({ data: { id: inviteRow.id } });
      await router.invalidate();
      await navigate({ to: '/dashboard' });
    } catch (err: unknown) {
      console.error('Delete invite:', err);
      setDeleteError(
        err instanceof Error ? err.message : 'Could not delete the invite.',
      );
    } finally {
      setDeleteBusy(false);
    }
  }

  const responseSummary = (() => {
    switch (inviteRow.status) {
      case 'attending':
        return (
          <>
            <span className="text-emerald-300/95">Attending</span>
            {inviteRow.diataryRequirements ? (
              <p className="mt-2 text-[0.875rem] leading-relaxed text-white/72">
                Dietary notes: {inviteRow.diataryRequirements}
              </p>
            ) : (
              <p className="mt-2 text-[0.875rem] text-white/55">
                No dietary notes submitted.
              </p>
            )}
          </>
        );
      case 'not-attending':
        return (
          <span className="text-amber-200/95">Unable to attend</span>
        );
      default:
        return (
          <span className="text-white/62">
            No RSVP submitted yet. Invitation status:{' '}
            {inviteStatusLabel(inviteRow.status)}.
          </span>
        );
    }
  })();

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to="/dashboard"
          className="text-[0.8125rem] font-medium text-white/55 underline decoration-white/20 underline-offset-[0.18em] hover:text-white/78"
          style={{ fontFamily: sfFontSans }}
        >
          ← Dashboard
        </Link>
      </div>

      <StandardFormPanel>
        <div className="space-y-6 text-left">
          <header className="space-y-2">
            <h2
              className="text-[1.25rem] font-medium tracking-tight text-white sm:text-[1.375rem]"
              style={{ fontFamily: sfFontSerif }}
            >
              {inviteRow.name}
            </h2>
            <p
              className="text-[0.9375rem] text-white/65"
              style={{ fontFamily: sfFontSans }}
            >
              {inviteRow.email}
            </p>
          </header>

          <dl className="space-y-4 border-t border-white/12 pt-6">
            <div className="space-y-1">
              <dt className={sfLabel}>Invitation progress</dt>
              <dd
                className="text-[0.9375rem] text-white/82"
                style={{ fontFamily: sfFontSans }}
              >
                {inviteStatusLabel(inviteRow.status)}
              </dd>
            </div>

            <div className="space-y-1">
              <dt className={sfLabel}>Their response</dt>
              <dd style={{ fontFamily: sfFontSans }}>{responseSummary}</dd>
            </div>

            <div className="space-y-1">
              <dt className={sfLabel}>RSVP link</dt>
              <dd style={{ fontFamily: sfFontSans }}>
                <Link
                  to="/invitation/$inviteID"
                  params={{ inviteID: inviteRow.id }}
                  className="font-medium text-sky-300/95 underline decoration-sky-400/35 underline-offset-[0.18em] hover:text-sky-200"
                >
                  Open guest RSVP page
                </Link>
              </dd>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <dt className={sfLabel}>Created</dt>
                <dd
                  className="text-[0.875rem] text-white/72"
                  style={{ fontFamily: sfFontSans }}
                >
                  {formatTs(inviteRow.createdAt)}
                </dd>
              </div>
              <div className="space-y-1">
                <dt className={sfLabel}>Updated</dt>
                <dd
                  className="text-[0.875rem] text-white/72"
                  style={{ fontFamily: sfFontSans }}
                >
                  {formatTs(inviteRow.updatedAt)}
                </dd>
              </div>
            </div>
          </dl>

          <div className="flex flex-col gap-3 border-t border-white/12 pt-6 sm:flex-row sm:flex-wrap">
            <ButtonPrimary
              type="button"
              disabled={!emailDeliveryConfigured || sendBusy}
              onClick={() => void handleSendEmail()}
            >
              {sendBusy ? 'Sending…' : 'Send invitation email'}
            </ButtonPrimary>
            <Link
              to="/dashboard/invites/$inviteID/edit"
              params={{ inviteID: inviteRow.id }}
              className={clsx(
                ButtonPrimaryClassName,
                'inline-flex items-center justify-center text-[0.8125rem] no-underline',
              )}
              style={{ fontFamily: sfFontSans }}
            >
              Edit guest details
            </Link>
            <ButtonPrimary
              type="button"
              disabled={deleteBusy}
              className="border-rose-500/30 bg-rose-950/22 text-rose-100/93 hover:border-rose-400/40 hover:bg-rose-950/35 disabled:opacity-60"
              onClick={() => void handleDeleteInvite()}
            >
              {deleteBusy ? 'Deleting…' : 'Delete invite'}
            </ButtonPrimary>
          </div>

          <StandardServerError error={deleteError} />

          {!emailDeliveryConfigured ? (
            <p
              className="text-[0.8125rem] leading-relaxed text-amber-200/85"
              style={{ fontFamily: sfFontSans }}
              role="status"
            >
              Email sending is disabled until you set the{' '}
              <code className="rounded bg-white/10 px-1 py-0.5 text-[0.75rem]">
                RESEND_API_KEY
              </code>{' '}
              secret (e.g.{' '}
              <code className="rounded bg-white/10 px-1 py-0.5 text-[0.75rem]">
                wrangler secret put RESEND_API_KEY
              </code>
              ). Set{' '}
              <code className="rounded bg-white/10 px-1 py-0.5 text-[0.75rem]">
                RESEND_FROM_EMAIL
              </code>{' '}
              in{' '}
              <code className="rounded bg-white/10 px-1 py-0.5 text-[0.75rem]">
                wrangler.jsonc
              </code>{' '}
              to a verified sender.
            </p>
          ) : null}

          <StandardServerError error={sendError} />
          {sendSuccess ? (
            <p
              className="text-[0.8125rem] text-emerald-300/90"
              style={{ fontFamily: sfFontSans }}
              role="status"
            >
              Invitation email sent to {inviteRow.email}.
            </p>
          ) : null}
        </div>
      </StandardFormPanel>
    </div>
  );
}
