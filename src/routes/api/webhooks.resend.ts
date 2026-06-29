import { createFileRoute } from '@tanstack/react-router';
import { handleResendInboundWebhook } from '@/utils/resend-inbound-webhook';

export const Route = createFileRoute('/api/webhooks/resend')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        return await handleResendInboundWebhook(request);
      },
    },
  },
});
