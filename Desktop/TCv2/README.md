# The Crumb — v2 (TCv2)

Restructured codebase for The Crumb link-in-bio platform.

This is a **reorganization** of the original `crumbv2` project. The functionality and behavior are unchanged — what changed is the **file layout**: every monolithic file has been split into a clear, layered architecture so that newcomers can navigate the codebase quickly and changes can be made surgically without grepping a 3,000-line file.

---

## Why the restructure?

The original codebase had three pain points that made it hard to onboard new engineers and ship changes safely:

| Pain point in the old project                                | What was painful                                                      |
| ------------------------------------------------------------ | --------------------------------------------------------------------- |
| `server.ts` — **2,946 lines**                                | Every backend route, middleware, helper, and cache lived here.        |
| `models.ts` — **459 lines**, all 10 Mongoose schemas inline  | Adding a field meant scrolling through unrelated models.              |
| `src/index.css` — **2,981 lines**, all CSS in one file       | Style conflicts; no clear ownership of any section.                   |
| Flat `src/components/` and `src/pages/`                       | 16 components + 19 pages all dumped in one folder each.               |
| Backend `.ts` files at root (security, auth, email, etc.)    | No visual grouping — they sat next to `server.ts` and `package.json`. |

TCv2 fixes all of the above without changing a single piece of behavior.

---

## High-level layout

```
TCv2/
├── api/                 # Vercel serverless entry → server/index.ts
├── server/              # 🔥 BACKEND (was: 5 *.ts files dumped at root)
│   ├── index.ts         # entry — validates secrets, connects DB, starts listener
│   ├── app.ts           # express app + middleware chain (no listening)
│   ├── config/          # env, auth, db connection, rate limits, constants
│   ├── models/          # one file per Mongoose model (was: models.ts)
│   ├── middleware/      # auth, db-check, security, bot-protection, upload, errors
│   ├── routes/          # one router per domain (was: server.ts)
│   ├── services/        # email, cache, cloudinary, upload-processing
│   └── utils/           # http envelope, user-agent, validators, JWT helpers
│
├── client/              # 🔥 FRONTEND (was: src/)
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── config/      # API base URL + chart theme
│       ├── lib/         # api client, session manager, validation (was: utils/)
│       ├── components/
│       │   ├── layout/        # Layout
│       │   ├── routing/       # Protected, Public, ErrorBoundary
│       │   ├── ui/            # CustomDropdown, ImageCropperModal
│       │   ├── icons/         # Gender, Platform icons
│       │   ├── links/         # CollectionItem, DNDLinksList, …
│       │   └── appearance/    # MobilePreview, ThemeLayouts, …
│       ├── pages/             # grouped by feature
│       │   ├── auth/ dashboard/ links/ analytics/ automation/
│       │   ├── monetization/ profile/ settings/ help/ public/
│       └── styles/            # index.css entry + modular partials
│
├── scripts/             # admin & dev scripts (unchanged location)
├── migrations/          # DB migration scripts
├── public/              # static assets
├── uploads/             # user-generated uploads (local dev)
│
├── index.html           # Vite entry (now points to /client/src/main.tsx)
├── vite.config.ts       # Vite config (alias '@' → client/src)
├── tsconfig.json        # TypeScript config (paths: @/* and @server/*)
├── tsconfig.server.json # Server-only TS build → dist-server/
├── vercel.json
├── package.json
├── .env.example
├── README.md            # ← you are here
└── ARCHITECTURE.md      # deep-dive (request flow, layering, conventions)
```

---

## Quick start

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Configure environment
cp .env.example .env
# Edit .env — at minimum set MONGO_URI, JWT_SECRET, JWT_REFRESH_SECRET, ENCRYPTION_KEY
npm run secrets:generate   # prints suggested values for the three secrets

# 3. Seed (optional)
npm run db:seed

# 4. Run dev (server + client together)
npm run dev
# → API:    http://127.0.0.1:5000
# → Client: http://127.0.0.1:9090
```

The Vite dev server proxies `/api/*` and `/uploads/*` to the Express server, so the frontend can call relative URLs in dev exactly the same way it does in production.

---

## Where do I make changes?

### "I want to add a new API endpoint"
1. Pick the right domain in `server/routes/*.routes.ts` (e.g. `links.routes.ts` for `/api/links/*`)
2. Add the handler inside the existing `Router`
3. If you need a new domain entirely, create `foo.routes.ts` + register it in `server/routes/index.ts`
4. Heavy logic → `server/services/foo.service.ts`

### "I want to change how the JWT middleware works"
- One file: `server/middleware/auth.ts`

### "I want to add a new Mongoose model"
1. Create `server/models/Foo.ts` (one model per file)
2. Add `export { Foo } from './Foo.js';` to `server/models/index.ts`
3. Also add an `IFoo` interface to `server/models/interfaces.ts`

### "I want to change rate limits for one endpoint"
- `server/config/rate-limits.ts` (one limiter per export)

### "I want to tweak the appearance default for new users"
- `server/config/constants.ts` → `DEFAULT_APPEARANCE`

### "I want to add a new page to the React app"
1. Pick the right feature folder under `client/src/pages/<group>/`
2. Add `client/src/pages/<group>/MyPage.tsx`
3. Register the route in `client/src/App.tsx`

### "I want to add a new shared component"
- Pick the right bucket in `client/src/components/<group>/`
- Buckets: `layout/`, `routing/`, `ui/`, `icons/`, `links/`, `appearance/`
- If none fits, create a new bucket folder

### "I want to add a new API call from the frontend"
- All HTTP goes through `client/src/lib/api.ts` (cached GET, auto-retry, 401-aware)
- Never use raw `fetch()` directly — `api.get/post/put/delete` handle tokens and errors

### "I want to change CSS"
- `client/src/styles/index.css` is the entry point
- The actual rules currently all live in `client/src/styles/_app-global.css` (3000-line monolith inherited from v1) — the top of that file has a **section map** showing which line range owns what
- See `ARCHITECTURE.md` for the incremental modularization plan

---

## NPM scripts

| Script                              | What it does                                                |
| ----------------------------------- | ----------------------------------------------------------- |
| `npm run dev`                       | Runs server (`tsx watch server/index.ts`) + Vite client     |
| `npm run dev:server`                | Server only                                                 |
| `npm run dev:client`                | Vite client only (proxies /api → :5000)                     |
| `npm run build`                     | Vite client build → `dist/`                                 |
| `npm run build:server`              | TS server build → `dist-server/`                            |
| `npm start`                         | Run compiled server (`dist-server/server/index.js`)         |
| `npm run typecheck`                 | `tsc --noEmit` (no build, just check)                       |
| `npm run db:seed`                   | Seed demo data                                              |
| `npm run db:optimize`               | Apply MongoDB indexes for performance                       |
| `npm run db:migrate:security`       | Migrate user docs to add security fields                    |
| `npm run db:migrate:performance`    | Add compound indexes used by analytics                      |
| `npm run db:migrate:tracking`       | Set up real-time tracking collections                       |
| `npm run secrets:generate`          | Print suggested values for JWT/encryption secrets           |
| `npm run secrets:check`             | Verify required secrets exist and have sufficient strength  |
| `npm run admin:approve-monetization`| Approve a user for monetization                             |
| `npm run admin:check-monetization`  | Check a user's monetization status                          |

---

## Tech stack

- **Frontend**: React 19, React Router 7, Vite 6, Tailwind 4, Recharts, dnd-kit
- **Backend**: Express 4, Mongoose 9, JWT, bcrypt, Helmet, express-rate-limit
- **Storage**: MongoDB (Atlas in prod), Cloudinary for media in prod
- **Email**: nodemailer (SMTP — Gmail App Password or SendGrid)
- **Hosting**: Vercel (serverless function for API, static for client)

---

## See also

- [ARCHITECTURE.md](ARCHITECTURE.md) — deep-dive: request flow, layering rules, where to extend
- `docs/` — supplementary docs
- `.env.example` — every environment variable explained
- `server/routes/index.ts` — the route registry (one line per domain)
