import { createMiddleware } from '@tanstack/react-start';
import { getSessionFN } from './auth.functions';

export const authenticatedMiddleware = createMiddleware({
  type: 'function',
}).server(async ({ next }) => {
  const session = await getSessionFN();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  return await next({
    context: { session: session.session, user: session.user },
  });
});
