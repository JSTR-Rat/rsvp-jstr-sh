import { authClient } from '@/lib/auth-client';
import { getSessionFN } from '@/utils/auth.functions';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { LoaderCircleIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { StandardFormLayout, StandardFormPanel } from '@/forms/standard-form';
import { sfFontSans } from '@/forms/standard-form/shared-classes';

export const Route = createFileRoute('/signout')({
  component: SignOutPage,
  beforeLoad: async () => {
    const session = await getSessionFN();
    if (!session?.user) {
      throw redirect({ to: '/' });
    }
  },
});

function SignOutPage() {
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(true);
  const hasSignedOut = useRef(false);

  useEffect(() => {
    if (hasSignedOut.current) return;
    hasSignedOut.current = true;

    const performSignOut = async () => {
      try {
        await authClient.signOut();
        navigate({ to: '/' });
      } catch (error) {
        console.error('Sign-out error:', error);
        navigate({ to: '/' });
      } finally {
        setIsSigningOut(false);
      }
    };

    performSignOut();
  }, [navigate]);

  const statusStyles =
    'text-[0.9375rem] leading-relaxed font-medium text-white/68';

  return (
    <StandardFormLayout
      title="Signing out"
      subtitle="Your session will end securely. You'll be redirected to the homepage."
    >
      <StandardFormPanel>
        <div
          className="flex flex-col items-center justify-center gap-4 py-1 text-center"
          role="status"
          aria-live="polite"
        >
          {isSigningOut ? (
            <>
              <LoaderCircleIcon
                className="size-10 shrink-0 animate-spin text-white/88"
                aria-hidden
              />
              <p className={statusStyles} style={{ fontFamily: sfFontSans }}>
                Signing you out…
              </p>
            </>
          ) : (
            <p className={statusStyles} style={{ fontFamily: sfFontSans }}>
              Redirecting…
            </p>
          )}
        </div>
      </StandardFormPanel>
    </StandardFormLayout>
  );
}
