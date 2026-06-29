import { WeddingInviteStationeryEmail } from '@/emails/wedding-invite-email-stationery';

/**
 * Gmail and many webmail clients ignore or strip full-bleed CSS backgrounds,
 * absolutely positioned layers, and `filter: blur()`, so an engagement photo
 * hero does not reliably appear. This template keeps the hero name for imports
 * but matches {@link WeddingInviteStationeryEmail} (dark radial shell only).
 */
export const WeddingInviteStationeryHeroEmail = WeddingInviteStationeryEmail;

export default WeddingInviteStationeryEmail;
