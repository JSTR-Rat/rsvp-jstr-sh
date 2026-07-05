import {
  ButtonPrimary,
  ButtonPrimaryClassName,
} from '@/components/button-primary';
import { invite } from '@/db/schema';
import { StandardFormPanel, StandardServerError } from '@/forms/standard-form';
import {
  sfFontSans,
  sfFontSerif,
  sfShell,
} from '@/forms/standard-form/shared-classes';
import {
  adminListInvitesFN,
  adminSendUnsentInviteEmailsFN,
} from '@/utils/invite.functions';
import { adminListReceivedEmailsFN } from '@/utils/received-email.functions';
import {
  Button,
  Description,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
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

function SendUnsentInvitesDialog({
  open,
  unsentCount,
  sendBusy,
  onClose,
  onConfirm,
}: {
  open: boolean;
  unsentCount: number;
  sendBusy: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={sendBusy ? () => {} : onClose}
      className="relative z-50"
    >
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
            Send invitation emails?
          </DialogTitle>
          <Description className="text-center text-[0.9375rem] leading-relaxed text-white/72">
            Send invitation emails to {unsentCount} guest
            {unsentCount === 1 ? '' : 's'} who haven&apos;t received one yet?
          </Description>
          <div className="flex gap-3">
            <Button
              type="button"
              disabled={sendBusy}
              className={clsx(
                'inline-flex flex-1 shrink-0 items-center justify-center rounded-md border px-3.5 py-2',
                'text-[0.8125rem] font-medium transition-[border-color,background-color]',
                'cursor-pointer border-white/25 bg-white/5 text-white/85 select-none',
                'hover:border-white/40 hover:bg-white/10',
                'focus-visible:ring-[3px] focus-visible:ring-white/25 focus-visible:outline-none',
                'active:scale-95 disabled:cursor-not-allowed disabled:opacity-60',
              )}
              style={{ fontFamily: sfFontSans }}
              onClick={onClose}
            >
              Cancel
            </Button>
            <ButtonPrimary
              type="button"
              className="flex-1"
              disabled={sendBusy}
              onClick={onConfirm}
            >
              {sendBusy ? 'Sending…' : 'Send emails'}
            </ButtonPrimary>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

export const Route = createFileRoute('/_authed/dashboard/')({
  staticData: {
    title: 'Dashboard',
  },
  component: RouteComponent,
  loader: async () => {
    const [inviteData, receivedEmails] = await Promise.all([
      adminListInvitesFN(),
      adminListReceivedEmailsFN(),
    ]);
    return {
      invites: inviteData.invites,
      emailDeliveryConfigured: inviteData.emailDeliveryConfigured,
      receivedEmails,
    };
  },
});

function RouteComponent() {
  const { invites, receivedEmails, emailDeliveryConfigured } =
    Route.useLoaderData();
  const router = useRouter();
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [sendBusy, setSendBusy] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendFailures, setSendFailures] = useState<
    { id: string; name: string; error: string }[]
  >([]);

  const unsentCount = invites.filter((row) => row.status === 'not-sent').length;

  async function handleSendUnsentInvites() {
    setSendError(null);
    setSendSuccess(null);
    setSendFailures([]);
    setSendBusy(true);
    try {
      const result = await adminSendUnsentInviteEmailsFN();
      await router.invalidate();
      setSendDialogOpen(false);

      const total = result.sent + result.failed.length;
      if (result.failed.length === 0) {
        setSendSuccess(
          `Sent invitation emails to ${result.sent} guest${result.sent === 1 ? '' : 's'}.`,
        );
      } else if (result.sent > 0) {
        setSendSuccess(
          `Sent ${result.sent} of ${total}. ${result.failed.length} failed.`,
        );
        setSendFailures(result.failed);
      } else {
        setSendError(
          `Could not send invitation emails to ${result.failed.length} guest${result.failed.length === 1 ? '' : 's'}.`,
        );
        setSendFailures(result.failed);
      }
    } catch (err: unknown) {
      console.error('Send unsent invite emails:', err);
      setSendError(
        err instanceof Error ? err.message : 'Could not send the emails.',
      );
      setSendDialogOpen(false);
    } finally {
      setSendBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <StandardFormPanel>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2 text-left">
            <h2
              className="text-[1.25rem] font-medium tracking-tight text-white sm:text-[1.375rem]"
              style={{ fontFamily: sfFontSerif }}
            >
              Invites
            </h2>
            <p
              className="text-[0.9375rem] leading-relaxed text-white/65"
              style={{ fontFamily: sfFontSans }}
            >
              Guests and RSVP status. Send unsent invitation emails from here,
              or share each person&apos;s link yourself.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            <div className="flex flex-wrap gap-2">
              <ButtonPrimary
                type="button"
                disabled={
                  !emailDeliveryConfigured || unsentCount === 0 || sendBusy
                }
                onClick={() => setSendDialogOpen(true)}
              >
                {sendBusy ? 'Sending…' : 'Send unsent invites'}
              </ButtonPrimary>
              <Link
                to="/dashboard/invites/new"
                className={clsx(ButtonPrimaryClassName, 'no-underline')}
                style={{ fontFamily: sfFontSans }}
              >
                Create invite
              </Link>
            </div>
            {!emailDeliveryConfigured ? (
              <p
                className="max-w-sm text-right text-[0.8125rem] leading-relaxed text-amber-200/85"
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
          </div>
        </div>

        <StandardServerError error={sendError} />
        {sendSuccess ? (
          <p
            className="text-[0.9375rem] leading-relaxed text-emerald-200/90"
            style={{ fontFamily: sfFontSans }}
            role="status"
          >
            {sendSuccess}
          </p>
        ) : null}
        {sendFailures.length > 0 ? (
          <ul
            className="list-inside list-disc space-y-1 text-[0.8125rem] leading-relaxed text-red-200/90"
            style={{ fontFamily: sfFontSans }}
          >
            {sendFailures.map((failure) => (
              <li key={failure.id}>
                {failure.name}: {failure.error}
              </li>
            ))}
          </ul>
        ) : null}
      </StandardFormPanel>

      <SendUnsentInvitesDialog
        open={sendDialogOpen}
        unsentCount={unsentCount}
        sendBusy={sendBusy}
        onClose={() => setSendDialogOpen(false)}
        onConfirm={() => void handleSendUnsentInvites()}
      />

      <div className="overflow-hidden rounded-lg border border-white/12 bg-black/35 backdrop-blur-sm">
        {invites.length === 0 ? (
          <p
            className="px-4 py-10 text-center text-[0.9375rem] text-white/55"
            style={{ fontFamily: sfFontSans }}
          >
            No invites yet.{' '}
            <Link
              to="/dashboard/invites/new"
              className="font-medium text-white/85 underline decoration-white/25 underline-offset-[0.2em] hover:decoration-white/50"
            >
              Create the first one
            </Link>
            .
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-[0.8125rem]">
              <thead>
                <tr className="border-b border-white/12 bg-white/4">
                  <th
                    className="px-4 py-3 font-medium tracking-wide text-white/72"
                    style={{ fontFamily: sfFontSans }}
                  >
                    Name
                  </th>
                  <th
                    className="px-4 py-3 font-medium tracking-wide text-white/72"
                    style={{ fontFamily: sfFontSans }}
                  >
                    Email
                  </th>
                  <th
                    className="px-4 py-3 font-medium tracking-wide text-white/72"
                    style={{ fontFamily: sfFontSans }}
                  >
                    Status
                  </th>
                  <th
                    className="px-4 py-3 font-medium tracking-wide text-white/72"
                    style={{ fontFamily: sfFontSans }}
                  >
                    RSVP link
                  </th>
                  <th
                    className="px-4 py-3 font-medium tracking-wide text-white/72"
                    style={{ fontFamily: sfFontSans }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {invites.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-white/6 last:border-b-0"
                  >
                    <td
                      className="max-w-[180px] truncate px-4 py-3 font-medium text-white/92"
                      style={{ fontFamily: sfFontSerif }}
                      title={row.name}
                    >
                      <Link
                        to="/dashboard/invites/$inviteID"
                        params={{ inviteID: row.id }}
                        className="text-white/92 underline decoration-white/25 underline-offset-[0.18em] hover:text-white hover:decoration-white/45"
                      >
                        {row.name}
                      </Link>
                    </td>
                    <td
                      className="max-w-[220px] truncate px-4 py-3 text-white/75"
                      style={{ fontFamily: sfFontSans }}
                      title={row.email}
                    >
                      {row.email}
                    </td>
                    <td
                      className="px-4 py-3 whitespace-nowrap text-white/70"
                      style={{ fontFamily: sfFontSans }}
                    >
                      {inviteStatusLabel(row.status)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to="/invitation/$inviteID"
                        params={{ inviteID: row.id }}
                        className="font-medium text-sky-300/95 underline decoration-sky-400/35 underline-offset-[0.18em] hover:text-sky-200 hover:decoration-sky-300/55"
                        style={{ fontFamily: sfFontSans }}
                      >
                        Open
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to="/dashboard/invites/$inviteID/edit"
                        params={{ inviteID: row.id }}
                        className="font-medium text-white/85 underline decoration-white/25 underline-offset-[0.18em] hover:decoration-white/45"
                        style={{ fontFamily: sfFontSans }}
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <StandardFormPanel>
        <div className="space-y-2 text-left">
          <h2
            className="text-[1.25rem] font-medium tracking-tight text-white sm:text-[1.375rem]"
            style={{ fontFamily: sfFontSerif }}
          >
            Received emails
          </h2>
          <p
            className="text-[0.9375rem] leading-relaxed text-white/65"
            style={{ fontFamily: sfFontSans }}
          >
            Replies and messages sent to your wedding inbox.
          </p>
        </div>
      </StandardFormPanel>

      <div className="overflow-hidden rounded-lg border border-white/12 bg-black/35 backdrop-blur-sm">
        {receivedEmails.length === 0 ? (
          <p
            className="px-4 py-10 text-center text-[0.9375rem] text-white/55"
            style={{ fontFamily: sfFontSans }}
          >
            No received emails yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-[0.8125rem]">
              <thead>
                <tr className="border-b border-white/12 bg-white/4">
                  <th
                    className="px-4 py-3 font-medium tracking-wide text-white/72"
                    style={{ fontFamily: sfFontSans }}
                  >
                    From
                  </th>
                  <th
                    className="px-4 py-3 font-medium tracking-wide text-white/72"
                    style={{ fontFamily: sfFontSans }}
                  >
                    Subject
                  </th>
                  <th
                    className="px-4 py-3 font-medium tracking-wide text-white/72"
                    style={{ fontFamily: sfFontSans }}
                  >
                    Received
                  </th>
                  <th
                    className="px-4 py-3 font-medium tracking-wide text-white/72"
                    style={{ fontFamily: sfFontSans }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {receivedEmails.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-white/6 last:border-b-0"
                  >
                    <td
                      className="max-w-[220px] truncate px-4 py-3 text-white/75"
                      style={{ fontFamily: sfFontSans }}
                      title={row.fromAddress}
                    >
                      {row.fromAddress}
                    </td>
                    <td
                      className="max-w-[280px] truncate px-4 py-3 font-medium text-white/92"
                      style={{ fontFamily: sfFontSerif }}
                      title={row.subject}
                    >
                      <Link
                        to="/dashboard/received-emails/$emailID"
                        params={{ emailID: row.id }}
                        className="text-white/92 underline decoration-white/25 underline-offset-[0.18em] hover:text-white hover:decoration-white/45"
                      >
                        {row.subject}
                      </Link>
                    </td>
                    <td
                      className="px-4 py-3 whitespace-nowrap text-white/70"
                      style={{ fontFamily: sfFontSans }}
                    >
                      {formatTs(row.receivedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to="/dashboard/received-emails/$emailID"
                        params={{ emailID: row.id }}
                        className="font-medium text-white/85 underline decoration-white/25 underline-offset-[0.18em] hover:decoration-white/45"
                        style={{ fontFamily: sfFontSans }}
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
