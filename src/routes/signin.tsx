import { authClient } from '@/lib/auth-client';
import { useForm } from '@tanstack/react-form';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import { z } from 'zod';
import {
  StandardFormLayout,
  StandardFormShell,
  StandardFormField,
  StandardServerError,
  StandardSubmitButton,
  StandardFormFieldTurnstile,
} from '@/forms/standard-form';
import { getSessionData } from '@/utils/auth.functions';
import type { TurnstileInstance } from '@marsidev/react-turnstile';

// Zod schema for signin validation
const signinSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(100, 'Password is too long'),
  turnstile: z.string().min(1, 'Turnstile is required'),
});

type SigninFormValues = z.infer<typeof signinSchema>;

// Route definition with server-side auth check
export const Route = createFileRoute('/signin')({
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
  component: SignInPage,
  beforeLoad: async ({ search }) => {
    const session = await getSessionData();
    if (session?.user) {
      throw redirect({ to: search.redirect || '/dashboard' });
    }
  },
});

function SignInPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [serverError, setServerError] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      turnstile: '',
    } as SigninFormValues,
    validators: {
      onChange: signinSchema,
    },
    onSubmit: async ({ value }) => {
      if (!turnstileRef.current) {
        setServerError('Turnstile is required');
        return;
      }

      try {
        setServerError(null);

        // Sign in using better-auth
        const { error } = await authClient.signIn.email({
          email: value.email,
          password: value.password,
          fetchOptions: {
            headers: {
              'x-captcha-response': value.turnstile,
            },
          },
        });

        if (error) {
          setServerError(
            error.message ||
              'Failed to sign in. Please check your credentials.',
          );
          turnstileRef.current.reset();
          return;
        }

        const redirectTo = search.redirect || '/dashboard';
        navigate({ to: redirectTo });
      } catch (err) {
        console.error('Sign-in error:', err);
        setServerError('An unexpected error occurred. Please try again later.');
      }
    },
  });

  return (
    <StandardFormLayout
      title="Admin sign-in"
      subtitle="Access to the RSVP dashboard is restricted."
    >
      <StandardFormShell
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <StandardServerError error={serverError} />

        {/* Email Field */}
        <form.Field name="email">
          {(field) => (
            <StandardFormField
              field={field}
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
            />
          )}
        </form.Field>

        {/* Password Field */}
        <form.Field name="password">
          {(field) => (
            <StandardFormField
              field={field}
              label="Password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          )}
        </form.Field>

        <form.Field name="turnstile">
          {(field) => (
            <StandardFormFieldTurnstile
              ref={turnstileRef}
              field={field}
              action="signin"
            />
          )}
        </form.Field>

        {/* Submit Button */}
        <form.Subscribe
          selector={(state) => ({
            canSubmit: state.canSubmit,
            isSubmitting: state.isSubmitting,
            isTouched: state.isTouched,
          })}
        >
          {({ canSubmit, isSubmitting, isTouched }) => (
            <StandardSubmitButton
              canSubmit={canSubmit && isTouched}
              isSubmitting={isSubmitting}
              loadingText="Signing in..."
            >
              Sign in
            </StandardSubmitButton>
          )}
        </form.Subscribe>
      </StandardFormShell>
    </StandardFormLayout>
  );
}
