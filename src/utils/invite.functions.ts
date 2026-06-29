import { createServerFn } from '@tanstack/react-start';
import { authenticatedMiddleware } from './auth.middleware';
import { getDB } from '@/db';
import { invite } from '@/db/schema';
import { assertEventCutoffNotPassed } from '@/lib/wedding-event-details';
import {
  inviteHasPriorRsvpResponse,
  type InviteDbStatus,
} from '@/lib/invite-rsvp-status';
import { mealChoiceIdSchema } from '@/lib/wedding-meal-options';
import z from 'zod';
import { and, eq, inArray, not } from 'drizzle-orm';

export const adminListInvitesFN = createServerFn({ method: 'GET' })
  .middleware([authenticatedMiddleware])
  .handler(async () => {
    const db = getDB();
    const invites = await db.select().from(invite);
    return invites;
  });

export const adminCreateInviteFN = createServerFn({ method: 'POST' })
  .middleware([authenticatedMiddleware])
  .inputValidator(
    z.object({
      email: z.email(),
      name: z.string().min(1, 'Name is required').max(200),
    }),
  )
  .handler(async ({ data }) => {
    const db = getDB();
    const [row] = await db
      .insert(invite)
      .values({
        email: data.email.trim(),
        name: data.name.trim(),
      })
      .returning({
        id: invite.id,
        email: invite.email,
        name: invite.name,
        status: invite.status,
        createdAt: invite.createdAt,
      });

    if (row === undefined) {
      throw new Error('Failed to create invite');
    }

    return row;
  });

export const adminGetInviteFN = createServerFn({ method: 'GET' })
  .middleware([authenticatedMiddleware])
  .inputValidator(z.object({ id: z.uuid() }))
  .handler(async ({ data }) => {
    const db = getDB();
    const rows = await db
      .select()
      .from(invite)
      .where(eq(invite.id, data.id))
      .limit(1);
    return rows[0] ?? null;
  });

export const adminGetInviteDetailFN = createServerFn({ method: 'GET' })
  .middleware([authenticatedMiddleware])
  .inputValidator(z.object({ id: z.uuid() }))
  .handler(async ({ data }) => {
    const db = getDB();
    const rows = await db
      .select()
      .from(invite)
      .where(eq(invite.id, data.id))
      .limit(1);
    const inviteRow = rows[0] ?? null;
    const { inviteEmailDeliveryConfigured } = await import('./invite-resend');
    return {
      invite: inviteRow,
      emailDeliveryConfigured: inviteEmailDeliveryConfigured(),
    };
  });

export const adminUpdateInviteFN = createServerFn({ method: 'POST' })
  .middleware([authenticatedMiddleware])
  .inputValidator(
    z.object({
      id: z.uuid(),
      email: z.email(),
      name: z.string().min(1, 'Name is required').max(200),
    }),
  )
  .handler(async ({ data }) => {
    const db = getDB();
    const updated = await db
      .update(invite)
      .set({
        email: data.email.trim(),
        name: data.name.trim(),
      })
      .where(eq(invite.id, data.id))
      .returning({ id: invite.id });

    if (updated.length === 0) {
      throw new Error('Invite not found');
    }

    return updated[0];
  });

export const adminDeleteInviteFN = createServerFn({ method: 'POST' })
  .middleware([authenticatedMiddleware])
  .inputValidator(z.object({ id: z.uuid() }))
  .handler(async ({ data }) => {
    const db = getDB();
    // `spotify_requested_track.invite_id` uses ON DELETE CASCADE — requests are removed with the invite.
    const deleted = await db
      .delete(invite)
      .where(eq(invite.id, data.id))
      .returning({ id: invite.id });

    if (deleted.length === 0) {
      throw new Error('Invite not found');
    }

    return { success: true as const };
  });

export const adminSendInviteEmailFN = createServerFn({ method: 'POST' })
  .middleware([authenticatedMiddleware])
  .inputValidator(z.object({ id: z.uuid() }))
  .handler(async ({ data }) => {
    const { sendInvitationEmail } = await import('./invite-resend');
    return sendInvitationEmail(data.id);
  });

export const getInviteDetailsFN = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ id: z.uuid() }))
  .handler(async ({ data }) => {
    const db = getDB();
    const rows = await db
      .select({
        id: invite.id,
        name: invite.name,
        status: invite.status,
        diataryRequirements: invite.diataryRequirements,
        mealChoice: invite.mealChoice,
        additionalNotes: invite.additionalNotes,
      })
      .from(invite)
      .where(eq(invite.id, data.id))
      .limit(1);

    const inviteDetails = rows.length > 0 ? (rows[0] ?? null) : null;

    return inviteDetails;
  });

export const markInviteSeenFN = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ id: z.uuid() }))
  .handler(async ({ data }) => {
    const db = getDB();
    await db
      .update(invite)
      .set({
        status: 'seen',
      })
      .where(
        and(
          eq(invite.id, data.id),
          not(inArray(invite.status, ['attending', 'not-attending'])),
        ),
      )
      .limit(1);
  });

const updateInviteResponseInputSchema = z
  .object({
    id: z.uuid(),
    isAttending: z.boolean(),
    dietaryRequirements: z.string().nullable(),
    mealChoice: mealChoiceIdSchema.nullable(),
    additionalNotes: z.string().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.isAttending && data.mealChoice === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Meal choice is required.',
        path: ['mealChoice'],
      });
    }
  });

export const updateInviteResponseFN = createServerFn({ method: 'POST' })
  .inputValidator(updateInviteResponseInputSchema)
  .handler(async ({ data }) => {
    assertEventCutoffNotPassed();

    const db = getDB();
    const existingRows = await db
      .select({ status: invite.status })
      .from(invite)
      .where(eq(invite.id, data.id))
      .limit(1);
    const existing = existingRows[0];
    if (existing === undefined) {
      throw new Error('Invite not found');
    }

    const isUpdate = inviteHasPriorRsvpResponse(
      existing.status as InviteDbStatus,
    );

    if (data.isAttending) {
      await db
        .update(invite)
        .set({
          status: 'attending',
          diataryRequirements: data.dietaryRequirements?.trim() || null,
          mealChoice: data.mealChoice,
          additionalNotes: data.additionalNotes?.trim() || null,
        })
        .where(eq(invite.id, data.id))
        .limit(1);
    } else {
      /** Keep meal / dietary / notes from a prior "attending" reply — only status changes. */
      await db
        .update(invite)
        .set({ status: 'not-attending' })
        .where(eq(invite.id, data.id))
        .limit(1);
    }

    try {
      const { sendRsvpNotificationEmails } = await import('./invite-resend');
      await sendRsvpNotificationEmails({ inviteId: data.id, isUpdate });
    } catch (err) {
      console.error('RSVP notification dispatch failed:', err);
    }

    return { success: true };
  });
