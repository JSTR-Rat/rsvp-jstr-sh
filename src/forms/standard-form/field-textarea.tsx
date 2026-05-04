import type { AnyFieldApi } from '@tanstack/react-form';
import clsx from 'clsx';
import { StandardFieldError } from './field-error';
import { sfControlText, sfFontSans, sfLabel } from './shared-classes';

interface StandardFormFieldTextareaProps {
  field: AnyFieldApi;
  label: string;
  placeholder?: string;
  autoComplete?: string;
  rows?: number;
  /** Shown below the label — optional fields, hints */
  hint?: string;
}

export function StandardFormFieldTextarea({
  field,
  label,
  placeholder,
  autoComplete,
  rows = 4,
  hint,
}: StandardFormFieldTextareaProps) {
  const hasErrors =
    field.state.meta.errors && field.state.meta.errors.length > 0;
  const isTouched = field.state.meta.isTouched;
  const errorDescId =
    isTouched && hasErrors ? `${field.name}-error` : undefined;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={field.name}
        className={sfLabel}
        style={{ fontFamily: sfFontSans }}
      >
        {label}
      </label>
      {hint ? (
        <p
          className="-mt-0.5 text-[0.75rem] leading-snug font-normal text-white/42"
          style={{ fontFamily: sfFontSans }}
          id={`${field.name}-hint`}
        >
          {hint}
        </p>
      ) : null}
      <textarea
        id={field.name}
        name={field.name}
        rows={rows}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        className={clsx(sfControlText(!!hasErrors), 'min-h-22 resize-y')}
        style={{ fontFamily: sfFontSans }}
        aria-invalid={hasErrors}
        aria-describedby={
          [hint ? `${field.name}-hint` : null, errorDescId]
            .filter(Boolean)
            .join(' ') || undefined
        }
      />
      <StandardFieldError field={field} />
    </div>
  );
}
