import { authClient } from '@/lib/auth-client';
import { useForm } from '@tanstack/react-form';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import { z } from 'zod';
import {
  StandardFormLayout,
  StandardFormShell,
  StandardFormField,
  StandardFormFieldLink,
  StandardServerError,
  StandardSubmitButton,
  StandardFormFieldTurnstile,
} from '@/forms/standard-form';
import { getSessionData } from '@/utils/auth.functions';
import type { TurnstileInstance } from '@marsidev/react-turnstile';

const signupSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  email: z.email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long'),
  turnstile: z.string().min(1, 'Turnstile is required'),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export const Route = createFileRoute('/signup')({
  component: SignupPage,
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
  beforeLoad: async ({ search }) => {
    const session = await getSessionData();
    if (session?.user) {
      throw redirect({ to: search.redirect || '/dashboard' });
    }
  },
});

function SignupPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const search = Route.useSearch();
  const turnstileRef = useRef<TurnstileInstance>(null);

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      turnstile: '',
    } as SignupFormValues,
    validators: {
      onChange: signupSchema,
    },
    onSubmit: async ({ value }) => {
      if (!turnstileRef.current) {
        setServerError('Turnstile is required');
        return;
      }

      try {
        setServerError(null);

        const { error } = await authClient.signUp.email({
          name: value.name,
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
            error.message || 'Failed to create account. Please try again.',
          );
          turnstileRef.current.reset();
          return;
        }

        navigate({ to: search.redirect || '/dashboard' });
      } catch (err) {
        console.error('Signup error:', err);
        setServerError('An unexpected error occurred. Please try again later.');
      }
    },
  });

  return (
    <StandardFormLayout
      title="Create account"
      subtitle="Register to access the RSVP dashboard."
    >
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
              label="Name"
              type="text"
              placeholder="Your name"
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
              placeholder="you@example.com"
              autoComplete="email"
            />
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <StandardFormField
              field={field}
              label="Password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          )}
        </form.Field>

        <form.Field name="turnstile">
          {(field) => (
            <StandardFormFieldTurnstile
              ref={turnstileRef}
              field={field}
              action="signup"
            />
          )}
        </form.Field>

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
              loadingText="Creating account..."
            >
              Sign up
            </StandardSubmitButton>
          )}
        </form.Subscribe>

        <StandardFormFieldLink
          text="Already have an account?"
          to="/signin"
          search={{ redirect: search.redirect }}
        >
          Sign in
        </StandardFormFieldLink>
      </StandardFormShell>
    </StandardFormLayout>
  );
}
