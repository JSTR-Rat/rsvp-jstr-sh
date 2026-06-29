import { sfFontSans } from '@/forms/standard-form/shared-classes';
import { tw } from '@/lib/tw-merge';
import { Button, type ButtonProps } from '@headlessui/react';
import clsx from 'clsx';
import type { FC } from 'react';

export const ButtonDangerClassName = clsx(
  'inline-flex shrink-0 items-center justify-center rounded-md border border-rose-500/30 bg-rose-950/22 px-3.5 py-2',
  'text-[0.8125rem] font-medium text-rose-100/93 transition-[border-color,background-color]',
  'hover:border-rose-400/40 hover:bg-rose-950/35',
  'focus-visible:ring-[3px] focus-visible:ring-rose-400/30 focus-visible:outline-none',
  'active:scale-95',
  'cursor-pointer select-none disabled:opacity-60',
);

export const ButtonDanger: FC<ButtonProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <Button
      className={tw(ButtonDangerClassName, className)}
      style={{ fontFamily: sfFontSans }}
      {...props}
    >
      {children}
    </Button>
  );
};
