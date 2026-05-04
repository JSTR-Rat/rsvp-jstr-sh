import { ButtonPrimaryClassName } from '@/components/button-primary';
import {
  StandardFormField,
  StandardFormShell,
  StandardServerError,
  StandardSubmitButton,
  StandardFormPanel,
} from '@/forms/standard-form';
import { sfFontSans, sfFontSerif } from '@/forms/standard-form/shared-classes';
import {
  adminGetInviteFN,
  adminUpdateInviteFN,
} from '@/utils/invite.functions';
import { useForm } from '@tanstack/react-form';
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
  useRouter,
} from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { z } from 'zod';
import clsx from 'clsx';

const editInviteFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name is too long'),
  email: z.email('Please enter a valid email address'),
});

type EditInviteValues = z.infer<typeof editInviteFormSchema>;

export const Route = createFileRoute('/_authed/dashboard/invites/$inviteID/edit')({
  staticData: {
    title: 'Edit invite',
  },
  loader: async ({ params }) => {
    const invite = await adminGetInviteFN({ data: { id: params.inviteID } });
    if (invite === null) {
      throw redirect({ to: '/dashboard' });
    }
    return { invite };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { invite } = Route.useLoaderData();
  const navigate = useNavigate();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const initialValues = useMemo(
    (): EditInviteValues => ({
      name: invite.name,
      email: invite.email,
    }),
    [invite.email, invite.name],
  );

  const form = useForm({
    defaultValues: initialValues,
    validators: {
      onChange: editInviteFormSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      try {
        const parsed = editInviteFormSchema.safeParse(value);
        if (!parsed.success) return;

        await adminUpdateInviteFN({
          data: { id: invite.id, ...parsed.data },
        });
        await router.invalidate();
        await navigate({
          to: '/dashboard/invites/$inviteID',
          params: { inviteID: invite.id },
        });
      } catch (err: unknown) {
        console.error('Update invite error:', err);
        setServerError(
          err instanceof Error && err.message === 'Invite not found'
            ? 'That invite no longer exists.'
            : 'Something went wrong saving changes. Please try again.',
        );
      }
    },
  });

  return (
    <div key={invite.id} className="mx-auto w-full max-w-lg space-y-6">
      <StandardFormPanel>
        <div className="space-y-2 text-left">
          <h2
            className="text-[1.25rem] font-medium tracking-tight text-white sm:text-[1.375rem]"
            style={{ fontFamily: sfFontSerif }}
          >
            Edit invite
          </h2>
          <p
            className="text-[0.9375rem] leading-relaxed text-white/65"
            style={{ fontFamily: sfFontSans }}
          >
            Update the guest&apos;s name or email. Their RSVP link stays the same.
          </p>
          <p
            className="text-[0.8125rem] leading-relaxed text-white/45"
            style={{ fontFamily: sfFontSans }}
          >
            <Link
              to="/invitation/$inviteID"
              params={{ inviteID: invite.id }}
              className="font-medium text-sky-300/95 underline decoration-sky-400/35 underline-offset-[0.18em] hover:text-sky-200"
            >
              Preview RSVP page
            </Link>
          </p>
        </div>
      </StandardFormPanel>

      <StandardFormShell
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <StandardServerError error={serverError} />

        <form.Field name="name">
          {(field) => (
            <StandardFormField
              field={field}
              label="Guest name"
              type="text"
              placeholder="e.g. Alex Kim"
              autoComplete="name"
            />
          )}
        </form.Field>

        <form.Field name="email">
          {(field) => (
            <StandardFormField
              field={field}
              label="Email"
              type="email"
              placeholder="guest@example.com"
              autoComplete="email"
            />
          )}
        </form.Field>

        <form.Subscribe
          selector={(state) => ({
            canSubmit: state.canSubmit,
            isSubmitting: state.isSubmitting,
            isDirty: state.isDirty,
          })}
        >
          {({ canSubmit, isSubmitting, isDirty }) => (
            <StandardSubmitButton
              canSubmit={canSubmit && isDirty}
              isSubmitting={isSubmitting}
              loadingText="Saving…"
            >
              Save changes
            </StandardSubmitButton>
          )}
        </form.Subscribe>

        <div className="text-center">
          <Link
            to="/dashboard/invites/$inviteID"
            params={{ inviteID: invite.id }}
            className={clsx(
              ButtonPrimaryClassName,
              'inline-flex text-[0.8125rem] no-underline',
            )}
            style={{ fontFamily: sfFontSans }}
          >
            Cancel
          </Link>
        </div>
      </StandardFormShell>
    </div>
  );
}
