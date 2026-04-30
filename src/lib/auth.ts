import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { getDB } from '@/db';
import { admin, captcha } from 'better-auth/plugins';
import { env } from 'cloudflare:workers';

export const auth = betterAuth({
  database: drizzleAdapter(getDB(), {
    provider: 'sqlite',
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: false,
  },
  plugins: [
    admin(),
    captcha({
      provider: 'cloudflare-turnstile',
      secretKey: env.TURNSTILE_SECRET_KEY,
    }),
    tanstackStartCookies(), // Handle cookies automatically for TanStack Start
  ],
});
