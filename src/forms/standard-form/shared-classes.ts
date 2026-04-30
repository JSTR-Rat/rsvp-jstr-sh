import { clsx } from 'clsx';

/** Google Fonts — matches `/` RSVP landing (Cormorant Garamond + Jost). */
export const GOOGLE_FONTS_CSS_HREF =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@400;500&display=swap';

/**
 * Standard form primitives aligned with `/` hero + gallery: dark layered
 * backdrop, glass panel, uppercase micro-labels (Jost), restrained borders.
 */

export const sfFontSans = "'Jost', system-ui, sans-serif";

export const sfFontSerif =
  "'Cormorant Garamond', Georgia, 'Times New Roman', serif";

export const sfPageOuter =
  'relative flex min-h-svh flex-col items-center justify-center px-5 py-12 sm:px-8 sm:py-14';

export const sfPageBackdrop =
  'pointer-events-none fixed inset-0 -z-10 bg-linear-to-b from-black/82 via-black/90 to-black';

export const sfPageRadial =
  'pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(95%_58%_at_50%_38%,transparent_28%,rgba(0,0,0,0.35)_72%,rgba(0,0,0,0.55)_100%)]';

/** Full-height authenticated app root (backdrop lives behind sticky nav + main). */
export const sfAuthedAppRoot =
  'relative isolate flex min-h-svh flex-col text-white';

/** Page content column — tighter than invite-style marketing forms. */
export const sfLayoutInner = 'w-full max-w-[22rem] space-y-6 sm:max-w-[24rem]';

export const sfTitle =
  'text-center font-medium tracking-tight text-white text-[1.375rem] sm:text-[1.625rem]';

export const sfSubtitle =
  'mt-1 text-center font-normal leading-snug text-white/62 text-[0.8125rem] sm:text-[0.84375rem]';

/** Card / shell behind the form — gallery-adjacent glass. */
export const sfShell =
  'rounded-lg border border-white/12 bg-black/50 p-6 shadow-[0_28px_64px_-12px_rgba(0,0,0,0.55)] backdrop-blur-lg sm:p-7';

export const sfFormFields = 'space-y-5';

/** Label rhythm matches index route date strip caps. */
export const sfLabel =
  'block text-[0.66rem] font-medium uppercase tracking-[0.22em] text-white/54';

/** Text-like controls (native input styling). */
export function sfControlText(error: boolean) {
  return clsx(
    'w-full rounded-md border px-3 py-2.5 text-[0.9375rem] leading-snug text-white shadow-black/25 transition-[border-color,box-shadow,background-color] outline-none',
    'bg-white/[0.07] placeholder:text-white/38',
    'focus:border-white/[0.38] focus:ring-[3px] focus:ring-white/18 focus:ring-offset-0 focus:ring-offset-transparent',
    'disabled:pointer-events-none disabled:opacity-40',
    error ? 'border-red-400/50' : 'border-white/[0.14]',
  );
}

/** Primary action — subdued, borders only (admin tone). */
export function sfSubmitButton(disabled: boolean) {
  return clsx(
    'flex w-full items-center justify-center rounded-md border border-white/[0.2] px-4 py-2.5 font-medium text-[0.9375rem] text-white tracking-tight',
    'transition-[border-color,background-color,opacity] duration-150',
    'outline-none focus-visible:border-white/45 focus-visible:ring-[3px] focus-visible:ring-white/22',
    disabled
      ? 'cursor-not-allowed border-white/[0.1] bg-white/[0.04] opacity-40'
      : 'cursor-pointer bg-white/[0.09] hover:border-white/[0.3] hover:bg-white/[0.12] active:bg-white/[0.1]',
  );
}

/** Server / destructive alert */
export const sfAlertError =
  'rounded-md border border-red-400/42 bg-red-950/42 p-3.5 backdrop-blur-sm';

export const sfAlertErrorText =
  'text-[0.8125rem] leading-relaxed font-normal text-red-100/[0.95]';

export const sfFieldErrorText =
  'mt-1.5 text-[0.8125rem] leading-snug text-red-300/[0.95]';
