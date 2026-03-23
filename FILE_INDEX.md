# FILE_INDEX.md

File system index for Il Vento inventory management system. Read this before opening any source file.

---

## Root

| File | Purpose | Tags |
|---|---|---|
| `CLAUDE.md` | AI assistant instructions, session rules, architecture notes | docs, meta |
| `PLAN.md` | Tech stack, API endpoints, DB schema | docs, architecture |
| `PHASES.md` | Per-phase task lists and done criteria | docs, planning |
| `commits.md` | Prepend-log of every git commit | docs, history |
| `FILE_INDEX.md` | This file — maps every file to purpose | docs, meta |
| `run_backend.bat` | Start backend dev server (nodemon) | dev, script |
| `run_frontend.bat` | Check for USB device → auto-update local IP in frontend/.env → start Expo Android | dev, script |
| `reset_db.bat` | Wipe all collections and re-seed admin user via `npm run reset-db` | dev, script, db |

---

## Backend (`/backend`)

### Entry & Config

| File | Purpose | Tags |
|---|---|---|
| `backend/server.js` | Express app setup, middleware stack (CORS, Helmet, Morgan), route mounting | entry, config |
| `backend/db.js` | MongoDB connection via Mongoose; auto-seeds admin user on startup | db, config |
| `backend/middlewares.js` | `verifyToken` (JWT → req.user) and `verifyAdmin` (role check) middleware | auth, middleware |
| `backend/package.json` | Dependencies, npm scripts (`start`, `dev`), ES module type | config |
| `backend/mock_data.json` | Sample product data for manual seeding/testing | data, dev |

### Scripts (`/backend/scripts`)

| File | Purpose | Tags |
|---|---|---|
| `backend/scripts/reset-db.js` | Drops all collections and re-seeds the default admin user; run with `npm run reset-db` from `/backend` | dev, script, db |

### Models (`/backend/Models`)

| File | Purpose | Tags |
|---|---|---|
| `backend/Models/User.js` | Mongoose schema: username, password (bcrypt), role (admin/manager/staff) | model, auth |
| `backend/Models/Product.js` | Mongoose schema: name, price, stock; instance methods: increaseStock, decreaseStock, updateStocks | model, inventory |
| `backend/Models/Transaction.js` | Mongoose schema: status (pending/completed/cancelled), seller (User ref), products array; timestamps enabled | model, sales |
| `backend/Models/Log.js` | Audit log schema: message, type, user, transaction_id, products_involved, timestamp | model, audit |

### Routes (`/backend/routes`)

| File | Purpose | Tags |
|---|---|---|
| `backend/routes/auth.js` | Login, /auth/me, admin user CRUD, manager admin-request endpoint | route, auth, admin |
| `backend/routes/products.js` | Product CRUD + stock operations (increase/decrease/set); all require verifyToken | route, inventory |
| `backend/routes/sales.js` | Transaction lifecycle (create/update/finalize/cancel), list, detail, logs, stats | route, sales |

---

## Frontend (`/frontend`)

### Config

| File | Purpose | Tags |
|---|---|---|
| `frontend/app.json` | Expo app config: name, slug, Android package, EAS project ID, plugins | config, expo |
| `frontend/eas.json` | EAS build profiles: preview (APK), production (APK auto-increment) | config, build |
| `frontend/package.json` | Dependencies, npm scripts (start, android, web, build:preview) | config |

### App Screens (`/frontend/app`)

| File | Purpose | Tags |
|---|---|---|
| `frontend/app/_layout.jsx` | Root Stack navigator: wraps PaperProvider, ThemeProvider, AuthProvider; defines (auth) and (tabs) screens | layout, navigation |
| `frontend/app/(auth)/_layout.jsx` | Auth guard: redirects authenticated users to (tabs); shows login otherwise | layout, auth |
| `frontend/app/(auth)/login.jsx` | Login form (username + password); calls AuthContext.login(); redirects on success | screen, auth |
| `frontend/app/(tabs)/_layout.jsx` | Tab bar: Home, Inventory, Sales, Reports; theme-aware styling | layout, navigation |
| `frontend/app/(tabs)/index.jsx` | Home/dashboard: stats cards (manager+), quick actions grid (role-filtered), logout, theme toggle | screen, home |
| `frontend/app/(tabs)/inventory.jsx` | Paginated product list, search, update-stock modal, add-product modal (manager+), FAB | screen, inventory |
| `frontend/app/(tabs)/sales.jsx` | Transaction list, stats cards, pull-to-refresh; taps navigate to transaction detail | screen, sales |
| `frontend/app/(tabs)/reports.jsx` | Stub — "coming soon" placeholder | screen, reports |
| `frontend/app/transaction.jsx` | New transaction creation: product search, cart, quantity controls, POST to /sales/transaction | screen, sales |
| `frontend/app/users.jsx` | Admin-only user management: list, create, edit, delete users | screen, admin |
| `frontend/app/transactions/[transactionId]/index.jsx` | Transaction detail/edit: view info, edit products (pending only), finalize, cancel; permission: isOwner or manager+ | screen, sales |

### Context

| File | Purpose | Tags |
|---|---|---|
| `frontend/context/AuthContext.jsx` | Global auth state (token, isAuth, user); JWT stored in expo-secure-store; login/logout; /auth/me validation on startup; API URL selection | context, auth |

### Components — UI Primitives (`/frontend/components/ui`)

| File | Purpose | Tags |
|---|---|---|
| `frontend/components/ui/Button.jsx` | Multi-variant button (primary, secondary, success, error, warning, outline) with optional icon | ui |
| `frontend/components/ui/Card.jsx` | Themed container with background + border | ui |
| `frontend/components/ui/Header.jsx` | Page title + subtitle, optional back button | ui |
| `frontend/components/ui/Modal.jsx` | Centered modal overlay with title, children, optional action buttons | ui |
| `frontend/components/ui/Input.jsx` | Themed text input | ui |
| `frontend/components/ui/SearchBar.jsx` | Search input with clear-on-focus behavior | ui |
| `frontend/components/ui/Dropdown.jsx` | Select from an options array | ui |
| `frontend/components/ui/DropdownMenu.jsx` | Contextual dropdown menu variant | ui |
| `frontend/components/ui/FormField.jsx` | Label + input wrapper | ui |
| `frontend/components/ui/FAB.jsx` | Floating action button with expandable action menu | ui |
| `frontend/components/ui/Loading.jsx` | Full-screen spinner overlay with message | ui |
| `frontend/components/ui/Typography.jsx` | Title, Subtitle, Body, Caption, Label text components | ui |
| `frontend/components/ui/index.js` | Re-exports all ui/ components | ui |

### Components — Feature Specific

| File | Purpose | Tags |
|---|---|---|
| `frontend/components/home/HomeHeader.jsx` | Header for home screen (logo, user info, logout) | component, home |
| `frontend/components/home/QuickActionCard.jsx` | Individual quick-action tile | component, home |
| `frontend/components/home/StatCard.jsx` | Stats display card (value + label) | component, home |
| `frontend/components/home/index.js` | Re-exports home components | home |
| `frontend/components/transaction/TransactionInfoCard.jsx` | Displays transaction metadata (ID, seller, status, timestamps) | component, sales |
| `frontend/components/transaction/ProductListCard.jsx` | Lists products in a transaction with edit controls | component, sales |
| `frontend/components/transaction/TotalCard.jsx` | Total amount calculation display | component, sales |
| `frontend/components/transaction/AddProductPanel.jsx` | Search + add products to an existing transaction | component, sales |
| `frontend/components/transaction/ActionButtons.jsx` | Finalize / Cancel buttons based on transaction status | component, sales |
| `frontend/components/transaction/QtyControl.jsx` | Quantity increment/decrement controls | component, sales, ui |
| `frontend/components/transaction/index.js` | Re-exports transaction components | sales |
| `frontend/components/ErrorBoundary.jsx` | Class component that catches render errors and shows a fallback screen with a retry button | component, error |
| `frontend/components/AddProductModal.jsx` | Modal form to create a new product (name, price, stock) | component, inventory |
| `frontend/components/UpdateStockModal.jsx` | Modal to update stock (add qty or set exact value) | component, inventory |
| `frontend/components/ProductCard.jsx` | Individual product list item (name, price, stock badge) | component, inventory |
| `frontend/components/TransactionItem.jsx` | Individual transaction list item | component, sales |
| `frontend/components/FloatingActionButton.jsx` | Standalone FAB (used on inventory screen) | component, ui |
| `frontend/components/PasswordInput.jsx` | Secure password input with visibility toggle | component, auth, ui |
| `frontend/components/ThemeProvider.js` | React Context: light/dark toggle, reads system preference, exposes useTheme() | context, theme |
| `frontend/components/theme.js` | Merges color constants with isDark flag into a theme object | theme |

### Constants & Utils

| File | Purpose | Tags |
|---|---|---|
| `frontend/constants/colors.js` | Light + dark palette definitions; shared semantic colors (success, error, warning) | theme, constants |
| `frontend/utils/quickActions.js` | Role-based quick action definitions mapped to navigation routes | utils, auth, navigation |

### Assets (`/frontend/assets`)

| File | Purpose | Tags |
|---|---|---|
| `frontend/assets/icon.png` | App icon | asset |
| `frontend/assets/adaptive-icon.png` | Android adaptive icon | asset |
| `frontend/assets/splash-icon.png` | Splash screen image | asset |
| `frontend/assets/favicon.png` | Web favicon | asset |
