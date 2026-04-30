import type { ReactNode } from 'react';
import { Button } from '@headlessui/react';
import { LoaderCircleIcon } from 'lucide-react';
import { sfFontSans, sfSubmitButton } from './shared-classes';

interface StandardSubmitButtonProps {
  isSubmitting: boolean;
  canSubmit: boolean;
  loadingText: string;
  children: ReactNode;
}

/**
 * Submit button — flat glass fill, pronounced focus ring (admin UX).
 */
export function StandardSubmitButton({
  isSubmitting,
  canSubmit,
  loadingText,
  children,
}: StandardSubmitButtonProps) {
  const disabled = !canSubmit || isSubmitting;
  return (
    <Button
      type="submit"
      disabled={disabled}
      className={sfSubmitButton(disabled)}
      style={{ fontFamily: sfFontSans }}
    >
      {isSubmitting ? (
        <span className="flex items-center justify-center gap-3">
          <LoaderCircleIcon
            className="size-[1.15rem] shrink-0 animate-spin text-white/90"
            aria-hidden
          />
          {loadingText}
        </span>
      ) : (
        children
      )}
    </Button>
  );
}
