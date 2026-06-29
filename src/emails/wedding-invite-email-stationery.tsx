import type { ReactNode } from 'react';
import type { WeddingInviteEmailProps } from '@/emails/wedding-invite-email';
import {
  stationeryEmailFontSans,
  stationeryEmailGoogleFontsHref,
  stationeryEmailPageBg,
  STATIONERY_EMAIL_RESPONSIVE_CSS,
  WeddingInviteStationeryCard,
} from '@/emails/wedding-invite-email-stationery-parts';

/** Outer shell + subtle radial wash (no hero photography). */
const pageShellRadial =
  'radial-gradient(ellipse 120% 80% at 50% -15%, rgba(255,255,255,0.06) 0%, transparent 45%), radial-gradient(ellipse 90% 55% at 50% 110%, rgba(2,14,10,0.44) 0%, transparent 50%)';

export function StationeryEmailShell({ children }: { children: ReactNode }) {
  return (
    <div
      lang="en"
      style={{
        margin: 0,
        padding: 0,
        width: '100%',
        fontFamily: stationeryEmailFontSans,
        lineHeight: 1.6,
        WebkitTextSizeAdjust: '100%',
        textSizeAdjust: '100%',
        backgroundColor: stationeryEmailPageBg,
        backgroundImage: pageShellRadial,
        colorScheme: 'dark',
      }}
    >
      <link rel="stylesheet" href={stationeryEmailGoogleFontsHref} />
      <style>{STATIONERY_EMAIL_RESPONSIVE_CSS}</style>
      {/*
       * `bgcolor` + color-scheme: hint dark canvas for Outlook (classic) / some
       * webmail views. Gmail’s outer chrome (toolbar, gutters) stays the app UI;
       * we cannot tint that from an email.
       */}
      <table
        role="presentation"
        cellPadding={0}
        cellSpacing={0}
        border={0}
        width="100%"
        bgcolor={stationeryEmailPageBg}
        style={{
          margin: 0,
          padding: 0,
          width: '100%',
          borderCollapse: 'collapse',
          backgroundColor: stationeryEmailPageBg,
        }}
      >
        <tbody>
          <tr>
            <td
              align="center"
              valign="top"
              className="stationery-outer-shell"
              style={{
                padding: '44px 20px',
                backgroundColor: stationeryEmailPageBg,
                backgroundImage:
                  'radial-gradient(ellipse 120% 80% at 50% -15%, rgba(255,255,255,0.06) 0%, transparent 45%)',
              }}
            >
              {children}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/**
 * Formal “paper card” hierarchy (reference layout) with the dark, romantic
 * typography of the homepage — Cormorant + Jost, florals, ivory CTA.
 */
export function WeddingInviteStationeryEmail({
  guestName,
  inviteLink,
}: WeddingInviteEmailProps) {
  return (
    <StationeryEmailShell>
      <WeddingInviteStationeryCard guestName={guestName} inviteLink={inviteLink} />
    </StationeryEmailShell>
  );
}

export default WeddingInviteStationeryEmail;
