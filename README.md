# SaaS Boilerplate

A [T3 Stack](https://create.t3.gg/) starting point for a SaaS product: Next.js 15
App Router, React 19, TypeScript, Tailwind CSS v4, tRPC v11, Drizzle ORM on
Postgres, and Better Auth.

Authentication ships working, with three ways in:

- **Email code** — passwordless 4-digit OTP, delivered by Resend
- **Continue with Google** — the OAuth redirect flow, on the login page
- **Google One Tap** — the floating prompt, on the marketing home page only

## Prerequisites

- **Node.js 24** — what CI runs
- **pnpm 11.20.0** — pinned via `packageManager` in `package.json`
- **Docker** — runs the local Postgres

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Create your `.env`

```bash
cp .env.example .env
```

`.env.example` is the source of truth for every variable and carries notes on
each. Anything missing or malformed fails at boot rather than at runtime —
`src/env.js` validates the whole set on startup, so a bad value surfaces the
moment you run `pnpm dev`, naming the variable.

### 3. Configure Google OAuth

Both Google sign-in routes share one OAuth client. In the
[Google Cloud Console](https://console.cloud.google.com/apis/credentials),
create a credential of type **Web application**, then fill in two separate
fields.

**Authorized redirect URIs** — used by the "Continue with Google" button:

```text
http://localhost:3000/api/auth/callback/google
```

**Authorized JavaScript origins** — used by Google One Tap. Add **both** of
these:

```text
http://localhost:3000
http://localhost
```

> **Both entries are required, and the second one is the surprising one.**
> Google Identity Services validates the bare `http://localhost` origin in
> addition to the one your dev server actually serves from. With only
> `http://localhost:3000` registered, One Tap fails with
> `[GSI_LOGGER]: The given origin is not allowed for the given client ID`,
> which reads exactly like the origin was never added at all.
>
> `localhost` is the sole exception to Google's HTTPS-only rule for origins.
> There are no wildcards, so every origin One Tap runs on — including each
> deployed environment — needs its own entry. `127.0.0.1:3000` and your
> machine's LAN address are _different_ origins to Google and would each need
> adding separately.

Then copy the credentials into `.env`:

```bash
BETTER_AUTH_GOOGLE_CLIENT_ID=""      # the client ID
BETTER_AUTH_GOOGLE_CLIENT_SECRET=""  # the client secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=""      # the same client ID again — see below
```

The client ID appears twice on purpose. One Tap runs entirely in the browser
and needs the ID before any request reaches the server, so it cannot read the
server-only variable. A client ID is public by design — it already travels in
the query string of every OAuth redirect — so exposing it costs nothing, while
the secret stays server-side. **Keep the two in sync.** They are validated
separately, so a mismatch is not a boot failure: One Tap simply returns a token
whose audience the server then rejects.

After saving changes in the Google Console, **allow time for them to
propagate** — Google documents anywhere from 5 minutes to a few hours. Retesting
inside that window produces the same origin error as a missing entry, so give it
a few minutes and hard-reload before concluding anything is wrong.

### 4. Start the database and apply the schema

```bash
pnpm db:start   # docker compose up -d
pnpm db:push    # push the Drizzle schema
```

### 5. Run it

```bash
pnpm dev
```

Open <http://localhost:3000>.

## Testing Google One Tap locally

The prompt is deliberately mounted on the marketing home page only — not on the
login page, where it would duplicate the Google button already offered, and not
on any other route. Adding a page does not opt it in; see
`src/components/auth/google-one-tap.tsx` for why that is placement rather than
configuration.

Three things make the prompt silently not appear, none of which log an error:

- **You must be signed into a Google account in that browser profile.** No
  Google session means no prompt and no message.
- **Incognito will not work** — the usual instinct for a clean slate, but an
  incognito window has no Google session. Use a separate Chrome profile signed
  into a test account instead.
- **Chrome applies a cooldown after repeated dismissals.** A few dismissals into
  iterating, the prompt stops returning. Reset it at
  `chrome://settings/content/federatedIdentityApi`.

The component logs why the prompt closed to the console in development, which is
otherwise the only signal available.

**There is no sign-out UI yet.** Once One Tap succeeds you hold a session, the
prompt correctly hides itself, and there is no way back through the UI. To test
again, delete the `better-auth.session_token` cookie for `http://localhost:3000`
in DevTools → Application → Cookies, then reload.

When the prompt does open it covers the navbar's "Log in" and "Get started"
buttons. That overlap is expected: under FedCM the browser owns the prompt's
position, so it cannot be moved or restyled.

## Scripts

| Command                                | What it does                            |
| -------------------------------------- | --------------------------------------- |
| `pnpm dev`                             | Dev server with Turbopack               |
| `pnpm build` / `pnpm start`            | Production build and serve              |
| `pnpm check`                           | Lint and typecheck together             |
| `pnpm test`                            | Vitest, once                            |
| `pnpm test:watch`                      | Vitest, watching                        |
| `pnpm test:coverage`                   | Vitest with coverage                    |
| `pnpm format:write`                    | Prettier over the repo                  |
| `pnpm db:start` / `pnpm db:stop`       | Start or stop the local Postgres        |
| `pnpm db:push`                         | Push the Drizzle schema to the database |
| `pnpm db:generate` / `pnpm db:migrate` | Generate and run migrations             |
| `pnpm db:studio`                       | Drizzle Studio                          |

## Rebranding a fork

`pnpm setup` rewrites the placeholder name, author and domain across the
files that carry them:

```bash
pnpm setup "Your App" "Your Name" "yourapp.com"
```

Review the result with `git diff` before committing. The landing page copy is
inherited placeholder text from the
[shadcn-landing-page](https://github.com/nobruf/shadcn-landing-page) template
and is meant to be replaced.

## Learn more

- [T3 Stack](https://create.t3.gg/) · [Next.js](https://nextjs.org) · [Drizzle](https://orm.drizzle.team) · [tRPC](https://trpc.io) · [Tailwind CSS](https://tailwindcss.com)
- [Better Auth](https://www.better-auth.com/docs) — auth configuration lives in `src/server/better-auth/`
- [Google One Tap](https://developers.google.com/identity/gsi/web/guides/overview)

## Deploying

Follow the T3 guides for [Vercel](https://create.t3.gg/en/deployment/vercel),
[Netlify](https://create.t3.gg/en/deployment/netlify) or
[Docker](https://create.t3.gg/en/deployment/docker).

Before going live, remember that every deployed origin needs its own entry under
**Authorized JavaScript origins**, and that the OTP send rate limit is held in
memory by default — exact on one container, approximate behind several. A
deployment that cares should move `rateLimit.storage` to `"database"` in
`src/server/better-auth/config.ts`.
