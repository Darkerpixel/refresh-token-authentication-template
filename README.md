## Simple Refresh token Authentication template

It uses a randomly generated `session_token` (also known as `refresh_token`) saved in a database and a `access_token` created using jwt to authenticate users.

## How to try it out

Prepare database

=> docker compose up -d
=> npm install
=> npx prisma db push
=> npx prisma generate

Run the app

=> npm run dev

Seed database with premade data (`WARNING`: seeding will delete all database entries)

- admin@example.com role=(ADMIN) password `123456789`
- employee@example.com role=(EMPLOYEE) password `123456789`
- user@example.com role=(USER) password `123456789`

=> npx tsx prisma/seed.ts

Required `.env` variables

- DATABASE_URL="postgresql://postgres:postgres@localhost:5432/notesdb"
- JWT_SECRET="run the following command in your terminal => `  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"  `"

## How it works

### Quick version

- `access_token` (JWT, 15 min) authenticates every request. Never touches the database.
- `session_token` (random string, 7 days, stored in `Session` table) is used only to mint(create) new `access_token`s.
- `proxy.ts` refreshes `access_token` from `session_token` on every request — it never blocks anything.
- Real enforcement happens in `lib/auth.ts` (`getCurrentUser()`) and inside each Server Action.
- Authorization = role check (`can()`, via `lib/permissions.ts`) + ownership check (written by hand, per action).
- Revoke one login early => delete its `Session` row. Revoke all logins at once => rotate `JWT_SECRET`.

Components =>

- @/proxy.ts
- @/lib/jwt.ts
- @/lib/auth.ts
- @/lib/permissions.ts
- @/lib/prisma.ts
- @/app/actions.ts

(The other files are examples of how to use the authentication)

### Detailed version

`Only the access_token` provided by the client in the cookies authenticates a user.
At any request `proxy.ts` checks the cookies for `session_token` and `access_token`.
If only `session_token` is `provided/valid` it will generate and set a new `access_token` in the clients cookies.
`proxy.ts` never rejects a request — it only refreshes the `access_token` cookie when possible. All actual enforcement happens inside `lib/auth.ts` and the Server Actions themselves.

`session_token` lives in the `Session` table, expires after 7 days, and is checked against the database. Deleting its row logs the user out and is the only way to revoke an active login before expiry.

`access_token` is a signed JWT, expires after 15 minutes, and is never checked against the database — only its signature and embedded expiry are verified. It cannot be revoked individually before it expires; the only way to invalidate every issued `access_token` at once is to rotate `JWT_SECRET`.

`lib/auth.ts` exports:

- `createSession(userId)` — generates both tokens, writes the `Session` row, sets both cookies.
- `createAccessToken(sessionToken)` — verifies a `session_token` against the database, issues and sets a fresh `access_token`.
- `getCurrentUser()` — reads `access_token` from cookies, verifies it, returns the `userId` or `null`. Does not query the database.

`lib/permissions.ts` is the single source of truth for role-based access. Each action (e.g. `"note:delete:own"`) maps to the list of roles allowed to perform it. `can(role, action)` checks a role against that list.

Authorization has two layers, both required:

1. Role check — `can(user.role, "action:name")`, via `lib/permissions.ts`.
2. Ownership check — e.g. `note.userId === user.id`, written inline in the Server Action, since this needs data the permission map can't express.

Adding a new role => add it to `enum Role` in `schema.prisma`, then add it to whichever actions in `lib/permissions.ts` should grant it.

Adding a new protected action => add an entry to `permissions.ts`, then call `can(user.role, "your:action")` inside the Server Action before running it.
