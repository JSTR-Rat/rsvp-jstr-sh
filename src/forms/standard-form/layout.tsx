import type { ReactNode } from 'react';
import { HeroBlurredBackground } from '@/components/hero-blurred-background';
import { clsx } from 'clsx';
import {
  GOOGLE_FONTS_CSS_HREF,
  sfFontSans,
  sfFontSerif,
  sfPageBackdrop,
  sfPageOuter,
  sfPageRadial,
  sfSubtitle,
  sfTitle,
} from './shared-classes';

interface StandardFormLayoutProps {
  title: string;
  /** When omitted, no subtitle line is shown (e.g. confirmation panels). */
  subtitle?: string;
  /** Blurred engagement photo + `/` hero gradients instead of solid form backdrop. */
  heroPhotoBackdrop?: boolean;
  /**
   * Vertical placement of content in the viewport. `center` matches short forms;
   * `start` pins content to the top (e.g. after submit when the window should read from the heading).
   */
  contentVerticalAlign?: 'center' | 'start';
  /**
   * Inner column max width under the heading. `wide` matches the narrow form width
   * below `lg`, then expands for two-pane layouts (e.g. RSVP summary + Spotify).
   */
  contentInnerWidth?: 'default' | 'wide';
  children: ReactNode;
}

/**
 * Full-page centered layout for standard forms — dark glass backdrop paralleling
 * the `/` gallery section; serif display + Jost captions like the landing page.
 */
export function StandardFormLayout({
  title,
  subtitle,
  heroPhotoBackdrop = false,
  contentVerticalAlign = 'center',
  contentInnerWidth = 'default',
  children,
}: StandardFormLayoutProps) {
  return (
    <>
      <link rel="stylesheet" href={GOOGLE_FONTS_CSS_HREF} />
      {heroPhotoBackdrop ? <HeroBlurredBackground /> : null}
      <div
        className={clsx(
          sfPageOuter,
          heroPhotoBackdrop && 'relative z-10',
          contentVerticalAlign === 'start' && 'justify-start!',
        )}
      >
        {!heroPhotoBackdrop ? (
          <>
            <div className={sfPageBackdrop} aria-hidden />
            <div className={sfPageRadial} aria-hidden />
          </>
        ) : null}

        <div
          className={clsx(
            'w-full space-y-6',
            contentInnerWidth === 'wide'
              ? 'max-w-88 sm:max-w-[24rem] lg:max-w-[min(100%,52rem)] xl:max-w-232'
              : 'max-w-88 sm:max-w-[24rem]',
          )}
        >
          <header className="text-center">
            <h1 className={sfTitle} style={{ fontFamily: sfFontSerif }}>
              {title}
            </h1>
            {subtitle ? (
              <p className={sfSubtitle} style={{ fontFamily: sfFontSans }}>
                {subtitle}
              </p>
            ) : null}
          </header>

          {children}
        </div>
      </div>
    </>
  );
}
