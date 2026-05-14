import type { AnyFieldApi } from '@tanstack/react-form';
import { Radio, RadioGroup } from '@headlessui/react';
import { StandardFieldError } from './field-error';
import { clsx } from 'clsx';
import { sfFontSans, sfLabel } from './shared-classes';

interface FormFieldRadioGroupProps {
  field: AnyFieldApi;
  label: string;
  options: { label: string; value: string }[];
  /** `segmented`: pill row (short labels). `stacked`: full-width cards for longer copy. */
  variant?: 'segmented' | 'stacked';
}

function segmentedRadioOptionClass(state: {
  checked: boolean;
  focus: boolean;
  hover: boolean;
  disabled: boolean;
}) {
  return clsx(
    'grow px-3 py-2 text-center transition-[background-color,color,box-shadow] sm:px-4',
    'text-[0.8125rem] font-medium tracking-tight outline-none focus:outline-none',
    state.checked
      ? 'bg-white/88 text-slate-900 shadow-sm shadow-black/35'
      : 'text-white/65 hover:bg-white/5 hover:text-white/82',
    state.checked && state.hover ? 'bg-white text-slate-900' : null,
    state.focus
      ? 'ring-2 ring-white/42 ring-inset'
      : state.checked
        ? 'ring-[1px] ring-white/18 ring-inset'
        : null,
    state.checked && state.focus ? 'ring-slate-600/44' : null,
    state.disabled ? 'pointer-events-none opacity-35' : 'cursor-pointer',
  );
}

function stackedRadioOptionClass(state: {
  checked: boolean;
  focus: boolean;
  hover: boolean;
  disabled: boolean;
}) {
  return clsx(
    'w-full rounded-lg border px-3 py-2.5 text-left transition-[background-color,color,box-shadow,border-color]',
    'text-[0.8125rem] leading-snug font-medium tracking-tight outline-none focus:outline-none sm:px-3.5 sm:py-3',
    state.checked
      ? 'border-white/28 bg-white/88 text-slate-900 shadow-sm shadow-black/25'
      : 'border-white/14 bg-black/28 text-white/72 hover:border-white/22 hover:bg-black/38 hover:text-white/88',
    state.checked && state.hover
      ? 'border-white/35 bg-white text-slate-900'
      : null,
    state.focus
      ? 'ring-2 ring-white/42 ring-offset-2 ring-offset-transparent'
      : state.checked
        ? 'ring-1 ring-white/14 ring-inset'
        : null,
    state.checked && state.focus ? 'ring-slate-600/44' : null,
    state.disabled ? 'pointer-events-none opacity-35' : 'cursor-pointer',
  );
}

/**
 * Segmented radios — restrained contrast consistent with landing glass UI.
 */
export function StandardFormFieldRadioGroup({
  field,
  label,
  options,
  variant = 'segmented',
}: FormFieldRadioGroupProps) {
  const labelId = `radio-label-${field.name}`;
  const isStacked = variant === 'stacked';

  return (
    <div className="space-y-3">
      <p
        id={labelId}
        className={clsx(sfLabel, 'mb-1')}
        style={{ fontFamily: sfFontSans }}
      >
        {label}
      </p>
      <RadioGroup
        value={field.state.value}
        onChange={(value) => {
          // Headless UI may emit onChange when syncing the controlled value; TanStack
          // treats every handleChange as user input (isDirty / isTouched). Ignore no-ops.
          if (value === field.state.value) return;
          field.handleChange(value);
        }}
        onBlur={field.handleBlur}
        className={
          isStacked
            ? 'flex flex-col gap-2'
            : clsx(
                'flex divide-x divide-white/12 overflow-hidden rounded-full border border-white/16',
                'bg-black/35 backdrop-blur-sm',
              )
        }
        aria-labelledby={labelId}
      >
        {options.map((option) => (
          <Radio
            key={option.value}
            value={option.value}
            className={
              isStacked ? stackedRadioOptionClass : segmentedRadioOptionClass
            }
            style={{ fontFamily: sfFontSans }}
          >
            <span className="pointer-events-none select-none">
              {option.label}
            </span>
          </Radio>
        ))}
      </RadioGroup>
      <StandardFieldError field={field} />
    </div>
  );
}
