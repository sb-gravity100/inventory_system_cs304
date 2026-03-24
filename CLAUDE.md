# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## ⚡ START EVERY SESSION HERE

Before writing any code or reading any source file, always do this first:

1. **Ask the user to provide `PLAN.md`, `PHASES.md`, and `FILE_INDEX.md`** if they are not already in context. Do not proceed until at least `FILE_INDEX.md` is available.
2. Read `FILE_INDEX.md` (repo root) — it maps every file to its purpose and tags. Use it to find the exact file you need without scanning the tree.
3. Read `CLAUDE.md` in full.

**Do not scan directories or read source files until you have identified the target files via `FILE_INDEX.md`.**

---

## Token efficiency — CRITICAL

Every file read and every output costs money. Minimize both aggressively.

- **Read only what you need.** Use `FILE_INDEX.md` to identify the exact file before opening anything. Never open a file speculatively.
- **Read only the relevant section.** Use `view_range` when you need one function or block, not the whole file.
- **No unnecessary confirmations.** Don't summarize what you're about to do before doing it. Don't recap what you just did after doing it. Act, then move on.
- **No padding.** No filler phrases ("Great question!", "Sure, I'll help with that", "Here's what I did"). Responses should contain only information the user needs.
- **Prefer targeted edits.** Use `str_replace` on the specific lines that change. Never rewrite a whole file to change a few lines.
- **One read per file per task.** Read a file once, make all needed changes, move on. Don't re-read files you already have in context.

---

## Session saves — CRITICAL

**The user's PC crashes unpredictably, anywhere between 10 minutes and 1 hour into a session.**

- After every logical unit of work: finish the change → `git commit` (including updated `commits.md`) → move on.
- A "logical unit" is: one file created, one feature completed, one bug fixed, one doc updated.
- Never leave more than one uncommitted logical change in the working tree.

---

## Logging rules

**Every function, endpoint, event handler, service call, and error path must be logged.**

Log at:
- Entry point (params/body — never credentials)
- Service/handler entry
- DB or external API queries
- Branch decisions
- Exception raises
- Significant state transitions

**Never log passwords, PINs, or raw tokens of any kind.**

Use appropriate log levels:
- `debug` — fine-grained flow
- `info` — significant events
- `warning` — recoverable anomalies
- `error` — failures

---

## Key workflow rules

### commits.md rule
After every `git commit`, **prepend** a new entry to `commits.md`:
```
### `<short-hash>` · <YYYY-MM-DD> · <commit subject>
- `affected/file1`
- `affected/file2`
```
Use the real short hash from the commit output. Include `commits.md` itself in the same commit.

### Commit granularity
Every distinguishable change gets its own commit. Never bundle unrelated changes. If you need "and" in the commit message, it should be two commits.

### Straggler sweep
After any rename, removal, or refactor — grep for old references across all code and doc files before committing.

### Planning doc sync
When any change affects design, behaviour, schema, or architecture — update the relevant planning docs in the same task:
- `PLAN.md` — tech stack, modules, API endpoints, DB schema
- `PHASES.md` — per-phase task lists
- `FILE_INDEX.md` — file system index (update when files are added, moved, or removed)

All planning docs must stay consistent with each other at all times.

---

## Reference documents (adapt per project)
- `FILE_INDEX.md` — **file system index with tags and descriptions — read this first**
- `PLAN.md` — full tech stack, API endpoints, schema
- `PHASES.md` — detailed per-phase tasks and done criteria
- `commits.md` — commit log (prepend after every commit)

---

## Project Overview

"Il Vento" — full-stack inventory management system (CS304). React Native/Expo frontend + Node.js/Express backend + MongoDB Atlas.

---

## Commands

### Backend (`/backend`)
```bash
npm run dev      # nodemon auto-reload (development)
npm start        # node server.js (production)
```

### Frontend (`/frontend`)
```bash
npm start              # Expo dev server (localhost only)
npm run android        # Android emulator/device
npm run web            # Browser
npm run build:preview  # EAS build → Android APK (preview)
```

No test runner or lint script is configured in either package.

---

## Environment Setup

**`backend/.env`** — required keys: `MONGO_URI`, `JWT_SECRET`, `PORT`

**`frontend/.env`** — required keys:
- `EXPO_PUBLIC_API_URL` — production API (Render)
- `EXPO_PUBLIC_API_DEVURL` — local dev API (e.g. `http://192.168.x.x:3000`)

AuthContext selects the URL: dev builds use `EXPO_PUBLIC_API_DEVURL`, production uses `EXPO_PUBLIC_API_URL`. The switch is manual — update the logic in `frontend/context/AuthContext.jsx` when deploying.

---

## Architecture

### Backend

ES module project (`"type": "module"` in package.json) — use `import`/`export`, not `require`.

`db.js` runs on startup and auto-seeds an admin user (`admin` / `admin123`) if none exists. All route files import `verifyToken` (and optionally `verifyAdmin`) from `middlewares.js`.

**Route map:**
| Prefix | File | Auth |
|---|---|---|
| `/auth` | `routes/auth.js` | Mixed (login is public; others need token or admin) |
| `/products` | `routes/products.js` | `verifyToken` on all |
| `/sales` | `routes/sales.js` | `verifyToken` on all |

**RBAC:** only two middleware guards exist — `verifyToken` and `verifyAdmin`. Manager/staff distinction is enforced in-route via `req.user.role` checks, not a dedicated middleware.

**Audit trail:** every significant mutation writes a document to the `Log` collection via `Log.create(...)` inside the route handler. Log `type` is one of: `transaction`, `inventory`, `manager_request`, `user_action`.

**Known bugs in current code:**
- `routes/products.js` uses `req.userId` in log writes — should be `req.user.id` (set by `verifyToken`).
- `routes/sales.js` transaction-update-products compares `transaction.seller._id` (ObjectId) against `req.user.id` (string) — needs `.toString()`.

### Frontend

Expo Router v6 file-based routing. The navigator tree is:

```
Stack
├── (auth)/          ← shown when !isAuth (login screen)
└── (tabs)/          ← shown when isAuth
    ├── index        Home / dashboard stats
    ├── inventory    Product list + stock modals
    ├── sales        Transaction list + stats cards
    └── reports      Stub ("coming soon")
app/transaction.jsx             ← new transaction creation (outside tabs)
app/users.jsx                   ← admin-only user management (outside tabs)
app/transactions/[transactionId]/index.jsx  ← transaction detail / edit
```

**Auth flow:**
1. App start → check `expo-secure-store` for JWT → call `/auth/me` to validate.
2. On login → receive `{ token, user }` → store JWT in secure store → set `AuthContext`.
3. Every axios call sets `Authorization: Bearer <token>` header (assembled in each screen, not a global interceptor).

**Role-gated UI:** components read `user.role` from `AuthContext` and conditionally render. Role values are `admin`, `manager`, `staff`.

**Theme:** two React Contexts — `ThemeProvider` (light/dark toggle, reads system preference) and `PaperProvider` (Material Design). Colors are defined in `constants/colors.js`. Always use the `useTheme()` hook for colors; never hardcode hex values in screens.

**Transaction lifecycle on the frontend:**
1. `app/transaction.jsx` — search products, build cart, POST → `/sales/transaction` → redirects to sales tab.
2. `app/transactions/[transactionId]/index.jsx` — view/edit pending transactions, add/remove products, finalize or cancel. Edit allowed only if `isPending && (isOwner || manager/admin)`.

**Formatting:** Prettier config is `tabWidth: 2`, `singleQuote: false`, `semi: true` (both packages share the same `.prettierrc`).
