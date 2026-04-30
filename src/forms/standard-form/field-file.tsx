import type { ChangeEvent } from 'react';
import type { AnyFieldApi } from '@tanstack/react-form';
import clsx from 'clsx';
import { StandardFieldError } from './field-error';
import { sfControlText, sfFontSans, sfLabel } from './shared-classes';

interface FormFieldFileProps {
  field: AnyFieldApi;
  label: string;
  accept?: string;
  multiple?: boolean;
  placeholder?: string;
}

/**
 * File field — opaque trigger matches text inputs; preserves native picker.
 */
export function StandardFormFieldFile({
  field,
  label,
  accept,
  multiple,
  placeholder = 'Choose a file',
}: FormFieldFileProps) {
  const hasErrors =
    field.state.meta.errors && field.state.meta.errors.length > 0;
  const value = field.state.value as File | FileList | null | undefined;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      field.handleChange(null);
      return;
    }
    field.handleChange(multiple ? files : files[0]);
  };

  const displayValue = value
    ? multiple && value instanceof FileList
      ? `${value.length} file(s) selected`
      : value instanceof File
        ? value.name
        : ''
    : placeholder;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={field.name}
        className={sfLabel}
        style={{ fontFamily: sfFontSans }}
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={field.name}
          name={field.name}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          onBlur={field.handleBlur}
          className="peer absolute inset-0 z-10 w-full cursor-pointer opacity-0"
          aria-invalid={hasErrors}
          aria-describedby={hasErrors ? `${field.name}-error` : undefined}
        />
        <div
          className={clsx(
            sfControlText(hasErrors ?? false),
            'peer-focus:border-white/[0.38]',
            'peer-focus:ring-[3px] peer-focus:ring-white/18',
            'flex cursor-pointer items-center justify-between',
            !value ? 'text-white/38' : null,
          )}
          style={{ fontFamily: sfFontSans }}
        >
          <span className="min-w-0 truncate">{displayValue}</span>
          <span className="ml-2 shrink-0 text-[0.75rem] font-medium uppercase tracking-wide text-white/45">
            Browse
          </span>
        </div>
      </div>
      <StandardFieldError field={field} />
    </div>
  );
}
