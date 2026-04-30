import type { AnyFieldApi } from '@tanstack/react-form';
import { StandardFieldError } from './field-error';
import { sfControlText, sfFontSans, sfLabel } from './shared-classes';

interface FormFieldProps {
  field: AnyFieldApi;
  label: string;
  type?: 'text' | 'email' | 'password';
  placeholder?: string;
  autoComplete?: string;
  inputMode?:
    | 'text'
    | 'numeric'
    | 'email'
    | 'tel'
    | 'url'
    | 'search'
    | 'none'
    | 'decimal';
  maxLength?: number;
}

/**
 * Reusable form field component with label, input, and error display.
 * Fully accessible and integrates with TanStack Form.
 */
export function StandardFormField({
  field,
  label,
  type = 'text',
  placeholder,
  autoComplete,
  inputMode,
  maxLength,
}: FormFieldProps) {
  const hasErrors =
    field.state.meta.errors && field.state.meta.errors.length > 0;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={field.name}
        className={sfLabel}
        style={{ fontFamily: sfFontSans }}
      >
        {label}
      </label>
      <input
        id={field.name}
        name={field.name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        className={sfControlText(!!hasErrors)}
        style={{ fontFamily: sfFontSans }}
        aria-invalid={hasErrors}
        aria-describedby={hasErrors ? `${field.name}-error` : undefined}
      />
      <StandardFieldError field={field} />
    </div>
  );
}
