# PHASES.md

Development phases for Il Vento. Each phase lists tasks with done criteria.

Status legend: `[ ]` todo · `[x]` done · `[-]` in progress

---

## Phase 1 — Core Foundation
*Backend scaffolding, auth, basic product + transaction CRUD.*

- [x] Express server with CORS, Helmet, Morgan
- [x] MongoDB connection + admin auto-seed
- [x] User model + bcrypt password hashing
- [x] JWT login endpoint + verifyToken middleware
- [x] verifyAdmin middleware
- [x] Product model with stock instance methods
- [x] Transaction model with timestamps
- [x] Log model for audit trail
- [x] Auth routes: login, /me, admin user CRUD
- [x] Product routes: CRUD + stock operations
- [x] Sales routes: transaction lifecycle (create, update, finalize, cancel, list, detail)
- [x] Sales stats endpoint (totalItemsSold, totalStocks, todaysSales)

**Done criteria:** All API endpoints respond correctly; admin can manage users; staff can create and complete transactions.

---

## Phase 2 — Frontend Foundation
*Expo Router setup, auth flow, navigation shell.*

- [x] Expo project with Expo Router v6
- [x] AuthContext with expo-secure-store JWT persistence
- [x] Root Stack navigator with (auth) / (tabs) split
- [x] Login screen
- [x] Tab bar (Home, Inventory, Sales, Reports)
- [x] Theme system (light/dark, ThemeProvider, colors.js)
- [x] UI component library (Button, Card, Modal, Input, etc.)

**Done criteria:** User can log in, token persists across restarts, tab navigation works, theme toggles correctly.

---

## Phase 3 — Core Screens
*Inventory management, transaction creation, transaction detail.*

- [x] Home screen: stats cards, quick actions (role-filtered)
- [x] Inventory screen: paginated list, search, update-stock modal, add-product modal
- [x] Sales screen: transaction list, stats cards
- [x] Transaction creation screen (/transaction)
- [x] Transaction detail/edit screen (/transactions/[transactionId])
- [x] User management screen (/users) — admin only

**Done criteria:** Full transaction lifecycle usable from UI (create → edit → finalize/cancel); inventory browsable and editable.

---

## Phase 4 — Bug Fixes & Polish
*Resolve known issues, tighten RBAC, improve UX.*

- [x] Fix `req.userId` → `req.user.id` in `backend/routes/products.js` log writes
- [x] Fix ObjectId vs string comparison in `transaction-update-products` (`.toString()`)
- [x] Add manager-role middleware or consistent in-route role checks
- [x] Add request validation/sanitization (express-validator or zod) on all backend routes
- [x] Make dev/prod API URL switch in AuthContext driven by an env flag
- [x] Pull-to-refresh on all list screens
- [x] Error boundary or graceful error screens on frontend

**Done criteria:** All known bugs fixed; no undefined `req.userId` references; role checks consistent.

---

## Phase 5 — POS Enhancements
*Upgrade the system to proper point-of-sale behaviour.*

### Audit Log Migration
- [ ] Add `low_stock_threshold` field to Product model (default: 10)
- [ ] Migrate Log schema: replace `type` enum with structured `event` code field + `actor` + `target_user` + `metadata` (see PLAN.md Event Types)
- [ ] Add `price_at_sale` snapshot to Transaction `products` array; set on finalize
- [ ] Add `payment_method` (cash/card/other) and `discount` fields to Transaction
- [ ] Add `notes` field to Transaction
- [ ] Emit `STOCK_SOLD` log per product on transaction finalize
- [ ] Emit typed events on all existing actions: `USER_LOGIN`, `USER_CREATED`, `USER_UPDATED`, `USER_DELETED`, `USER_PASSWORD_CHANGED`, `PRODUCT_CREATED`, `PRODUCT_UPDATED`, `PRODUCT_DELETED`, `STOCK_INCREASE`, `STOCK_DECREASE`, `STOCK_SET`, `TRANSACTION_CREATED`, `TRANSACTION_UPDATED`, `TRANSACTION_COMPLETED`, `TRANSACTION_CANCELLED`
- [ ] Add `totalRevenue` to `/sales/stats`
- [ ] Add date-range + event filters to `/sales/transaction-logs`

### Export Endpoints (`/export`)
- [ ] Install `json2csv` and `pdfkit` in backend
- [ ] `GET /export/transactions/csv` — filtered transaction export
- [ ] `GET /export/transactions/pdf` — PDF sales report with totals
- [ ] `GET /export/inventory/csv` — full product list + stock
- [ ] `GET /export/inventory/low-stock/csv` — products at/below threshold
- [ ] `GET /export/audit-log/csv` — admin-only audit log dump

**Done criteria:** All log writes use typed event codes; `price_at_sale` stored on finalize; all five export endpoints stream valid files; low-stock threshold persisted per product.

---

## Phase 5.5 — UI Overhaul
*Redesign frontend to the new design system defined in PLAN.md.*

### Design System Foundation
- [ ] Update `constants/colors.js` with full token set (background, surface, primary, currency, statBlue, statGreen, statNeutral, border, textPrimary, textSecondary, danger, warning, status colors)
- [ ] Add spacing constants to `constants/colors.js` or a new `constants/spacing.js` (xs/sm/md/lg/xl/screenPadding/cardPadding/listGap/sectionGap)
- [ ] Add border radius constants (card: 6, button: 4, input: 4, modal: 8)

### Header
- [ ] All screen headers: navy (`primary`) background, white title + icons — no emoji in header titles
- [ ] Home header: show role badge inline with username (e.g. "sb · manager")

### Home Screen
- [ ] Remove hint banner entirely
- [ ] Remove Quick Actions section
- [ ] Add "Recent Transactions" section — last 5 transactions, flat row style, with FAB (+) for new transaction
- [ ] Stat cards: color-coded (neutral / blue / green tints per token table)

### Inventory Screen
- [ ] List rows: flat (no card borders), divider lines only, price in `currency` green, stock right-aligned
- [ ] Fix text overflow on any labels

### Sales Screen
- [ ] Remove left-border accent on transaction cards
- [ ] Flat rows with dividers; status as inline colored text (no badge boxes)
- [ ] Stat cards: same color-coded style as home

### Transaction Creation & Detail Screens
- [ ] Apply tight spacing (screenPadding: 12, cardPadding: 12, listGap: 8)
- [ ] Buttons: radius 4px, primary navy bg
- [ ] Inputs / search bars: radius 4px, 1px border

### Global
- [ ] Section headers: 13px uppercase + letter-spacing throughout
- [ ] Numeric/currency values: 20px bold, `currency` green
- [ ] Truncate raw ObjectId on transaction detail (show last 8 chars, e.g. `…bc33cde`)
- [ ] Audit any screen still using hardcoded hex values and replace with tokens

**Done criteria:** All screens use token colors; no hardcoded hex values in screen files; stat cards color-coded; home shows recent transactions; sales list is flat rows; all border radii and spacing match spec.

---

## Phase 6 — Reports & Analytics
*Replace the Reports stub with real data and export UI.*

- [ ] Reports screen: date range picker (from / to)
- [ ] Sales summary card: total revenue, transaction count, avg transaction value
- [ ] Top-selling products list (by qty sold)
- [ ] Low-stock alert list (products at/below threshold)
- [ ] Export buttons: "Download CSV" / "Download PDF" — calls `/export` endpoints, shares/opens file via `expo-sharing` or `expo-file-system`
- [ ] Audit log viewer screen (`/audit-log`) — filterable by event type and date range (manager/admin only)

**Done criteria:** Reports tab shows live aggregated data; at least one export button produces a downloadable file on device; audit log screen lists typed events.

---

## Phase 7 — Production Readiness
*Hardening before final submission.*

- [ ] Replace default JWT_SECRET ("12345") with secure random secret
- [ ] Add rate limiting to login endpoint
- [ ] Confirm Render deployment environment variables are set correctly
- [ ] EAS production build passes
- [ ] Final end-to-end smoke test on device
