/**
 * Resend + Worker env — imported only via dynamic `import()` from server handlers
 * so `cloudflare:workers` is not pulled into the client bundle.
 */
import { render } from '@react-email/render';
import { env } from 'cloudflare:workers';
import { Resend } from 'resend';
import { getDB } from '@/db';
import { invite } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { WeddingInviteEmail } from '@/emails/wedding-invite-email';

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
    <WeddingInviteEmail guestName={row.name} inviteLink={invitationUrl} />,
  );

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from,
    to: row.email,
    subject: "You're invited - Wade & Vada",
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
