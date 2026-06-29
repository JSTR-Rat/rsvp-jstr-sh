import { createServerFn } from '@tanstack/react-start';
import { env } from 'cloudflare:workers';
import { desc, eq } from 'drizzle-orm';
import { Resend } from 'resend';
import z from 'zod';
import { getDB } from '@/db';
import { receivedEmail } from '@/db/schema';
import { authenticatedMiddleware } from './auth.middleware';

export type ReceivedEmailListItem = {
  id: string;
  fromAddress: string;
  subject: string;
  receivedAt: string;
};

export const adminListReceivedEmailsFN = createServerFn({ method: 'GET' })
  .middleware([authenticatedMiddleware])
  .handler(async (): Promise<ReceivedEmailListItem[]> => {
    const db = getDB();
    const rows = await db
      .select({
        id: receivedEmail.id,
        fromAddress: receivedEmail.fromAddress,
        subject: receivedEmail.subject,
        receivedAt: receivedEmail.receivedAt,
      })
      .from(receivedEmail)
      .orderBy(desc(receivedEmail.receivedAt));

    return rows;
  });

export const adminGetReceivedEmailFN = createServerFn({ method: 'GET' })
  .middleware([authenticatedMiddleware])
  .inputValidator(z.object({ id: z.uuid() }))
  .handler(async ({ data }) => {
    const db = getDB();
    const [row] = await db
      .select()
      .from(receivedEmail)
      .where(eq(receivedEmail.id, data.id))
      .limit(1);

    if (row === undefined) {
      return { email: null };
    }

    return { email: row };
  });

export const adminGetReceivedEmailAttachmentUrlFN = createServerFn({
  method: 'GET',
})
  .middleware([authenticatedMiddleware])
  .inputValidator(
    z.object({
      emailId: z.uuid(),
      attachmentId: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const db = getDB();
    const [row] = await db
      .select({
        resendEmailId: receivedEmail.resendEmailId,
        attachmentsJson: receivedEmail.attachmentsJson,
      })
      .from(receivedEmail)
      .where(eq(receivedEmail.id, data.emailId))
      .limit(1);

    if (row === undefined) {
      throw new Error('Received email not found');
    }

    const attachments = row.attachmentsJson
      ? (JSON.parse(row.attachmentsJson) as Array<{ id: string }>)
      : [];
    const attachment = attachments.find((a) => a.id === data.attachmentId);
    if (!attachment) {
      throw new Error('Attachment not found');
    }

    const apiKey = env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const resend = new Resend(apiKey);
    const { data: attachmentData, error } =
      await resend.emails.receiving.attachments.get({
        emailId: row.resendEmailId,
        id: data.attachmentId,
      });

    if (error || !attachmentData) {
      throw new Error(error?.message ?? 'Failed to fetch attachment');
    }

    return { downloadUrl: attachmentData.download_url };
  });
