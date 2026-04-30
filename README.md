# rsvp-jstr-sh

Wedding RSVP site built with [TanStack Start](https://tanstack.com/start), React, and Tailwind CSS. It runs on [Cloudflare Workers](https://developers.cloudflare.com/workers/) with [D1](https://developers.cloudflare.com/d1/) and [Drizzle ORM](https://orm.drizzle.team/). Auth uses [better-auth](https://www.better-auth.com/).

## Development

```bash
pnpm install
pnpm dev
```

The dev server listens on port 3000.

## Tests

```bash
pnpm test
```

## Database

Generate migrations after schema changes:

```bash
pnpm db:generate
```

Apply migrations to local D1 (see `wrangler.jsonc` for bindings):

```bash
pnpm db:migrate:local
```

## Build and deploy

Staging and production use mode-specific Vite builds and `wrangler deploy`. See `package.json` for `build:staging`, `build:production`, `deploy:staging`, and `deploy:production`.

Cloudflare types for bindings:

```bash
pnpm cf-typegen
```
