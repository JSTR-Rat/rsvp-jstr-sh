/**
 * Resend + Worker env — imported only via dynamic `import()` from server handlers
 * so `cloudflare:workers` is not pulled into the client bundle.
 */
import { render } from '@react-email/render';
import { env } from 'cloudflare:workers';
import { Resend } from 'resend';
import { getDB } from '@/db';
import { invite, user } from '@/db/schema';
import {
  WeddingAdminRsvpEmail,
  WeddingInviteeRsvpEmail,
  type RsvpEmailDetails,
} from '@/emails/wedding-rsvp-email-stationery';
import { WeddingInviteStationeryHeroEmail } from '@/emails/wedding-invite-email-stationery-hero';
import { mealChoiceLabel } from '@/lib/wedding-meal-options';
import { eq, isNull, or } from 'drizzle-orm';

function publicAppOrigin(): string {
  const raw = env.BETTER_AUTH_URL;
  if (!raw || typeof raw !== 'string') {
    throw new Error('BETTER_AUTH_URL is not configured');
  }
  return raw.replace(/\/$/, '');
}

export function inviteEmailDeliveryConfigured(): boolean {
  const from = env.RESEND_FROM_EMAIL;
  return Boolean(
    env.RESEND_API_KEY && typeof from === 'string' && from.length > 0,
  );
}

export async function sendInvitationEmail(
  inviteId: string,
): Promise<{ success: true }> {
  const apiKey = env.RESEND_API_KEY;
  const from = env.RESEND_FROM_EMAIL;
  if (!apiKey || !from || typeof from !== 'string') {
    throw new Error('Email delivery is not configured (Resend).');
  }

  const db = getDB();
  const rows = await db
    .select()
    .from(invite)
    .where(eq(invite.id, inviteId))
    .limit(1);
  const row = rows[0];
  if (row === undefined) {
    throw new Error('Invite not found');
  }

  const invitationUrl = `${publicAppOrigin()}/invitation/${row.id}`;

  const html = await render(
    <WeddingInviteStationeryHeroEmail
      guestName={row.name}
      inviteLink={invitationUrl}
    />,
  );

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from,
    to: row.email,
    subject: "You're invited - Vada & Wade",
    html,
  });

  if (error) {
    console.error('Resend error:', error);
    const msg =
      error &&
      typeof error === 'object' &&
      'message' in error &&
      typeof (error as { message: unknown }).message === 'string'
        ? (error as { message: string }).message
        : 'Failed to send email';
    throw new Error(msg);
  }

  if (row.status === 'not-sent') {
    await db
      .update(invite)
      .set({ status: 'sent' })
      .where(eq(invite.id, row.id));
  }

  return { success: true as const };
}

type InviteRow = typeof invite.$inferSelect;

function buildRsvpEmailDetails(row: InviteRow): RsvpEmailDetails {
  return {
    guestName: row.name,
    guestEmail: row.email,
    isAttending: row.status === 'attending',
    mealChoiceLabel: mealChoiceLabel(row.mealChoice),
    dietaryRequirements: row.diataryRequirements,
    additionalNotes: row.additionalNotes,
  };
}

/** Best-effort RSVP notifications — never throws; logs Resend / render failures. */
export async function sendRsvpNotificationEmails({
  inviteId,
  isUpdate,
}: {
  inviteId: string;
  isUpdate: boolean;
}): Promise<void> {
  if (!inviteEmailDeliveryConfigured()) {
    return;
  }

  const apiKey = env.RESEND_API_KEY;
  const from = env.RESEND_FROM_EMAIL;
  if (!apiKey || !from || typeof from !== 'string') {
    return;
  }

  let origin: string;
  try {
    origin = publicAppOrigin();
  } catch (err) {
    console.error('RSVP notification: BETTER_AUTH_URL not configured', err);
    return;
  }

  const db = getDB();
  const rows = await db
    .select()
    .from(invite)
    .where(eq(invite.id, inviteId))
    .limit(1);
  const row = rows[0];
  if (row === undefined) {
    console.error('RSVP notification: invite not found', inviteId);
    return;
  }

  const invitationUrl = `${origin}/invitation/${row.id}`;
  const dashboardUrl = `${origin}/dashboard/invites/${row.id}`;
  const details = buildRsvpEmailDetails(row);
  const resend = new Resend(apiKey);

  try {
    const inviteeKind = isUpdate ? 'updated' : 'received';
    const inviteeSubject = isUpdate
      ? 'Your RSVP has been updated - Vada & Wade'
      : "We've received your RSVP - Vada & Wade";
    const inviteeHtml = await render(
      <WeddingInviteeRsvpEmail
        kind={inviteeKind}
        inviteLink={invitationUrl}
        {...details}
      />,
    );
    const { error: inviteeError } = await resend.emails.send({
      from,
      to: row.email,
      subject: inviteeSubject,
      html: inviteeHtml,
    });
    if (inviteeError) {
      console.error('RSVP invitee notification Resend error:', inviteeError);
    }
  } catch (err) {
    console.error('RSVP invitee notification failed:', err);
  }

  try {
    const adminRows = await db
      .select({ email: user.email })
      .from(user)
      .where(or(eq(user.banned, false), isNull(user.banned)));

    const adminEmails = [
      ...new Set(
        adminRows
          .map((adminRow) => adminRow.email.trim())
          .filter((email) => email.length > 0),
      ),
    ];
    if (adminEmails.length === 0) {
      return;
    }

    const adminKind = isUpdate ? 'updated' : 'new';
    const adminSubject = isUpdate
      ? `RSVP updated for ${row.name} - Vada & Wade`
      : `New RSVP from ${row.name} - Vada & Wade`;
    const adminHtml = await render(
      <WeddingAdminRsvpEmail
        kind={adminKind}
        dashboardLink={dashboardUrl}
        {...details}
      />,
    );
    const { error: adminError } = await resend.emails.send({
      from,
      to: adminEmails,
      subject: adminSubject,
      html: adminHtml,
    });
    if (adminError) {
      console.error('RSVP admin notification Resend error:', adminError);
    }
  } catch (err) {
    console.error('RSVP admin notification failed:', err);
  }
}
