import { Link, type LinkProps } from '@tanstack/react-router';
import clsx from 'clsx';
import { sfFontSans } from './shared-classes';

type FormFieldLinkProps = LinkProps & {
  text: string;
  className?: string;
};

export function StandardFormFieldLink({
  text,
  className,
  ...props
}: FormFieldLinkProps) {
  return (
    <div
      className="text-center text-[0.8125rem] leading-snug text-white/48"
      style={{ fontFamily: sfFontSans }}
    >
      {text}{' '}
      <Link
        className={clsx(
          'font-medium text-slate-200/95 underline decoration-white/18 underline-offset-[0.24em] transition-colors',
          'hover:text-white hover:decoration-white/45',
          'focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45',
          className,
        )}
        {...props}
      />
    </div>
  );
}
