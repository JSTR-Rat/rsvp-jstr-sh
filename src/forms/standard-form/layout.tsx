import type { ReactNode } from 'react';
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
  subtitle: string;
  children: ReactNode;
}

/**
 * Full-page centered layout for standard forms — dark glass backdrop paralleling
 * the `/` gallery section; serif display + Jost captions like the landing page.
 */
export function StandardFormLayout({
  title,
  subtitle,
  children,
}: StandardFormLayoutProps) {
  return (
    <>
      <link rel="stylesheet" href={GOOGLE_FONTS_CSS_HREF} />
      <div className={sfPageOuter}>
        <div className={sfPageBackdrop} aria-hidden />
        <div className={sfPageRadial} aria-hidden />

        <div className={sfLayoutInner}>
          <header className="text-center">
            <h1 className={sfTitle} style={{ fontFamily: sfFontSerif }}>
              {title}
            </h1>
            <p className={sfSubtitle} style={{ fontFamily: sfFontSans }}>
              {subtitle}
            </p>
          </header>

          {children}
        </div>
      </div>
    </>
  );
}
