import type { CSSProperties } from 'react';
import { StationeryEmailShell } from '@/emails/wedding-invite-email-stationery';
import {
  STATIONERY_FLORAL_RULE_EMAIL_IMAGE_PATH,
  StationeryCardFrame,
  StationeryCoupleNamesHeading,
  StationeryEmailAutomatedFooter,
  StationeryEmailCtaButton,
  StationeryFloralRule,
  stationeryEmailFontSans,
  stationeryEmailFontSerif,
  stationeryEmailTextBody,
  stationeryEmailTextMuted,
  stationeryEmailTextPrimary,
} from '@/emails/wedding-invite-email-stationery-parts';
import { resolveEmailPublicAssetUrl } from '@/lib/wedding-invite-email-gallery';

export type RsvpEmailDetails = {
  guestName: string;
  guestEmail: string;
  isAttending: boolean;
  mealChoiceLabel: string | null;
  dietaryRequirements: string | null;
  additionalNotes: string | null;
};

type InviteeRsvpEmailProps = RsvpEmailDetails & {
  kind: 'received' | 'updated';
  inviteLink: string;
};

type AdminRsvpEmailProps = RsvpEmailDetails & {
  kind: 'new' | 'updated';
  dashboardLink: string;
};

const detailLabelStyle: CSSProperties = {
  margin: '0 0 4px',
  fontFamily: stationeryEmailFontSans,
  fontSize: '10px',
  fontWeight: 500,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: stationeryEmailTextMuted,
};

const detailValueStyle: CSSProperties = {
  margin: '0 0 16px',
  fontFamily: stationeryEmailFontSans,
  fontSize: '14px',
  lineHeight: 1.55,
  color: stationeryEmailTextBody,
  whiteSpace: 'pre-wrap',
};

function InviteeRsvpSummary({ details }: { details: RsvpEmailDetails }) {
  return (
    <div
      style={{
        margin: '0 auto 28px',
        maxWidth: '420px',
        padding: '18px 20px',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(0, 0, 0, 0.22)',
        textAlign: 'left',
      }}
    >
      <p style={detailLabelStyle}>Response</p>
      <p
        style={{
          ...detailValueStyle,
          marginBottom: details.isAttending ? '16px' : 0,
        }}
      >
        {details.isAttending ? 'Attending' : 'Unable to attend'}
      </p>
      {details.isAttending ? (
        <>
          <p style={detailLabelStyle}>Meal choice</p>
          <p style={detailValueStyle}>
            {details.mealChoiceLabel ?? 'Not recorded'}
          </p>
          <p style={detailLabelStyle}>Dietary requirements</p>
          <p style={detailValueStyle}>
            {details.dietaryRequirements?.trim()
              ? details.dietaryRequirements
              : 'None specified'}
          </p>
          {details.additionalNotes?.trim() ? (
            <>
              <p style={detailLabelStyle}>Additional notes</p>
              <p style={{ ...detailValueStyle, marginBottom: 0 }}>
                {details.additionalNotes}
              </p>
            </>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function AdminRsvpSummary({ details }: { details: RsvpEmailDetails }) {
  return (
    <div
      style={{
        margin: '0 auto 28px',
        maxWidth: '480px',
        padding: '18px 20px',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(0, 0, 0, 0.22)',
        textAlign: 'left',
      }}
    >
      <p style={detailLabelStyle}>Guest</p>
      <p style={detailValueStyle}>{details.guestName}</p>
      <p style={detailLabelStyle}>Email</p>
      <p style={detailValueStyle}>{details.guestEmail}</p>
      <p style={detailLabelStyle}>Response</p>
      <p style={detailValueStyle}>
        {details.isAttending ? 'Attending' : 'Unable to attend'}
      </p>
      {details.mealChoiceLabel ? (
        <>
          <p style={detailLabelStyle}>Meal choice</p>
          <p style={detailValueStyle}>{details.mealChoiceLabel}</p>
        </>
      ) : null}
      {details.dietaryRequirements?.trim() ? (
        <>
          <p style={detailLabelStyle}>Dietary requirements</p>
          <p style={detailValueStyle}>{details.dietaryRequirements}</p>
        </>
      ) : null}
      {details.additionalNotes?.trim() ? (
        <>
          <p style={detailLabelStyle}>Additional notes</p>
          <p style={{ ...detailValueStyle, marginBottom: 0 }}>
            {details.additionalNotes}
          </p>
        </>
      ) : null}
    </div>
  );
}

export function WeddingInviteeRsvpEmail({
  kind,
  guestName,
  guestEmail,
  inviteLink,
  isAttending,
  mealChoiceLabel,
  dietaryRequirements,
  additionalNotes,
}: InviteeRsvpEmailProps) {
  const details: RsvpEmailDetails = {
    guestName,
    guestEmail,
    isAttending,
    mealChoiceLabel,
    dietaryRequirements,
    additionalNotes,
  };
  const floralDividerImageUrl = resolveEmailPublicAssetUrl(
    inviteLink,
    STATIONERY_FLORAL_RULE_EMAIL_IMAGE_PATH,
  );
  const headline =
    kind === 'received'
      ? "We've received your RSVP"
      : 'Your RSVP has been updated';
  const intro =
    kind === 'received'
      ? 'Thank you for letting us know. Here is a summary of what we received.'
      : 'Your reply has been updated. Here is a summary of your current details.';

  return (
    <StationeryEmailShell>
      <StationeryCardFrame ariaLabel={`RSVP confirmation for ${guestName}`}>
        <StationeryFloralRule imageUrl={floralDividerImageUrl} />
        <StationeryCoupleNamesHeading />
        <p
          style={{
            margin: '0 0 12px',
            fontFamily: stationeryEmailFontSerif,
            fontSize: '22px',
            fontStyle: 'italic',
            fontWeight: 500,
            color: stationeryEmailTextPrimary,
            textAlign: 'center',
            lineHeight: 1.35,
          }}
        >
          {headline}
        </p>
        <p
          style={{
            margin: '0 0 8px',
            fontFamily: stationeryEmailFontSerif,
            fontSize: '18px',
            fontStyle: 'italic',
            color: stationeryEmailTextBody,
            textAlign: 'center',
          }}
        >
          Dear {guestName},
        </p>
        <p
          style={{
            margin: '0 0 28px',
            fontFamily: stationeryEmailFontSerif,
            fontSize: '16px',
            fontStyle: 'italic',
            color: stationeryEmailTextBody,
            textAlign: 'center',
            lineHeight: 1.5,
            padding: '0 8px',
          }}
        >
          {intro}
        </p>
        <InviteeRsvpSummary details={details} />
        <StationeryEmailCtaButton
          href={inviteLink}
          label="View your RSVP"
          ariaLabel="View your RSVP online"
        />
        <p
          style={{
            margin: '0 0 22px',
            fontFamily: stationeryEmailFontSans,
            fontSize: '11px',
            color: stationeryEmailTextMuted,
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
              color: stationeryEmailTextPrimary,
              textDecoration: 'underline',
            }}
          >
            {inviteLink}
          </a>
        </p>
        <StationeryEmailAutomatedFooter />
      </StationeryCardFrame>
    </StationeryEmailShell>
  );
}

export function WeddingAdminRsvpEmail({
  kind,
  guestName,
  guestEmail,
  dashboardLink,
  isAttending,
  mealChoiceLabel,
  dietaryRequirements,
  additionalNotes,
}: AdminRsvpEmailProps) {
  const details: RsvpEmailDetails = {
    guestName,
    guestEmail,
    isAttending,
    mealChoiceLabel,
    dietaryRequirements,
    additionalNotes,
  };
  const floralDividerImageUrl = resolveEmailPublicAssetUrl(
    dashboardLink,
    STATIONERY_FLORAL_RULE_EMAIL_IMAGE_PATH,
  );
  const headline = kind === 'new' ? 'New RSVP received' : 'RSVP updated';
  const intro =
    kind === 'new'
      ? `${guestName} has submitted their RSVP.`
      : `${guestName} has updated their RSVP.`;

  return (
    <StationeryEmailShell>
      <StationeryCardFrame ariaLabel={`RSVP notification for ${guestName}`}>
        <StationeryFloralRule imageUrl={floralDividerImageUrl} />
        <StationeryCoupleNamesHeading />
        <p
          style={{
            margin: '0 0 28px',
            fontFamily: stationeryEmailFontSerif,
            fontSize: '22px',
            fontStyle: 'italic',
            fontWeight: 500,
            color: stationeryEmailTextPrimary,
            textAlign: 'center',
            lineHeight: 1.35,
            padding: '0 8px',
          }}
        >
          {headline}
        </p>
        <p
          style={{
            margin: '0 0 28px',
            fontFamily: stationeryEmailFontSerif,
            fontSize: '16px',
            fontStyle: 'italic',
            color: stationeryEmailTextBody,
            textAlign: 'center',
            lineHeight: 1.5,
            padding: '0 8px',
          }}
        >
          {intro}
        </p>
        <AdminRsvpSummary details={details} />
        <StationeryEmailCtaButton
          href={dashboardLink}
          label="View in dashboard"
          ariaLabel={`View ${guestName}'s invite in the dashboard`}
        />
        <StationeryEmailAutomatedFooter />
      </StationeryCardFrame>
    </StationeryEmailShell>
  );
}

export default WeddingInviteeRsvpEmail;
