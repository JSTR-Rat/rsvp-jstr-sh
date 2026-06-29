import { sfFontSans } from '@/forms/standard-form/shared-classes';
import { tw } from '@/lib/tw-merge';
import { Button, type ButtonProps } from '@headlessui/react';
import clsx from 'clsx';
import type { FC } from 'react';

export const ButtonPrimaryClassName = clsx(
  'inline-flex shrink-0 items-center justify-center rounded-md border border-white/20 bg-white/[0.07] px-3.5 py-2',
  'text-[0.8125rem] font-medium text-white/92 transition-[border-color,background-color]',
  'hover:border-white/30 hover:bg-white/11',
  'focus-visible:ring-[3px] focus-visible:ring-white/24 focus-visible:outline-none',
  'active:scale-95',
  'cursor-pointer select-none',
);

export const ButtonPrimary: FC<ButtonProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <Button
      className={tw(ButtonPrimaryClassName, className)}
      style={{ fontFamily: sfFontSans }}
      {...props}
    >
      {children}
    </Button>
  );
};
