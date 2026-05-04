export interface WeddingInviteEmailProps {
  guestName: string;
  inviteLink: string;
}

/**
 * HTML invite for Resend — rendered via `@react-email/render`.
 */
export function WeddingInviteEmail({
  guestName,
  inviteLink,
}: WeddingInviteEmailProps) {
  return (
    <div
      style={{
        backgroundColor: '#0a0a0a',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        lineHeight: '1.6',
        margin: '0',
        padding: '40px 20px',
      }}
    >
      <div
        style={{
          maxWidth: '560px',
          margin: '0 auto',
          backgroundColor: '#111111',
          borderRadius: '12px',
          border: '1px solid #222222',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '32px 32px 24px',
            textAlign: 'center',
            borderBottom: '1px solid #222222',
          }}
        >
          <h1
            style={{
              margin: '0',
              fontSize: '24px',
              fontWeight: '600',
              color: '#ffffff',
              letterSpacing: '-0.5px',
            }}
          >
            You&apos;re invited — Wade & Vada
          </h1>
        </div>

        <div style={{ padding: '32px' }}>
          <p
            style={{
              margin: '0 0 24px',
              fontSize: '15px',
              color: '#a3a3a3',
              lineHeight: '1.6',
            }}
          >
            Hi {guestName},
          </p>

          <p
            style={{
              margin: '0 0 32px',
              fontSize: '15px',
              color: '#d4d4d4',
              lineHeight: '1.6',
            }}
          >
            Wade and Vada would love for you to celebrate with them. Use your
            personal link below to RSVP.
          </p>

          <div
            style={{
              textAlign: 'center',
              marginBottom: '32px',
            }}
          >
            <a
              href={inviteLink}
              style={{
                display: 'inline-block',
                padding: '16px 32px',
                backgroundColor: '#0ea5e9',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: '600',
                textDecoration: 'none',
                borderRadius: '8px',
                border: 'none',
              }}
            >
              RSVP
            </a>
          </div>

          <p
            style={{
              margin: '0 0 24px',
              fontSize: '13px',
              color: '#737373',
              lineHeight: '1.6',
              wordBreak: 'break-all',
            }}
          >
            If the button doesn&apos;t work, copy and paste this link into your
            browser:{' '}
            <a
              href={inviteLink}
              style={{ color: '#0ea5e9', textDecoration: 'underline' }}
            >
              {inviteLink}
            </a>
          </p>

          <p
            style={{
              margin: '0 0 24px',
              fontSize: '14px',
              color: '#a3a3a3',
              lineHeight: '1.6',
            }}
          >
            If you didn&apos;t expect this invitation, you can safely ignore
            this email.
          </p>

          <div
            style={{
              borderTop: '1px solid #222222',
              paddingTop: '24px',
            }}
          >
            <p
              style={{
                margin: '0',
                fontSize: '13px',
                color: '#737373',
                lineHeight: '1.5',
              }}
            >
              <strong style={{ color: '#a3a3a3' }}>Security tip:</strong> This
              link is unique to you. Don&apos;t share it with anyone.
            </p>
          </div>
        </div>

        <div
          style={{
            padding: '24px 32px',
            backgroundColor: '#0a0a0a',
            borderTop: '1px solid #222222',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              margin: '0',
              fontSize: '12px',
              color: '#525252',
              lineHeight: '1.5',
            }}
          >
            This is an automated message; please do not reply to this email.
          </p>
        </div>
      </div>
    </div>
  );
}

export default WeddingInviteEmail;
