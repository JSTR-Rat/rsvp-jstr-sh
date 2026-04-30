import { sfAlertError, sfAlertErrorText, sfFontSans } from './shared-classes';

interface ServerErrorProps {
  error: string | null;
}

/**
 * Displays server-side error messages in a styled alert box.
 */
export function StandardServerError({ error }: ServerErrorProps) {
  if (!error) {
    return null;
  }

  return (
    <div className={sfAlertError} role="alert">
      <p
        className={sfAlertErrorText}
        style={{ fontFamily: sfFontSans }}
      >
        {error}
      </p>
    </div>
  );
}
