# Architecture

Deep-dive companion to `README.md`. Read this once after cloning. Each section maps a part of the old monolith to its new home so engineers familiar with the v1 code can find anything in under 30 seconds.

---

## 1. Layering rules (read this first)

The backend follows a strict **dependency direction**. Anything in a higher layer can call anything in a lower layer, but not the reverse:

```
        routes/        ←  thin HTTP layer (only req/res handling, validation)
            ↓
       services/       ←  reusable business logic (email, cache, cloudinary, uploads)
            ↓
        models/        ←  Mongoose schemas
            ↓
       config/         ←  env, constants, rate-limits, auth-config, database conn
                          (zero dependencies on anything else)
       utils/          ←  pure functions (http envelope, validators, JWT helpers, UA parser)
       middleware/     ←  express middleware (auth, db-check, security, errors, multer)
```

**Rule of thumb:** if you find yourself importing from `routes/` inside a `service`, you've broken the layer — refactor.

The frontend has a looser version of the same:

```
   pages/           ←  feature pages (composed of components + lib)
       ↓
   components/      ←  presentation (buckets: layout / routing / ui / icons / links / appearance)
       ↓
   lib/             ←  api client, session, validation, helpers, color derivation
       ↓
   config/          ←  API base URL, chart theme
```

---

## 2. Request lifecycle (a `POST /api/links` example)

```
Browser → Vite dev proxy → Express (server/index.ts boot)
                                    ↓
                        server/app.ts middleware chain
                        ┌─────────────────────────────────────────┐
                        │ 1. enforceHTTPS                         │
                        │ 2. cors                                 │
                        │ 3. helmet + securityHeaders             │
                        │ 4. globalLimiter (120 req/min/IP)       │
                        │ 5. requestLogger                        │
                        │ 6. suspiciousActivityDetector           │
                        │ 7. timing log                           │
                        │ 8. compression + json + urlencoded      │
                        │ 9. /uploads static                      │
                        │10. checkDatabaseConnection              │
                        └─────────────────────────────────────────┘
                                    ↓
                        server/routes/index.ts → registerRoutes(app)
                                    ↓
                        server/routes/links.routes.ts
                                    ↓
                        router-level: authenticateToken (server/middleware/auth.ts)
                                    ↓
                        POST handler at `/` → calls Link.create() (models/Link.ts)
                                    ↓
                        invalidateUserCache (services/cache.service.ts)
                                    ↓
                        sendSuccess (utils/http.ts) → { success, data, meta }
```

The two terminal handlers (`multerErrorHandler`, `jsonErrorHandler`) sit at the end of the chain in `app.ts` and ensure every error response is JSON.

---

## 3. Module map — old monolith → new files

### `server.ts` (was 2,946 lines)

| Lines (old) | Now lives in                                               |
| ----------- | ---------------------------------------------------------- |
| 1–48        | `server/index.ts` imports + `server/config/env.ts`         |
| 50–69       | `server/config/env.ts`                                     |
| 71–73       | `server/utils/http.ts` (`sendSuccess`/`sendError`)         |
| 76–111      | `server/utils/user-agent.ts` (`parseUserAgent`)            |
| 113–139     | `server/index.ts` (security boot validation)               |
| 142–187     | `server/middleware/upload.ts` (multer config)              |
| 190–251     | `server/app.ts` (middleware chain)                         |
| 253–338     | `server/config/database.ts` (`connectToDatabase`)          |
| 340–360     | `server/middleware/db-check.ts`                            |
| 362–387     | `server/routes/health.routes.ts`                           |
| 389–906     | `server/routes/auth.routes.ts`                             |
| 908–910     | `server/routes/honeypot.routes.ts`                         |
| 912–1339    | `server/routes/public.routes.ts`                           |
| 1342–1517   | `server/routes/webhooks.routes.ts` (Instagram)             |
| 1522–1553   | `server/services/upload.service.ts` (base64 + cleanup)     |
| 1555–1596   | `server/services/cache.service.ts`                         |
| 1598–1617   | merged into `server/middleware/db-check.ts`                |
| 1619–1690   | `server/middleware/auth.ts` (`authenticateToken`)          |
| 1696–1730   | `server/routes/instagram.routes.ts`                        |
| 1732–1922   | `server/routes/uploads.routes.ts`                          |
| 1927–2255   | `server/routes/users.routes.ts`                            |
| 2260–2288   | `server/routes/leads.routes.ts`                            |
| 2291–2307   | `server/routes/links.routes.ts` (GET)                      |
| 2310–2491   | `server/routes/analytics.routes.ts` (`/api/dashboard`)     |
| 2496–2653   | `server/routes/analytics.routes.ts` (`/api/analytics`)     |
| 2656–2698   | `server/routes/ads.routes.ts`                              |
| 2700–2769   | `server/routes/automations.routes.ts`                      |
| 2772–2894   | `server/routes/links.routes.ts` (POST/PUT/DELETE/reorder)  |
| 2897–2928   | `server/middleware/error-handler.ts`                       |
| 2930–2942   | `server/index.ts` (`app.listen`)                           |

### `models.ts` → `server/models/*`

| Old export   | New file                              |
| ------------ | ------------------------------------- |
| All interfaces | `server/models/interfaces.ts`       |
| `User`       | `server/models/User.ts`              |
| `Link`       | `server/models/Link.ts`              |
| `LinkClick`  | `server/models/LinkClick.ts`         |
| `ProfileView`| `server/models/ProfileView.ts`       |
| `Lead`       | `server/models/Lead.ts`              |
| `Automation` | `server/models/Automation.ts`        |
| `Ad`         | `server/models/Ad.ts`                |
| `BrandDeal`  | `server/models/BrandDeal.ts`         |
| `Campaign`   | `server/models/Campaign.ts`          |
| `Payout`     | `server/models/Payout.ts`            |
| Re-exports   | `server/models/index.ts`             |

Importing `User` is unchanged:
```ts
// Was:  import { User } from './models.js';
// Now:  import { User } from '../models/index.js';
```

### Other root files

| Old file                  | New file                                |
| ------------------------- | --------------------------------------- |
| `auth-config.ts`          | `server/config/auth-config.ts`          |
| `email-service.ts`        | `server/services/email.service.ts`      |
| `security-middleware.ts`  | `server/middleware/security.ts`         |
| `rate-limit-config.ts`    | `server/config/rate-limits.ts`          |
| `bot-protection.ts`       | `server/middleware/bot-protection.ts`   |
| `seed.ts`                 | `server/seed.ts`                        |

### Frontend `src/` → `client/src/`

| Old path                      | New path                                          |
| ----------------------------- | ------------------------------------------------- |
| `src/config.ts`               | `client/src/config/env.ts`                        |
| `src/theme.ts`                | `client/src/config/theme.ts`                      |
| `src/utils/*.ts`              | `client/src/lib/*.ts`                             |
| `src/components/Layout.tsx`   | `client/src/components/layout/Layout.tsx`         |
| `src/components/ProtectedRoute.tsx` | `client/src/components/routing/`            |
| `src/components/PublicRoute.tsx`    | `client/src/components/routing/`            |
| `src/components/ErrorBoundary.tsx`  | `client/src/components/routing/`            |
| `src/components/CustomDropdown.tsx` | `client/src/components/ui/`                 |
| `src/components/ImageCropperModal.tsx` | `client/src/components/ui/`              |
| `src/components/GenderIcons.tsx`    | `client/src/components/icons/`              |
| `src/components/PlatformIcons.tsx`  | `client/src/components/icons/`              |
| `src/components/CollectionItem.tsx` | `client/src/components/links/`              |
| `src/components/DNDLinksList.tsx`   | `client/src/components/links/`              |
| `src/components/RegularLinkItem.tsx`| `client/src/components/links/`              |
| `src/components/TreeDnD.tsx`        | `client/src/components/links/`              |
| `src/components/MobilePreview.tsx`  | `client/src/components/appearance/`         |
| `src/components/PremiumBackground.tsx` | `client/src/components/appearance/`      |
| `src/components/ProfilePictureModal.tsx` | `client/src/components/appearance/`    |
| `src/components/ThemeLayouts.tsx`   | `client/src/components/appearance/`         |
| `src/pages/Login.tsx`         | `client/src/pages/auth/Login.tsx`                 |
| `src/pages/Register.tsx`      | `client/src/pages/auth/`                          |
| `src/pages/Forgot/Reset/Verify*` | `client/src/pages/auth/`                       |
| `src/pages/Dashboard.tsx`     | `client/src/pages/dashboard/`                     |
| `src/pages/Links.tsx`         | `client/src/pages/links/`                         |
| `src/pages/LinksDesigns.tsx`  | `client/src/pages/links/`                         |
| `src/pages/Appearance.tsx`    | `client/src/pages/links/`                         |
| `src/pages/Analytics.tsx`     | `client/src/pages/analytics/`                     |
| `src/pages/Automation.tsx`    | `client/src/pages/automation/`                    |
| `src/pages/Monetization*.tsx` | `client/src/pages/monetization/`                  |
| `src/pages/Campaigns.tsx`     | `client/src/pages/monetization/`                  |
| `src/pages/Payouts.tsx`       | `client/src/pages/monetization/`                  |
| `src/pages/MyProfile.tsx`     | `client/src/pages/profile/`                       |
| `src/pages/Settings.tsx`      | `client/src/pages/settings/`                      |
| `src/pages/HelpSupport.tsx`   | `client/src/pages/help/`                          |
| `src/pages/PublicProfile.*`   | `client/src/pages/public/`                        |
| `src/index.css`               | `client/src/styles/index.css` (+ `_app-global.css`)|

---

## 4. The route registry (server/routes/index.ts)

This file is the single source of truth for which router mounts where:

```ts
app.use('/api',             health);
app.use('/api/auth',        auth);
app.use('/api/public',      publicRouter);
app.use('/api/webhooks',    webhooks);
app.use('/api',             honeypot);
app.use('/api/instagram',   instagram);
app.use('/api/user',        uploads);   // upload endpoints under /api/user/*
app.use('/api/user',        users);
app.use('/api/leads',       leads);
app.use('/api/links',       links);
app.use('/api',             analytics); // /api/dashboard + /api/analytics
app.use('/api/ads',         ads);
app.use('/api/automations', automations);
```

Adding a new domain = add a router file + 2 lines here.

---

## 5. Authentication boundary

Public vs authenticated is now explicit per-router instead of a single `app.use(authenticateToken)` like the old code:

- **Public routers** (no `router.use(authenticateToken)`):
  - `health.routes.ts`
  - `auth.routes.ts`
  - `public.routes.ts`
  - `webhooks.routes.ts`
  - `honeypot.routes.ts`

- **Authenticated routers** (call `router.use(authenticateToken)` at the top):
  - `instagram.routes.ts`
  - `uploads.routes.ts`
  - `users.routes.ts`
  - `leads.routes.ts`
  - `links.routes.ts`
  - `analytics.routes.ts`
  - `ads.routes.ts`
  - `automations.routes.ts`

This is a deliberate improvement: in v1 a route's auth status depended on whether `app.use(authenticateToken)` had been called yet at that line of `server.ts`. Now it's a property of the router file itself, visible at the top.

---

## 6. Caching

Two in-memory caches power the perf optimizations carried over from v1:

| Cache             | Where                                | TTL  | Used by                              |
| ----------------- | ------------------------------------ | ---- | ------------------------------------ |
| Auth user cache   | `server/middleware/auth.ts`         | 60s  | `authenticateToken` (skip Mongo)     |
| Response cache    | `server/services/cache.service.ts`  | 15s  | `/api/links`, `/api/ads/active`, `/api/user`, public profiles |

Both are sweeper-collected periodically (interval lives in `config/constants.ts → CACHE_TTL.CACHE_SWEEP_INTERVAL`).

For horizontal scaling, swap both for Redis without touching any route handler — only the service files change.

---

## 7. CSS — current state & future work

The original `src/index.css` was 2,981 lines covering tokens, resets, layout, components, modals, and per-page overrides.

For TCv2 it has been:
1. Moved to `client/src/styles/_app-global.css` (unchanged content)
2. A new `client/src/styles/index.css` is the import entry point (loaded by `main.tsx`)
3. The top of `_app-global.css` has a **section map** (approx. line ranges per concern)

The future split should produce these partials (commented imports already exist in `index.css`):

```
styles/
├── index.css        # entry — composes the rest
├── tokens.css       # :root variables, color system, spacing scale
├── base.css         # resets, body, typography
├── layout.css       # sidebar, app shell, main grid
├── forms.css        # inputs, dropdowns, checkbox, radio
├── buttons.css      # .btn variants
├── cards.css        # dashboard cards, link items, stats cards
├── modals.css       # overlay, sheet, image cropper
├── animations.css   # keyframes, transitions
├── responsive.css   # small/medium/large mobile fine-tuning
└── utilities.css    # helpers
```

Extraction recipe:
1. Pick a banner inside `_app-global.css`
2. Cut the block into the matching partial above
3. Uncomment the matching `@import` line in `index.css`

---

## 8. Vercel deployment

Two pieces:

1. **Static client** — `npm run build` produces `dist/`, served by Vercel
2. **API function** — `api/index.js` is the serverless entry, importing the compiled `dist-server/server/index.js`

The build runs them in this order via `vercel-build`:
```
npm run build:server   # tsc → dist-server/
npm run build          # vite  → dist/
```

`vercel.json` rewrites:
- `/api/*` and `/uploads/*` → the serverless function
- Everything else → `index.html` (SPA)

When running on Vercel:
- Uploads go to Cloudinary instead of local disk (when `CLOUDINARY_*` env vars are set)
- Logs go to `/tmp/logs` since the rest of the filesystem is read-only
- `server/index.ts` skips `app.listen()` since Vercel handles request dispatch itself

---

## 9. What deliberately did **not** change

- All route paths (`/api/...`) — frontend code didn't have to update
- Mongoose schemas (field names, indexes, validators) — DB stays compatible
- JWT payload shape — existing tokens still work
- Public response envelopes — `{ success, data }` unchanged
- The `_app-global.css` content — visual parity guaranteed

This is purely a structural refactor. Behavior is identical to v1.
