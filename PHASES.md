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
- [x] Update `constants/colors.js` with full token set (background, surface, primary, currency, statBlue, statGreen, statNeutral, border, textPrimary, textSecondary, danger, warning, status colors)
- [x] Add spacing constants (`Spacing`) and border radius constants (`Radius`) to `constants/colors.js`
- [x] Add `Font` and `FontSize` constants to `constants/colors.js`
- [x] Copy Outfit font files to `frontend/assets/fonts/` and load via `useFonts` in `_layout.jsx`

### Tab Bar
- [x] Icon-only tab bar; active tab shows pill/capsule highlight behind icon; remove labels

### Screen Headers (all screens)
- [x] Remove colored header bar; move title + subtitle into scrollable body
- [x] Home: title = "Welcome, {username}", subtitle = "{role} Dashboard", action icons inline right
- [x] Other screens: title left-aligned in body, back arrow where needed

### Home Screen
- [x] Stat cards: 2+1 stacked layout (two top, one full-width below); color-coded tints
- [x] Remove hint banner and Quick Actions entirely
- [x] Add "Recent Transactions" section — last 5, flat rows with chevron + status text
- [x] FAB bottom-right for new transaction

### Inventory Screen
- [x] Replace list with 2-column product tile grid
- [x] Each tile: product name, price (`currency` green), stock count; radius 6px card
- [x] Tap tile → detail modal (image placeholder, full info, stock action buttons)
- [x] Search bar above grid; filters if needed

### Sales Screen
- [x] Stat cards: same 2+1 stacked + color-coded as home
- [x] Transaction list: flat rows with right chevron (`›`), dividers, status as colored inline text
- [x] Remove left-border accent and badge boxes

### New Transaction Screen
- [x] Full-screen product list (receipt-style rows: name, price, `[+]` button)
- [x] Cart bottom sheet: slides up when first item added, shows handle + item count + total + confirm button
- [x] Cart sheet expands to show full itemized list on drag

### Transaction Detail Screen
- [x] Receipt card layout: rounded card, header block → itemized products → subtotal/discount/total
- [x] Truncate transaction ID to last 8 chars (`…bc33cde`)
- [x] Action buttons (Finalize / Cancel) below receipt card, only shown if pending + authorized

### Global
- [x] Apply `Font` and `FontSize` tokens to all text elements across all screens
- [x] Section headers: 13px uppercase + letter-spacing 0.8 throughout
- [x] All `currency` values use `currency` green + `Outfit-Bold`
- [x] Replace all hardcoded hex values with tokens from `constants/colors.js`
- [x] Apply `Spacing` and `Radius` tokens throughout

**Done criteria:** Tab bar icon-only with pill; no colored header bars; inventory is a tile grid with tap modal; new transaction has bottom-sheet cart; transaction detail is receipt layout; stat cards 2+1 stacked; all tokens applied, no hardcoded hex.

---

## Phase 5.6 — Product Schema Overhaul
*Add categories, SKU, cost price, image, and soft-delete to products.*

### Backend
- [x] `Category` model: `name` (unique), `color`
- [x] `GET/POST/PUT/DELETE /categories` routes; writes require manager/admin
- [x] `Product` model: add `sku` (sparse unique), `costPrice`, `category` (ref), `imageUrl`, `isActive`
- [x] `GET /products`: default filter `isActive: true`, populate `category`, accept `category` and `includeArchived` query params
- [x] `POST /products` and `PUT /products/:id`: accept all new fields; manager/admin guard
- [x] Replace `DELETE /products/:id` with `PATCH /products/:id/archive` + `PATCH /products/:id/restore`; logs `PRODUCT_ARCHIVED` / `PRODUCT_RESTORED`
- [ ] Emit `CATEGORY_CREATED`, `CATEGORY_UPDATED`, `CATEGORY_DELETED` log events from category routes
- [ ] Category management screen (create/edit/delete categories, with color picker)

### Frontend
- [x] `add-product.jsx`: new fields — SKU, cost price, category chip picker (fetched from `/categories`), image URL
- [x] `ProductCard`: image area (URL or 📦 emoji fallback), category color badge, SKU line, margin % from costPrice
- [ ] Inventory screen: category filter chips above product grid
- [ ] Edit product screen (separate from add-product; pre-fills existing values)
- [ ] Archive/restore action in product detail sheet

**Done criteria:** Products have categories, SKU, cost price, image; soft delete works; ProductCard shows category badge + margin; add-product form captures all new fields.

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
