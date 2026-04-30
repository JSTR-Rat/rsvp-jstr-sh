import type { AnyFieldApi } from '@tanstack/react-form';
import type { RefObject } from 'react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { StandardFieldError } from './field-error';

interface FormFieldTurnstileProps {
  field: AnyFieldApi;
  action?: string;
  ref?: RefObject<TurnstileInstance | null>;
}

/**
 * Turnstile + field errors — container matches darker form shell; widget theme stays dark.
 */
export function StandardFormFieldTurnstile({
  field,
  ref,
  action,
}: FormFieldTurnstileProps) {
  return (
    <div className="space-y-2" role="group" aria-label="Security verification">
      <div className="flex min-h-[2.875rem] w-full overflow-hidden rounded-md border border-white/[0.14] bg-black/35">
        <Turnstile
          ref={ref}
          options={{
            theme: 'dark',
            size: 'flexible',
            action: action,
          }}
          siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
          onSuccess={(token) => field.handleChange(token)}
          onError={(error) => {
            console.error(error);
            field.handleChange('');
          }}
          onExpire={() => {
            field.handleChange('');
          }}
          onTimeout={() => {
            field.handleChange('');
          }}
        />
      </div>
      <StandardFieldError field={field} />
    </div>
  );
}
