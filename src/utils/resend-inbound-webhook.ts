/**
 * Resend inbound email webhook handler.
 *
 * Setup (Resend Dashboard):
 * - Webhooks → Add endpoint: https://wada.wedding/api/webhooks/resend
 *   (staging: https://staging.wada.wedding/api/webhooks/resend)
 * - Event type: email.received
 * - Store signing secret: wrangler secret put RESEND_WEBHOOK_SECRET
 * - Ensure receiving is enabled on the wada.wedding domain (MX records)
 */
import { env } from 'cloudflare:workers';
import { Resend } from 'resend';
import { getDB } from '@/db';
import { receivedEmail } from '@/db/schema';

export async function handleResendInboundWebhook(
  request: Request,
): Promise<Response> {
  const webhookSecret = env.RESEND_WEBHOOK_SECRET;
  const apiKey = env.RESEND_API_KEY;

  if (!webhookSecret || !apiKey) {
    console.error('Resend webhook: RESEND_WEBHOOK_SECRET or RESEND_API_KEY missing');
    return new Response('Webhook not configured', { status: 500 });
  }

  const payload = await request.text();
  const svixId = request.headers.get('svix-id');
  const svixTimestamp = request.headers.get('svix-timestamp');
  const svixSignature = request.headers.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Missing webhook headers', { status: 400 });
  }

  const resend = new Resend(apiKey);

  let event;
  try {
    event = resend.webhooks.verify({
      payload,
      headers: {
        id: svixId,
        timestamp: svixTimestamp,
        signature: svixSignature,
      },
      webhookSecret,
    });
  } catch (err) {
    console.error('Resend webhook verification failed:', err);
    return new Response('Invalid webhook', { status: 400 });
  }

  if (event.type !== 'email.received') {
    return new Response('OK', { status: 200 });
  }

  const { data: email, error: fetchError } = await resend.emails.receiving.get(
    event.data.email_id,
  );

  if (fetchError || !email) {
    console.error('Resend receiving.get failed:', fetchError);
    return new Response('Failed to fetch email', { status: 500 });
  }

  const db = getDB();

  try {
    await db.insert(receivedEmail).values({
      resendEmailId: event.data.email_id,
      svixId,
      messageId: event.data.message_id,
      fromAddress: event.data.from,
      subject: event.data.subject,
      toAddressesJson: JSON.stringify(event.data.to),
      ccAddressesJson:
        event.data.cc.length > 0 ? JSON.stringify(event.data.cc) : null,
      bccAddressesJson:
        event.data.bcc.length > 0 ? JSON.stringify(event.data.bcc) : null,
      htmlBody: email.html,
      textBody: email.text,
      headersJson: email.headers ? JSON.stringify(email.headers) : null,
      attachmentsJson:
        email.attachments.length > 0
          ? JSON.stringify(email.attachments)
          : null,
      receivedAt: event.data.created_at,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (
      message.includes('UNIQUE constraint failed') ||
      message.includes('unique constraint')
    ) {
      return new Response('OK', { status: 200 });
    }
    console.error('Resend webhook DB insert failed:', err);
    return new Response('Failed to store email', { status: 500 });
  }

  return new Response('OK', { status: 200 });
}
