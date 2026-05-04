import { ButtonPrimaryClassName } from '@/components/button-primary';
import {
  StandardFormField,
  StandardFormShell,
  StandardServerError,
  StandardSubmitButton,
  StandardFormPanel,
} from '@/forms/standard-form';
import { sfFontSans, sfFontSerif } from '@/forms/standard-form/shared-classes';
import { adminCreateInviteFN } from '@/utils/invite.functions';
import { useForm } from '@tanstack/react-form';
import { createFileRoute, Link, useNavigate, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { z } from 'zod';
import clsx from 'clsx';

const createInviteSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name is too long'),
  email: z.email('Please enter a valid email address'),
});

type CreateInviteValues = z.infer<typeof createInviteSchema>;

export const Route = createFileRoute('/_authed/dashboard/invites/new')({
  staticData: {
    title: 'Create invite',
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
    } as CreateInviteValues,
    validators: {
      onChange: createInviteSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      try {
        const parsed = createInviteSchema.safeParse(value);
        if (!parsed.success) return;

        await adminCreateInviteFN({ data: parsed.data });
        await router.invalidate();
        await navigate({ to: '/dashboard' });
      } catch (err: unknown) {
        console.error('Create invite error:', err);
        setServerError(
          'Something went wrong creating the invite. Please try again.',
        );
      }
    },
  });

  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <StandardFormPanel>
        <div className="space-y-2 text-left">
          <h2
            className="text-[1.25rem] font-medium tracking-tight text-white sm:text-[1.375rem]"
            style={{ fontFamily: sfFontSerif }}
          >
            Create invite
          </h2>
          <p
            className="text-[0.9375rem] leading-relaxed text-white/65"
            style={{ fontFamily: sfFontSans }}
          >
            Add a guest name and email. They&apos;ll use their personal RSVP link
            when you send it.
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
              loadingText="Creating…"
            >
              Create invite
            </StandardSubmitButton>
          )}
        </form.Subscribe>

        <div className="text-center">
          <Link
            to="/dashboard"
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
