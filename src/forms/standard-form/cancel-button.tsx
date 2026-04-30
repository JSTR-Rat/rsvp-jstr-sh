import type { ReactNode } from 'react';
import { Link, type LinkProps } from '@tanstack/react-router';
import clsx from 'clsx';
import { sfFontSans } from './shared-classes';

type StandardCancelButtonProps = LinkProps & {
  isSubmitting: boolean;
  children: ReactNode;
};

/**
 * Outline cancel treatment — symmetrical with submit, less emphasis.
 */
export function StandardCancelButton({
  isSubmitting,
  children,
  ...props
}: StandardCancelButtonProps) {
  const isDisabled = isSubmitting;
  return (
    <Link
      disabled={isDisabled}
      className={clsx(
        'block w-full rounded-md border px-4 py-2.5 text-center text-[0.9375rem] font-medium tracking-tight transition-colors',
        'outline-none focus-visible:ring-[3px] focus-visible:ring-white/22',
        isDisabled
          ? 'pointer-events-none cursor-not-allowed border-white/[0.08] bg-white/[0.03] text-white/30'
          : 'border-white/[0.18] bg-transparent text-white/72 hover:border-white/[0.28] hover:bg-white/[0.06] hover:text-white',
      )}
      style={{ fontFamily: sfFontSans }}
      {...props}
    >
      {children}
    </Link>
  );
}
