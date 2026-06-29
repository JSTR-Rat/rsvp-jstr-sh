import { sql } from 'drizzle-orm';
import { sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const receivedEmail = sqliteTable(
  'received_email',
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    resendEmailId: text('resend_email_id').notNull(),
    svixId: text('svix_id').notNull(),
    messageId: text('message_id'),
    fromAddress: text('from_address').notNull(),
    subject: text('subject').notNull(),
    toAddressesJson: text('to_addresses_json').notNull(),
    ccAddressesJson: text('cc_addresses_json'),
    bccAddressesJson: text('bcc_addresses_json'),
    htmlBody: text('html_body'),
    textBody: text('text_body'),
    headersJson: text('headers_json'),
    attachmentsJson: text('attachments_json'),
    receivedAt: text('received_at').notNull(),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`)
      .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [
    uniqueIndex('received_email_resend_email_id_idx').on(table.resendEmailId),
    uniqueIndex('received_email_svix_id_idx').on(table.svixId),
  ],
);
