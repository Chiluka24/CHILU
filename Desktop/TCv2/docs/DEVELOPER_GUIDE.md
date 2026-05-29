# Developer Guide

Quick lookup table for common tasks. For *why* the structure looks this way, see [ARCHITECTURE.md](../ARCHITECTURE.md).

## Onboarding checklist

- [ ] Read the `README.md` "Where do I make changes?" section
- [ ] Read sections 1 and 2 of `ARCHITECTURE.md` (layering rules + request lifecycle)
- [ ] Run `npm install --legacy-peer-deps`
- [ ] Copy `.env.example` → `.env`, generate secrets with `npm run secrets:generate`
- [ ] Set `MONGO_URI` (a local MongoDB or Atlas free tier)
- [ ] `npm run db:seed` and check that a demo user is created
- [ ] `npm run dev` and open http://127.0.0.1:9090
- [ ] Log in as the seeded demo user — explore the dashboard, links, analytics tabs

## Common tasks

### Add a route
1. Find the right file in `server/routes/` (e.g. `links.routes.ts` for `/api/links/*`)
2. Add the handler — use `authenticateToken` for auth, rate limiters from `server/config/rate-limits.ts`
3. Return via `sendSuccess(res, data)` for uniform envelopes
4. Need a brand-new domain? New file + register in `server/routes/index.ts` (2-line change)

### Add a Mongoose field
1. Edit the interface in `server/models/interfaces.ts`
2. Edit the schema in `server/models/<Model>.ts` (add the field, index it if it'll be queried)
3. If it needs to be sent to the client, surface it in the relevant route handler

### Add a new model
1. Add interface to `server/models/interfaces.ts`
2. Create `server/models/Foo.ts` (mirror the pattern of `User.ts`)
3. Re-export from `server/models/index.ts`

### Add a frontend page
1. Pick the feature folder under `client/src/pages/<group>/`
2. Add the `.tsx` file
3. Register the route in `client/src/App.tsx` (use `lazy()` for code splitting)
4. All HTTP from the page goes through `client/src/lib/api.ts`

### Add a shared component
1. Pick the bucket under `client/src/components/`:
   - `layout/` — page-shell components
   - `routing/` — Route guards + ErrorBoundary
   - `ui/` — primitive widgets (Dropdown, Modal …)
   - `icons/` — icon collections
   - `links/` — link-list specific (CollectionItem, DnD …)
   - `appearance/` — preview + theming
2. If it's used by only one page, keep it inside the page folder instead

### Change rate limits
- Edit `server/config/rate-limits.ts` — every limiter is a named export

### Change a default value
- App-wide defaults live in `server/config/constants.ts`
- Auth-related defaults live in `server/config/auth-config.ts`
- Env-derived values live in `server/config/env.ts`

### Add a startup security check
- Edit `server/middleware/security.ts` → `validateEnvironmentSecurity` / `validateDatabaseSecurity`

### Add an Express middleware
- One file per concern under `server/middleware/`
- Wire it into the chain in `server/app.ts`

## File naming conventions

| Layer      | Suffix          | Example                           |
| ---------- | --------------- | --------------------------------- |
| Route      | `.routes.ts`    | `links.routes.ts`                 |
| Service    | `.service.ts`   | `email.service.ts`                |
| Mongoose model | (capital first letter) | `User.ts`, `Link.ts`     |
| Middleware | (kebab)         | `bot-protection.ts`, `db-check.ts`|
| Util       | (kebab)         | `user-agent.ts`, `validators.ts`  |
| Config     | (kebab)         | `rate-limits.ts`, `auth-config.ts`|
| React component | PascalCase | `MobilePreview.tsx`              |
| React page | PascalCase       | `Dashboard.tsx`                  |
| Frontend lib | camelCase      | `sessionManager.ts`, `colorDeriver.ts` |

## Import-path conventions

- Backend imports use the `.js` suffix (TS resolves to `.ts` source; produced `.js` after build)
- Frontend uses path alias `@/...` resolving to `client/src/...`
- Cross-layer imports go **downward** only (routes → services → models → config / utils)
- Never import a route from a service or model

## Where to find things, fast

| Looking for ...                          | Open                                                  |
| ----------------------------------------- | ----------------------------------------------------- |
| Every route in the app                    | `server/routes/index.ts`                              |
| All Mongoose models                       | `server/models/index.ts`                              |
| App middleware chain                      | `server/app.ts`                                       |
| Boot validations / `app.listen`            | `server/index.ts`                                     |
| JWT signing / verifying                   | `server/utils/tokens.ts`                              |
| Auth middleware (`authenticateToken`)     | `server/middleware/auth.ts`                           |
| Where caches live                          | `server/services/cache.service.ts` + auth.ts          |
| Cloudinary upload                          | `server/services/cloudinary.service.ts`               |
| Email templates                            | `server/services/email.service.ts`                    |
| Disposable-email blocklist                 | `server/config/constants.ts → DISPOSABLE_EMAIL_DOMAINS` |
| Frontend API client                        | `client/src/lib/api.ts`                               |
| Frontend session manager                   | `client/src/lib/sessionManager.ts`                    |
| Top-level routing                          | `client/src/App.tsx`                                  |
| Style entry                                | `client/src/styles/index.css`                         |
| Full v1 stylesheet (section map at top)    | `client/src/styles/_app-global.css`                   |
