/** Matches `invite.status` in `src/db/schema/invite.ts`. */
export type InviteDbStatus =
  | 'not-sent'
  | 'sent'
  | 'seen'
  | 'attending'
  | 'not-attending';

/** True when the guest has already submitted attending / not-attending at least once. */
export function inviteHasPriorRsvpResponse(status: InviteDbStatus): boolean {
  return status === 'attending' || status === 'not-attending';
}
