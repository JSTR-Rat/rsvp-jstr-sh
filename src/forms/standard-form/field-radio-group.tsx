import type { AnyFieldApi } from '@tanstack/react-form';
import { Radio, RadioGroup } from '@headlessui/react';
import { StandardFieldError } from './field-error';
import { clsx } from 'clsx';
import { sfFontSans, sfLabel } from './shared-classes';

interface FormFieldRadioGroupProps {
  field: AnyFieldApi;
  label: string;
  options: { label: string; value: string }[];
}

function radioOptionClass(state: {
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

/**
 * Segmented radios — restrained contrast consistent with landing glass UI.
 */
export function StandardFormFieldRadioGroup({
  field,
  label,
  options,
}: FormFieldRadioGroupProps) {
  const labelId = `radio-label-${field.name}`;

  return (
    <div className="space-y-2">
      <p
        id={labelId}
        className={clsx(sfLabel, 'm-0')}
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
        className={clsx(
          'flex divide-x divide-white/12 overflow-hidden rounded-full border border-white/16',
          'bg-black/35 backdrop-blur-sm',
        )}
        aria-labelledby={labelId}
      >
        {options.map((option) => (
          <Radio
            key={option.value}
            value={option.value}
            className={radioOptionClass}
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
