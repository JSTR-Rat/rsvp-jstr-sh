import type { ReactNode } from 'react';
import { HeroBlurredBackground } from '@/components/hero-blurred-background';
import { clsx } from 'clsx';
import {
  GOOGLE_FONTS_CSS_HREF,
  sfFontSans,
  sfFontSerif,
  sfLayoutInner,
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
  children,
}: StandardFormLayoutProps) {
  return (
    <>
      <link rel="stylesheet" href={GOOGLE_FONTS_CSS_HREF} />
      {heroPhotoBackdrop ? <HeroBlurredBackground /> : null}
      <div className={clsx(sfPageOuter, heroPhotoBackdrop && 'relative z-10')}>
        {!heroPhotoBackdrop ? (
          <>
            <div className={sfPageBackdrop} aria-hidden />
            <div className={sfPageRadial} aria-hidden />
          </>
        ) : null}

        <div className={sfLayoutInner}>
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
