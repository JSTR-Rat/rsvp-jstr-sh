import { createFileRoute, Outlet } from '@tanstack/react-router';
import { z } from 'zod';

const inviteIdParamsSchema = z.object({
  inviteID: z.uuid(),
});

export const Route = createFileRoute('/_authed/dashboard/invites/$inviteID')({
  params: inviteIdParamsSchema,
  component: InviteIdLayout,
});

function InviteIdLayout() {
  return <Outlet />;
}
