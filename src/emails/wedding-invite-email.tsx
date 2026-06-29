import {
  EVENT_WHEN_PRIMARY,
  EVENT_WHEN_TIME,
  VENUE_ADDRESS_LINES,
  VENUE_MAPS_URL,
  VENUE_NAME,
  VENUE_WEBSITE_URL,
} from '@/lib/wedding-event-details';
import {
  INVITE_EMAIL_GALLERY,
  resolveEmailPublicAssetUrl,
  siteHomeGalleryUrl,
} from '@/lib/wedding-invite-email-gallery';

export interface WeddingInviteEmailProps {
  guestName: string;
  inviteLink: string;
}

/** Matches homepage `index.tsx`: Jost labels, Cormorant Garamond display, ivory on charcoal. */
const fontSans =
  "'Jost', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
const fontSerif =
  "'Cormorant Garamond', Georgia, 'Times New Roman', Times, serif";

const pageBg = '#050508';
/** Toned backdrop / glassy card — similar to homepage overlays + gallery strip */
const cardBg = 'rgba(12, 12, 14, 0.98)';
const cardFooterBg = '#08080a';
const borderSubtle = 'rgba(255, 255, 255, 0.1)';
const textPrimary = '#ffffff';
const textBody = 'rgba(255, 255, 255, 0.92)';
const textMuted = 'rgba(255, 255, 255, 0.55)';
const textSubtle = 'rgba(255, 255, 255, 0.45)';
const accentIvory = '#f7f6f4';
const accentInk = '#141414';

const detailSurfaceBg = 'rgba(255, 255, 255, 0.04)';

const detailEyebrow = {
  margin: '0 0 8px',
  fontFamily: fontSans,
  fontSize: '10px',
  fontWeight: 500,
  letterSpacing: '0.22em',
  textTransform: 'uppercase' as const,
  color: 'rgba(255, 255, 255, 0.76)',
};

/**
 * Gallery-style invite (legacy layout). Production sends
 * {@link WeddingInviteStationeryHeroEmail} (same markup as
 * {@link WeddingInviteStationeryEmail}) via `sendInvitationEmail`; this
 * component remains for reference and optional reuse.
 */
export function WeddingInviteEmail({
  guestName,
  inviteLink,
}: WeddingInviteEmailProps) {
  const galleryPageHref = siteHomeGalleryUrl(inviteLink);

  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        width: '100%',
        fontFamily: fontSans,
        lineHeight: 1.6,
        WebkitTextSizeAdjust: '100%',
        textSizeAdjust: '100%',
        backgroundColor: pageBg,
        backgroundImage:
          'radial-gradient(ellipse 125% 90% at 50% -20%, rgba(255,255,255,0.075) 0%, transparent 50%), radial-gradient(ellipse 80% 50% at 50% 100%, rgba(0,0,0,0.35) 0%, transparent 48%)',
      }}
    >
      <table
        role="presentation"
        cellPadding={0}
        cellSpacing={0}
        border={0}
        width="100%"
        style={{
          margin: 0,
          padding: 0,
          width: '100%',
          borderCollapse: 'collapse',
        }}
      >
        <tbody>
          <tr>
            <td
              align="center"
              valign="top"
              style={{
                padding: '48px 28px',
                margin: 0,
                backgroundImage:
                  'radial-gradient(ellipse 125% 90% at 50% -20%, rgba(255,255,255,0.075) 0%, transparent 50%), radial-gradient(ellipse 80% 50% at 50% 100%, rgba(0,0,0,0.35) 0%, transparent 48%)',
                backgroundColor: pageBg,
              }}
            >
              {/* Centering shell for stubborn clients */}
              <table
                role="presentation"
                cellPadding={0}
                cellSpacing={0}
                border={0}
                width="100%"
                style={{
                  margin: '0 auto',
                  maxWidth: '600px',
                  width: '100%',
                  borderCollapse: 'collapse',
                }}
              >
                <tbody>
                  <tr>
                    <td
                      align="center"
                      valign="top"
                      style={{
                        borderRadius: '12px',
                        border: `1px solid ${borderSubtle}`,
                        boxShadow:
                          '0 4px 6px rgba(0, 0, 0, 0.06), 0 24px 80px rgba(0, 0, 0, 0.5)',
                        backgroundColor: cardBg,
                        overflow: 'hidden',
                      }}
                    >
                      {/* Hero */}
                      <div
                        style={{
                          padding: '42px 32px 32px',
                          textAlign: 'center',
                          borderBottom: `1px solid ${borderSubtle}`,
                          backgroundImage:
                            'linear-gradient(to bottom, rgba(255,255,255,0.04), transparent)',
                        }}
                      >
                        <p
                          style={{
                            margin: '0 0 16px',
                            fontFamily: fontSans,
                            fontSize: '11px',
                            fontWeight: 500,
                            letterSpacing: '0.28em',
                            textTransform: 'uppercase',
                            color: textMuted,
                            lineHeight: 1.45,
                          }}
                        >
                          <span style={{ opacity: 0.55 }} aria-hidden>
                            ❧{' '}
                          </span>
                          You&apos;re invited
                          <span style={{ opacity: 0.55 }} aria-hidden>
                            {' '}
                            ❧
                          </span>
                        </p>
                        <div
                          style={{
                            maxWidth: '320px',
                            margin: '0 auto 28px',
                            borderBottom: `1px solid rgba(255,255,255,0.06)`,
                            height: '1px',
                          }}
                        />
                        <h1
                          style={{
                            margin: 0,
                            padding: '0 4px',
                            fontFamily: fontSerif,
                            fontSize: '42px',
                            fontWeight: 500,
                            lineHeight: 1.04,
                            letterSpacing: '-0.03em',
                            color: textPrimary,
                            textAlign: 'center',
                          }}
                        >
                          <span style={{ display: 'block' }}>
                            Vada{' '}
                            <span
                              style={{
                                fontWeight: 400,
                                fontStyle: 'italic',
                              }}
                            >
                              &amp;
                            </span>
                          </span>
                          <span
                            style={{ display: 'block', marginTop: '0.1em' }}
                          >
                            Wade
                          </span>
                        </h1>
                      </div>

                      {/* Gallery */}
                      <div
                        style={{
                          padding: '26px 20px 30px',
                          borderBottom: `1px solid ${borderSubtle}`,
                          backgroundImage:
                            'linear-gradient(to bottom, rgba(0,0,0,0.24), rgba(0,0,0,0.12))',
                        }}
                      >
                        <table
                          role="presentation"
                          cellPadding={0}
                          cellSpacing={0}
                          width="100%"
                          style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                          }}
                        >
                          <tbody>
                            <tr>
                              {INVITE_EMAIL_GALLERY.map((item) => (
                                <td
                                  key={item.pathname}
                                  style={{
                                    width: '33.33%',
                                    padding: '0 6px',
                                    verticalAlign: 'top',
                                  }}
                                >
                                  <a
                                    href={galleryPageHref}
                                    style={{
                                      textDecoration: 'none',
                                      outline: 'none',
                                      color: 'inherit',
                                    }}
                                  >
                                    <img
                                      src={resolveEmailPublicAssetUrl(
                                        inviteLink,
                                        item.pathname,
                                      )}
                                      alt={item.alt}
                                      width={180}
                                      style={{
                                        display: 'block',
                                        width: '100%',
                                        maxWidth: '180px',
                                        height: 'auto',
                                        margin: '0 auto',
                                        borderRadius: '8px',
                                        border: `1px solid ${borderSubtle}`,
                                        boxShadow:
                                          '0 8px 24px rgba(0, 0, 0, 0.35)',
                                      }}
                                    />
                                  </a>
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                        <p
                          style={{
                            margin: '20px auto 0',
                            padding: '14px 8px 0',
                            fontFamily: fontSans,
                            fontSize: '10px',
                            fontWeight: 500,
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            color: textMuted,
                            lineHeight: 1.55,
                            textAlign: 'center',
                            maxWidth: '320px',
                            borderTop: `1px solid rgba(255,255,255,0.06)`,
                          }}
                        >
                          From our engagement{' '}
                          <span aria-hidden style={{ opacity: 0.45 }}>
                            ·
                          </span>{' '}
                          visit{' '}
                          <a
                            href={galleryPageHref}
                            style={{
                              color: textPrimary,
                              textDecoration: 'underline',
                            }}
                          >
                            the gallery
                          </a>
                        </p>
                      </div>

                      {/* Letter body */}
                      <div
                        style={{
                          padding: '44px 40px 46px',
                          textAlign: 'center',
                        }}
                      >
                        <p
                          style={{
                            margin: '0 0 26px',
                            fontFamily: fontSerif,
                            fontSize: '19px',
                            fontStyle: 'italic',
                            fontWeight: 400,
                            color: textBody,
                            lineHeight: 1.5,
                            textAlign: 'center',
                          }}
                        >
                          Hi {guestName},
                        </p>

                        <p
                          style={{
                            margin: '0 0 14px',
                            fontFamily: fontSerif,
                            fontSize: '17px',
                            fontWeight: 400,
                            color: textBody,
                            lineHeight: 1.65,
                            textAlign: 'center',
                            maxWidth: '420px',
                            marginLeft: 'auto',
                            marginRight: 'auto',
                          }}
                        >
                          We&apos;d love for you to celebrate with us.
                        </p>

                        {/* Event details: static two columns */}
                        <div
                          style={{
                            margin: '36px 0 38px',
                            padding: '32px 28px',
                            textAlign: 'center',
                            backgroundColor: detailSurfaceBg,
                            borderRadius: '10px',
                            border: `1px solid ${borderSubtle}`,
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                          }}
                        >
                          <h2
                            style={{
                              margin: '0 0 28px',
                              fontFamily: fontSerif,
                              fontSize: '21px',
                              fontWeight: 500,
                              color: textBody,
                            }}
                          >
                            Event details
                          </h2>

                          <table
                            role="presentation"
                            cellPadding={0}
                            cellSpacing={0}
                            width="100%"
                            align="center"
                            style={{
                              width: '100%',
                              margin: '0 auto',
                              maxWidth: '480px',
                              borderCollapse: 'collapse',
                            }}
                          >
                            <tbody>
                              <tr>
                                <td
                                  valign="top"
                                  width="50%"
                                  style={{
                                    padding: '4px 20px 0 0',
                                    borderRight: `1px solid ${borderSubtle}`,
                                    verticalAlign: 'top',
                                  }}
                                >
                                  <div style={{ textAlign: 'center' }}>
                                    <p style={detailEyebrow}>When</p>
                                    <p
                                      style={{
                                        margin: '0',
                                        fontFamily: fontSerif,
                                        fontSize: '17px',
                                        fontWeight: 500,
                                        color: textPrimary,
                                        lineHeight: 1.4,
                                      }}
                                    >
                                      {EVENT_WHEN_PRIMARY}
                                    </p>
                                    <p
                                      style={{
                                        margin: '8px 0 0',
                                        fontFamily: fontSans,
                                        fontSize: '14px',
                                        color: textMuted,
                                        letterSpacing: '0.06em',
                                      }}
                                    >
                                      {EVENT_WHEN_TIME}
                                    </p>
                                  </div>
                                </td>
                                <td
                                  valign="top"
                                  width="50%"
                                  style={{
                                    padding: '4px 0 0 20px',
                                    verticalAlign: 'top',
                                  }}
                                >
                                  <div style={{ textAlign: 'center' }}>
                                    <p style={detailEyebrow}>Venue</p>
                                    <p
                                      style={{
                                        margin: '0',
                                        fontFamily: fontSerif,
                                        fontSize: '17px',
                                        fontWeight: 500,
                                        color: textPrimary,
                                        lineHeight: 1.4,
                                      }}
                                    >
                                      {VENUE_NAME}
                                    </p>
                                    {VENUE_ADDRESS_LINES.map((line) => (
                                      <p
                                        key={line}
                                        style={{
                                          margin: '6px 0 0',
                                          fontFamily: fontSans,
                                          fontSize: '13px',
                                          lineHeight: 1.5,
                                          textAlign: 'center',
                                        }}
                                      >
                                        <a
                                          href={VENUE_MAPS_URL}
                                          style={{
                                            color: textPrimary,
                                            textDecoration: 'underline',
                                            fontFamily: fontSans,
                                            fontSize: '13px',
                                          }}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          aria-label={`Open directions to ${line} (${VENUE_NAME}) in Maps`}
                                        >
                                          {line}
                                        </a>
                                      </p>
                                    ))}
                                    <p
                                      style={{
                                        margin: '18px 0 0',
                                        fontFamily: fontSans,
                                        fontSize: '13px',
                                        lineHeight: 1.55,
                                        color: textMuted,
                                        textAlign: 'center',
                                      }}
                                    >
                                      <a
                                        href={VENUE_WEBSITE_URL}
                                        style={{
                                          color: textPrimary,
                                          textDecoration: 'underline',
                                        }}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={`${VENUE_NAME} venue website`}
                                      >
                                        Website
                                      </a>
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <p
                          style={{
                            margin: '0 0 32px',
                            fontFamily: fontSerif,
                            fontSize: '16px',
                            fontWeight: 400,
                            color: textBody,
                            lineHeight: 1.6,
                            textAlign: 'center',
                          }}
                        >
                          Please RSVP with your personal link below.
                        </p>

                        <div
                          style={{ textAlign: 'center', marginBottom: '34px' }}
                        >
                          <table
                            role="presentation"
                            cellPadding={0}
                            cellSpacing={0}
                            border={0}
                            align="center"
                            style={{ margin: '0 auto' }}
                          >
                            <tbody>
                              <tr>
                                <td
                                  align="center"
                                  style={{
                                    borderRadius: '6px',
                                    backgroundColor: accentIvory,
                                    boxShadow:
                                      '0 1px 0 rgba(255,255,255,0.06) inset',
                                  }}
                                >
                                  <a
                                    href={inviteLink}
                                    style={{
                                      display: 'inline-block',
                                      padding: '16px 40px',
                                      backgroundColor: accentIvory,
                                      color: accentInk,
                                      fontFamily: fontSans,
                                      fontSize: '12px',
                                      fontWeight: 500,
                                      letterSpacing: '0.22em',
                                      textTransform: 'uppercase',
                                      textDecoration: 'none',
                                      borderRadius: '6px',
                                      border: `1px solid rgba(255,255,255,0.08)`,
                                    }}
                                  >
                                    RSVP
                                  </a>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <p
                          style={{
                            margin: '0 0 28px',
                            fontFamily: fontSans,
                            fontSize: '12px',
                            fontWeight: 400,
                            color: textMuted,
                            lineHeight: 1.65,
                            wordBreak: 'break-word',
                            overflowWrap: 'anywhere',
                            textAlign: 'center',
                          }}
                        >
                          If the button doesn&apos;t work, copy this link into
                          your browser:
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
                            margin: '0 0 30px',
                            fontFamily: fontSerif,
                            fontSize: '15px',
                            fontStyle: 'italic',
                            color: textMuted,
                            lineHeight: 1.6,
                            textAlign: 'center',
                          }}
                        >
                          If you didn&apos;t expect this invitation, you can
                          safely ignore this email.
                        </p>

                        <div
                          style={{
                            borderTop: `1px solid ${borderSubtle}`,
                            paddingTop: '28px',
                          }}
                        >
                          <p
                            style={{
                              margin: '0',
                              fontFamily: fontSans,
                              fontSize: '12px',
                              color: textSubtle,
                              lineHeight: 1.6,
                              textAlign: 'center',
                            }}
                          >
                            <span style={{ color: textMuted, fontWeight: 500 }}>
                              Security tip:
                            </span>{' '}
                            This link is unique to you. Don&apos;t share it with
                            anyone.
                          </p>
                        </div>
                      </div>

                      <div
                        style={{
                          padding: '26px 40px 28px',
                          backgroundColor: cardFooterBg,
                          borderTop: `1px solid ${borderSubtle}`,
                          backgroundImage:
                            'linear-gradient(to bottom, rgba(255,255,255,0.02), transparent)',
                          textAlign: 'center',
                        }}
                      >
                        <p
                          style={{
                            margin: '0',
                            fontFamily: fontSans,
                            fontSize: '10px',
                            fontWeight: 400,
                            letterSpacing: '0.12em',
                            color: textSubtle,
                            lineHeight: 1.6,
                            textTransform: 'uppercase',
                          }}
                        >
                          This is an automated message — please don&apos;t reply
                          to this email.
                        </p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default WeddingInviteEmail;
