import { ButtonPrimaryClassName } from '@/components/button-primary';
import { invite } from '@/db/schema';
import { StandardFormPanel } from '@/forms/standard-form';
import { sfFontSans, sfFontSerif } from '@/forms/standard-form/shared-classes';
import { adminListInvitesFN } from '@/utils/invite.functions';
import { createFileRoute, Link } from '@tanstack/react-router';
import clsx from 'clsx';

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

export const Route = createFileRoute('/_authed/dashboard/')({
  staticData: {
    title: 'Dashboard',
  },
  component: RouteComponent,
  loader: async () => {
    const invites = await adminListInvitesFN();
    return { invites };
  },
});

function RouteComponent() {
  const { invites } = Route.useLoaderData();

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
              Guests and RSVP status. Share each person&apos;s link from your own
              email when you&apos;re ready.
            </p>
          </div>
          <Link
            to="/dashboard/invites/new"
            className={clsx(ButtonPrimaryClassName, 'shrink-0 no-underline')}
            style={{ fontFamily: sfFontSans }}
          >
            Create invite
          </Link>
        </div>
      </StandardFormPanel>

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
                <tr className="border-b border-white/12 bg-white/[0.04]">
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
                    className="border-b border-white/[0.06] last:border-b-0"
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
                      className="whitespace-nowrap px-4 py-3 text-white/70"
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
    </div>
  );
}
