import type { CSSProperties, ReactNode } from 'react';
import type { WeddingInviteEmailProps } from '@/emails/wedding-invite-email';
import {
  EVENT_WHEN_PRIMARY,
  EVENT_WHEN_TIME,
  VENUE_ADDRESS_LINES,
  VENUE_MAPS_URL,
  VENUE_NAME,
  VENUE_WEBSITE_URL,
} from '@/lib/wedding-event-details';
import { resolveEmailPublicAssetUrl } from '@/lib/wedding-invite-email-gallery';

/**
 * Homepage-aligned fonts — same stacks as {@link import('@/routes/index.tsx')}.
 */
export const stationeryEmailFontSans =
  "'Jost', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
const fontSerif =
  "'Cormorant Garamond', Georgia, 'Times New Roman', Times, serif";
/** Cursive display for couple names — loaded via {@link stationeryEmailGoogleFontsHref}. */
export const stationeryEmailFontScript =
  "'Great Vibes', 'Segoe Script', 'Brush Script MT', 'Lucida Handwriting', cursive";
export const stationeryEmailFontSerif = fontSerif;

/**
 * Webfont bundle for stationery emails — aligns with stacks above and homepage
 * typography (`index.tsx`) so Jost / Cormorant / Great Vibes resolve in clients
 * that allow linked stylesheets (Apple Mail, many webmail clients).
 */
export const stationeryEmailGoogleFontsHref =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@400;500&family=Great+Vibes&display=swap';

/**
 * Narrow viewports (Gmail mobile, Apple Mail): side corner columns stole ~176px
 * fixed width — hide them and widen the invitation. Requires a `<style>` in the shell.
 */
export const STATIONERY_EMAIL_RESPONSIVE_CSS = `
@media only screen and (max-width: 600px) {
  .stationery-layout-table { width: 100% !important; max-width: 100% !important; }
  .stationery-corner-slot {
    display: none !important;
    width: 0 !important;
    max-width: 0 !important;
    min-width: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
    overflow: hidden !important;
    line-height: 0 !important;
    font-size: 0 !important;
  }
  .stationery-main-column { width: 100% !important; }
  .stationery-card-pad { padding: 28px 16px 32px !important; }
  .stationery-outer-shell { padding: 24px 12px !important; }
  .stationery-invite-names { font-size: 44px !important; line-height: 1.1 !important; }
}
`.trim();

/** Near-black gutter with a restrained cool‑green hue (pairs with charcoal card tint). */
export const stationeryEmailPageBg = '#060a09';
/** Card fill — faintly lifted RGB so the panel separates from `#060a09`. */
const cardBg = 'rgba(10, 14, 12, 0.96)';
/** Used when the card sits over a photo so the backdrop reads through slightly. */
const cardBgOverPhoto = 'rgba(10, 14, 12, 0.84)';
const borderSubtle = 'rgba(255, 255, 255, 0.1)';
/** Outer invitation panel border radius. */
const cardBorderRadius = '14px';
const textPrimary = '#fafafa';
/** Body serif — tuned for WCAG AA on `#0a0e0c` green‑charcoal card tint. */
export const stationeryEmailTextBody = 'rgba(255, 255, 255, 0.92)';
/** Sans captions, venue links wrap, RSVP hint — bumped from ~52% white for AA on charcoal. */
export const stationeryEmailTextMuted = 'rgba(255, 255, 255, 0.74)';
/** All-caps eyebrow tiers (10–11px) — still subdued but legible over glassy card */
const textEyebrow = 'rgba(255, 255, 255, 0.76)';
const textEyebrowSoft = 'rgba(255, 255, 255, 0.70)';
export const stationeryEmailAccentIvory = '#f5f4f2';
export const stationeryEmailAccentInk = '#141414';
export const stationeryEmailTextPrimary = textPrimary;
const textBody = stationeryEmailTextBody;
const textMuted = stationeryEmailTextMuted;
const accentIvory = stationeryEmailAccentIvory;
const accentInk = stationeryEmailAccentInk;

/** Floral divider max CSS width (PNG is 2× for sharpness). */
const STATIONERY_FLORAL_RULE_MAX_PX = 304;
/** Raster asset — Gmail strips inline SVG; regenerate from `stationery-floral-rule.svg` if art changes. */
export const STATIONERY_FLORAL_RULE_EMAIL_IMAGE_PATH =
  '/images/email/stationery-floral-rule.png';

export const stationeryEmailSmallCapsEyebrow: CSSProperties = {
  margin: '0',
  fontFamily: stationeryEmailFontSans,
  fontSize: '10px',
  fontWeight: 500,
  letterSpacing: '0.26em',
  textTransform: 'uppercase',
  color: textEyebrow,
  lineHeight: 1.55,
};

/**
 * Corner ornament — echoes `/` FloralDivider strokes; light on dark like the landing page.
 * Pass `flipH` for the top-left cell to mirror the art horizontally only.
 */
function StationeryCorner({ flipH }: { flipH?: boolean }) {
  const transform = flipH ? 'scaleX(-1)' : undefined;
  return (
    <svg
      width="84"
      height="84"
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{
        display: 'block',
        transform,
        transformOrigin: transform ? '50% 50%' : undefined,
      }}
    >
      <g
        stroke="rgba(255,255,255,0.26)"
        strokeWidth={0.65}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path opacity={0.9} d="M10 78c12-18 22-28 38-36s24-12 30-24" />
        <path
          opacity={0.5}
          d="M18 86c10-12 20-20 34-26M28 88c8-8 16-14 28-18"
        />
        <path opacity={0.4} d="M44 72c-2-5-8-4-10 0M68 48c3-4 9-3 10 1" />
      </g>
      <g fill="rgba(255,255,255,0.2)" stroke="none">
        <circle cx="76" cy="22" r="2" />
        <ellipse cx="70" cy="18" rx="2.4" ry="3.4" opacity={0.35} />
        <ellipse cx="82" cy="30" rx="2.2" ry="3.2" opacity={0.28} />
      </g>
    </svg>
  );
}

/** Gmail / most webmail omit inline SVG — use hosted PNG with absolute `src`. */
export function StationeryFloralRule({ imageUrl }: { imageUrl: string }) {
  return (
    <table
      role="presentation"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      style={{
        margin: 0,
        width: '100%',
        borderCollapse: 'collapse',
      }}
    >
      <tbody>
        <tr>
          <td
            align="center"
            style={{
              padding: 0,
              width: '100%',
              verticalAlign: 'middle',
              textAlign: 'center',
            }}
          >
            <img
              src={imageUrl}
              alt=""
              width={608}
              height={47}
              aria-hidden
              style={{
                display: 'block',
                maxWidth: `${STATIONERY_FLORAL_RULE_MAX_PX}px`,
                width: '100%',
                height: 'auto',
                marginLeft: 'auto',
                marginRight: 'auto',
                boxSizing: 'border-box',
              }}
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export type StationeryCardFrameProps = {
  ariaLabel: string;
  translucentOverPhoto?: boolean;
  children: ReactNode;
};

/** Corner columns + bordered card panel shared by invitation and RSVP emails. */
export function StationeryCardFrame({
  ariaLabel,
  translucentOverPhoto = false,
  children,
}: StationeryCardFrameProps) {
  const panelBg = translucentOverPhoto ? cardBgOverPhoto : cardBg;

  return (
    <table
      role="presentation"
      className="stationery-layout-table"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      style={{
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        borderCollapse: 'separate',
        borderSpacing: 0,
      }}
    >
      <tbody>
        <tr>
          <td
            className="stationery-corner-slot"
            width="88"
            valign="top"
            align="left"
            style={{ padding: '4px 0 0 4px' }}
          >
            <StationeryCorner flipH />
          </td>
          <td
            className="stationery-main-column"
            valign="top"
            align="center"
            style={{ padding: 0, width: '100%' }}
          >
            <div
              role="article"
              aria-label={ariaLabel}
              className="stationery-card-pad"
              style={{
                padding: '36px 20px 40px',
                borderRadius: cardBorderRadius,
                border: `1px solid ${borderSubtle}`,
                backgroundColor: panelBg,
                boxShadow:
                  '0 2px 4px rgba(0,0,0,0.08), 0 22px 70px rgba(0,0,0,0.55)',
                backgroundImage:
                  'linear-gradient(180deg, rgba(255,255,255,0.022) 0%, transparent 20%)',
                overflow: 'hidden',
              }}
            >
              {children}
            </div>
          </td>
          <td
            className="stationery-corner-slot"
            width="88"
            valign="bottom"
            align="right"
            style={{ padding: '0 4px 4px 0' }}
          >
            <StationeryCorner />
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function StationeryCoupleNamesHeading() {
  return (
    <h1
      className="stationery-invite-names"
      style={{
        margin: '22px 0 20px',
        fontFamily: stationeryEmailFontScript,
        fontSize: '52px',
        fontWeight: 400,
        lineHeight: 1.12,
        letterSpacing: '0.02em',
        color: textPrimary,
        textAlign: 'center',
      }}
    >
      Vada &amp;{' '}
      <br />
      Wade
    </h1>
  );
}

export function StationeryEmailCtaButton({
  href,
  label,
  ariaLabel,
  uppercase = true,
}: {
  href: string;
  label: string;
  ariaLabel: string;
  uppercase?: boolean;
}) {
  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      align="center"
      style={{
        margin: '0 auto 32px',
        borderCollapse: 'collapse',
      }}
    >
      <tbody>
        <tr>
          <td
            align="center"
            style={{
              borderRadius: '6px',
              backgroundColor: accentIvory,
            }}
          >
            <a
              href={href}
              aria-label={ariaLabel}
              style={{
                display: 'inline-block',
                padding: '14px 36px',
                backgroundColor: accentIvory,
                color: accentInk,
                fontFamily: stationeryEmailFontSans,
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: uppercase ? '0.22em' : '0.04em',
                textTransform: uppercase ? 'uppercase' : 'none',
                textDecoration: 'none',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {label}
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function StationeryEmailAutomatedFooter() {
  return (
    <div
      style={{
        marginTop: '4px',
        paddingTop: '22px',
        borderTop: `1px solid ${borderSubtle}`,
      }}
    >
      <p
        style={{
          margin: '0 0 14px',
          fontFamily: stationeryEmailFontSans,
          fontSize: '11px',
          fontWeight: 400,
          color: textMuted,
          textAlign: 'center',
          lineHeight: 1.6,
          padding: '0 12px',
        }}
      >
        If you didn&apos;t expect this, you may ignore this email.
      </p>
      <p
        style={{
          margin: '0',
          fontFamily: stationeryEmailFontSans,
          fontSize: '11px',
          fontWeight: 400,
          color: textMuted,
          textAlign: 'center',
          lineHeight: 1.6,
          padding: '0 12px',
        }}
      >
        Automated message. Please do not reply.
      </p>
    </div>
  );
}

export type WeddingInviteStationeryCardProps = WeddingInviteEmailProps & {
  /** Lighter card surfaces so a blurred photo behind the layout shows through. */
  translucentOverPhoto?: boolean;
};

/** Main invitation card (shared by plain stationery and production alias templates). */
export function WeddingInviteStationeryCard({
  guestName,
  inviteLink,
  translucentOverPhoto = false,
}: WeddingInviteStationeryCardProps) {
  const floralDividerImageUrl = resolveEmailPublicAssetUrl(
    inviteLink,
    STATIONERY_FLORAL_RULE_EMAIL_IMAGE_PATH,
  );
  const whenUpper = EVENT_WHEN_PRIMARY.toUpperCase();
  const venueNameUpper = VENUE_NAME.toUpperCase();
  const venueAddressLineParagraphStyle: CSSProperties = {
    margin: '6px 0 0',
    textAlign: 'center',
    lineHeight: 1.6,
  };
  const venueMapsAddressLinkStyle: CSSProperties = {
    color: textPrimary,
    textDecoration: 'underline',
    fontFamily: stationeryEmailFontSans,
    fontSize: '10px',
    fontWeight: 500,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
  };

  return (
    <StationeryCardFrame
      ariaLabel="Wedding invitation from Vada and Wade"
      translucentOverPhoto={translucentOverPhoto}
    >
      <p
        style={{ ...stationeryEmailSmallCapsEyebrow, marginBottom: '18px' }}
      >
        Together with their families
      </p>

      <StationeryFloralRule imageUrl={floralDividerImageUrl} />

      <StationeryCoupleNamesHeading />

                <p
                  style={{
                    ...stationeryEmailSmallCapsEyebrow,
                    maxWidth: '540px',
                    margin: '0 auto 10px',
                    padding: '0 8px',
                    color: textEyebrowSoft,
                  }}
                >
                  Request the pleasure of your company at the celebration of
                  their marriage
                </p>

                <p
                  style={{
                    margin: '22px 0 12px',
                    fontFamily: fontSerif,
                    fontSize: '18px',
                    fontStyle: 'italic',
                    color: textBody,
                    textAlign: 'center',
                  }}
                >
                  Dear {guestName},
                </p>

                <p
                  style={{
                    margin: '0 0 28px',
                    fontFamily: fontSerif,
                    fontSize: '16px',
                    fontStyle: 'italic',
                    fontWeight: 400,
                    color: textBody,
                    textAlign: 'center',
                    lineHeight: 1.5,
                  }}
                >
                  We&apos;d love to share our special day with you.
                </p>

                <p
                  style={{
                    ...stationeryEmailSmallCapsEyebrow,
                    marginBottom: '10px',
                    fontSize: '11px',
                    letterSpacing: '0.22em',
                    color: textEyebrow,
                  }}
                >
                  {whenUpper}
                </p>

                <p
                  style={{
                    ...stationeryEmailSmallCapsEyebrow,
                    marginBottom: '22px',
                    fontSize: '10px',
                    letterSpacing: '0.2em',
                    color: textEyebrowSoft,
                  }}
                >
                  {EVENT_WHEN_TIME}
                </p>

                <div style={{ marginBottom: '8px' }}>
                  <p
                    style={{
                      margin: '0',
                      fontFamily: stationeryEmailFontSans,
                      fontSize: '10px',
                      fontWeight: 500,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: textEyebrowSoft,
                      textAlign: 'center',
                      lineHeight: 1.6,
                    }}
                  >
                    {venueNameUpper}
                  </p>
                  {VENUE_ADDRESS_LINES.map((line) => (
                    <p key={line} style={venueAddressLineParagraphStyle}>
                      <a
                        href={VENUE_MAPS_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open directions to ${line} (${VENUE_NAME}) in Maps`}
                        style={venueMapsAddressLinkStyle}
                      >
                        {line.toUpperCase()}
                      </a>
                    </p>
                  ))}
                </div>

                <p
                  style={{
                    margin: '20px 0 0',
                    fontFamily: stationeryEmailFontSans,
                    fontSize: '12px',
                    color: textMuted,
                    textAlign: 'center',
                    lineHeight: 1.6,
                  }}
                >
                  <a
                    href={VENUE_WEBSITE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${VENUE_NAME} venue website (opens in new tab)`}
                    style={{
                      color: textPrimary,
                      textDecoration: 'underline',
                    }}
                  >
                    Venue website
                  </a>
                </p>

                <div
                  style={{
                    margin: '32px 0 28px',
                    textAlign: 'center',
                  }}
                >
                  <StationeryFloralRule imageUrl={floralDividerImageUrl} />
                </div>

                <p
                  style={{
                    margin: '0 0 28px',
                    fontFamily: fontSerif,
                    fontSize: '19px',
                    fontStyle: 'italic',
                    fontWeight: 400,
                    color: textPrimary,
                    textAlign: 'center',
                    lineHeight: 1.35,
                  }}
                >
                  Reception to follow
                </p>

                <p
                  style={{
                    margin: '0 0 28px',
                    fontFamily: stationeryEmailFontSans,
                    fontSize: '12px',
                    fontWeight: 500,
                    letterSpacing: '0.06em',
                    color: textMuted,
                    textAlign: 'center',
                  }}
                >
                  Please RSVP with your personal link below.
                </p>

                <StationeryEmailCtaButton
                  href={inviteLink}
                  label="Click here to RSVP"
                  ariaLabel="Click here to RSVP to the wedding online"
                  uppercase={false}
                />

                <p
                  style={{
                    margin: '0 0 22px',
                    fontFamily: stationeryEmailFontSans,
                    fontSize: '11px',
                    color: textMuted,
                    lineHeight: 1.65,
                    wordBreak: 'break-word',
                    textAlign: 'center',
                    padding: '0 8px',
                  }}
                >
                  Link not working? Copy and paste:
                  <br />
                  <a
                    href={inviteLink}
                    style={{
                      color: textPrimary,
                      textDecoration: 'underline',
                    }}
                  >
                    {inviteLink}
                  </a>
                </p>

                <p
                  style={{
                    margin: '0 0 28px',
                    fontFamily: stationeryEmailFontSans,
                    fontSize: '11px',
                    fontWeight: 400,
                    color: textMuted,
                    textAlign: 'center',
                    lineHeight: 1.6,
                    padding: '0 12px',
                  }}
                >
                  Privacy: Your RSVP link is personal. Please don&apos;t share it.
                </p>

                <StationeryEmailAutomatedFooter />
    </StationeryCardFrame>
  );
}
