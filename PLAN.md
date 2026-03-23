# PLAN.md

Technical specification for Il Vento — CS304 POS + inventory management system.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React Native 0.81, Expo SDK 54, Expo Router v6 |
| UI Library | react-native-paper v5 (Material Design 3) |
| Auth storage | expo-secure-store |
| HTTP client | axios |
| Backend | Node.js + Express v5, ES modules |
| Database | MongoDB Atlas via Mongoose v9 |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Security | helmet, cors |
| Logging | morgan (HTTP), Log collection (structured audit trail) |
| Export | CSV via json2csv; PDF via pdfkit (backend-generated) |
| Build | EAS Build (Android APK) |
| Hosting | Render (backend) |

---

## Environment Variables

### `backend/.env`
```
MONGO_URI=          # MongoDB Atlas connection string
JWT_SECRET=         # JWT signing secret
PORT=3000           # Optional, defaults to 3000
```

### `frontend/.env`
```
EXPO_PUBLIC_API_URL=       # Production backend URL (Render)
EXPO_PUBLIC_API_DEVURL=    # Local dev backend URL (e.g. http://192.168.x.x:3000)
EXPO_PUBLIC_JWT_KEY=       # Must match backend JWT_SECRET (used for reference only)
```

---

## Database Schema

### User
```
username:   String  required, unique
password:   String  required (bcrypt hash)
role:       String  enum: admin | manager | staff  required
```

### Product
```
name:            String  required
price:           Number  required
stock:           Number  required
low_stock_threshold: Number  default: 10  — triggers low-stock flag in UI/reports
```
Instance methods: `increaseStock(qty)`, `decreaseStock(qty)`, `updateStocks(newStock)`

### Transaction
```
status:         String  enum: pending | completed | cancelled  default: pending
seller:         ObjectId → User  required
products:       [{ product: ObjectId → Product, quantity: Number, price_at_sale: Number }]
payment_method: String  enum: cash | card | other  default: cash
discount:       Number  default: 0  — flat amount off the total
notes:          String  (optional) — cashier notes
createdAt:      Date  (auto)
updatedAt:      Date  (auto)
```
`price_at_sale` is snapshot of `Product.price` at finalization — protects historical totals from future price changes.

### Log
Structured audit trail. Every write must include an `event` code and a human-readable `message`.

```
event:             String  required  — machine-readable event code (see Event Types below)
message:           String  required  — human-readable description
actor:             ObjectId → User   — who triggered the event
target_user:       ObjectId → User   (optional) — affected user (USER_* events)
transaction_id:    ObjectId → Transaction  (optional)
products_involved: [{ product: ObjectId → Product, qty_before: Number, qty_after: Number }]
metadata:          Mixed   (optional) — extra context (old value, new value, reason, etc.)
timestamp:         Date  default: Date.now
```

#### Log Event Types

**User events**
| Code | Trigger |
|---|---|
| `USER_LOGIN` | Successful login |
| `USER_LOGOUT` | Explicit logout |
| `USER_CREATED` | Admin created a new user |
| `USER_UPDATED` | Admin changed username or role |
| `USER_DELETED` | Admin deleted a user |
| `USER_PASSWORD_CHANGED` | Password changed (admin-forced or self) |
| `ADMIN_REQUEST` | Manager sent an admin request message |

**Inventory events**
| Code | Trigger |
|---|---|
| `PRODUCT_CREATED` | New product added to inventory |
| `PRODUCT_UPDATED` | Product name or price changed |
| `PRODUCT_DELETED` | Product removed |
| `STOCK_INCREASE` | Stock manually increased |
| `STOCK_DECREASE` | Stock manually decreased |
| `STOCK_SET` | Stock set to an exact value |
| `STOCK_SOLD` | Stock decremented by a completed transaction |

**Transaction events**
| Code | Trigger |
|---|---|
| `TRANSACTION_CREATED` | New pending transaction opened |
| `TRANSACTION_UPDATED` | Products modified in a pending transaction |
| `TRANSACTION_COMPLETED` | Transaction finalized / payment taken |
| `TRANSACTION_CANCELLED` | Transaction cancelled |

---

## API Endpoints

### Auth — `/auth`

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/auth/login` | None | — | Login; returns `{ token, user }` |
| GET | `/auth/me` | Token | any | Get current user profile |
| POST | `/auth/admin-create-user` | Token | admin | Create new user |
| POST | `/auth/admin-delete-user` | Token | admin | Delete user by username |
| POST | `/auth/admin-update-user` | Token | admin | Update username/role |
| POST | `/auth/admin-change-password` | Token | admin | Force-change user password |
| GET | `/auth/admin/list-users` | Token | admin | List all users (excludes self) |
| GET | `/auth/admin/user/:id` | Token | admin | Get user by ID |
| POST | `/auth/manager-admin-request` | Token | manager | Log an admin request message |

### Products — `/products`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/products` | Token | Paginated list; query: `name` (regex), `page`, `limit` |
| POST | `/products` | Token | Create product |
| PUT | `/products/:id` | Token | Update name/price/stock |
| DELETE | `/products/:id` | Token | Delete product |
| POST | `/products/:id/increase-stock` | Token | Add qty to stock; logs to Log |
| POST | `/products/:id/decrease-stock` | Token | Subtract qty from stock; logs to Log |
| POST | `/products/:id/update-stocks` | Token | Set stock to exact value; logs to Log |

### Sales — `/sales`

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/sales/transaction` | Token | any | Create pending transaction |
| POST | `/sales/transaction-update-products` | Token | owner/manager/admin | Update products in pending transaction |
| POST | `/sales/transaction-finalize` | Token | owner/manager/admin | Set status → completed; snapshots `price_at_sale`, decrements stock, logs `TRANSACTION_COMPLETED` + `STOCK_SOLD` per product |
| POST | `/sales/transaction-cancel` | Token | owner/manager/admin | Set status → cancelled |
| GET | `/sales/transactions` | Token | any | List transactions; query: `status`, `seller`, `from`, `to`, `page`, `limit` |
| GET | `/sales/transaction/:id` | Token | any | Get single transaction detail |
| GET | `/sales/transaction-logs` | Token | any | Get audit logs; query: `event`, `from`, `to`, `page`, `limit` |
| GET | `/sales/stats` | Token | any | Dashboard stats: totalItemsSold, totalStocks, todaysSales, totalRevenue |

### Export — `/export`
All export endpoints stream a file download. Require manager+ role.

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/export/transactions/csv` | Token | manager/admin | Transactions as CSV; query: `from`, `to`, `status`, `seller` |
| GET | `/export/transactions/pdf` | Token | manager/admin | Transactions as PDF report; same filters |
| GET | `/export/inventory/csv` | Token | manager/admin | Full product list with current stock as CSV |
| GET | `/export/inventory/low-stock/csv` | Token | manager/admin | Only products at or below `low_stock_threshold` |
| GET | `/export/audit-log/csv` | Token | admin | Audit log as CSV; query: `event`, `actor`, `from`, `to` |

---

## Role-Based Access Control

| Action | Staff | Manager | Admin |
|---|---|---|---|
| View own transactions | ✓ | ✓ | ✓ |
| View all transactions | — | ✓ | ✓ |
| Create transaction | ✓ | ✓ | ✓ |
| Edit/finalize own transaction | ✓ | ✓ | ✓ |
| Edit/finalize any transaction | — | ✓ | ✓ |
| View inventory | ✓ | ✓ | ✓ |
| Modify products / stock | — | ✓ | ✓ |
| View dashboard stats | — | ✓ | ✓ |
| Export transactions / inventory | — | ✓ | ✓ |
| Export audit log | — | — | ✓ |
| View audit log (filtered) | — | ✓ | ✓ |
| User management | — | — | ✓ |
| Send admin request | — | ✓ | — |

Backend enforcement: `verifyToken` on all protected routes; `verifyAdmin` on admin routes; in-route `req.user.role` checks for manager/staff distinction.

---

## Frontend Navigation Tree

```
Stack (root)
├── (auth)                          → unauthenticated
│   └── login
└── (tabs)                          → authenticated
    ├── index          (Home / dashboard)
    ├── inventory      (Inventory)
    ├── sales          (Sales)
    └── reports        (Reports + export)

Outside tabs (push navigation):
├── /transaction                    → new transaction / POS screen
├── /users                          → admin-only user management
├── /transactions/[transactionId]   → transaction detail / edit
└── /audit-log                      → audit log viewer (manager/admin)
```

---

## UI Design System

### Color Palette

| Token | Value | Usage |
|---|---|---|
| `background` | `#fafafa` | Screen background |
| `surface` | `#ffffff` | Cards, modals, inputs |
| `primary` | `#1a2235` | Header, nav, primary buttons, UI chrome |
| `currency` | `#16a34a` | All monetary values (₱ amounts) only |
| `statBlue` | `#dbeafe` / `#1d4ed8` | Stock value stat card (bg / text) |
| `statGreen` | `#dcfce7` / `#15803d` | Today's sales stat card (bg / text) |
| `statNeutral` | `#f3f4f6` / `#374151` | Count-based stat cards (bg / text) |
| `border` | `#e5e7eb` | Dividers, input borders |
| `textPrimary` | `#111827` | Main body text |
| `textSecondary` | `#6b7280` | Labels, subtitles, metadata |
| `danger` | `#dc2626` | Destructive actions, errors |
| `warning` | `#d97706` | Low-stock alerts |
| `statusCompleted` | `#16a34a` | Status text: completed |
| `statusPending` | `#d97706` | Status text: pending |
| `statusCancelled` | `#6b7280` | Status text: cancelled |

Header background: `#1a2235` (dark navy) — header text and icons: `#ffffff`.

### Spacing

| Token | Value |
|---|---|
| `xs` | 4px |
| `sm` | 8px |
| `md` | 12px |
| `lg` | 16px |
| `xl` | 24px |
| `screenPadding` | 12px (horizontal screen edge padding) |
| `cardPadding` | 12px |
| `listGap` | 8px |
| `sectionGap` | 16px |

### Border Radius

| Element | Value |
|---|---|
| Cards | 6px |
| Buttons | 4px |
| Inputs / search bars | 4px |
| Badges / chips | 4px |
| Modals | 8px |

### Typography

Font family: **Outfit** (loaded via `expo-font` from `frontend/assets/fonts/`).
Constants exported from `constants/colors.js`: `Font` (family names), `FontSize` (sizes).

| Role | Size | Font variant | Transform |
|---|---|---|---|
| Screen title (in header) | 24px | `Outfit-Bold` | — |
| Section header / label | 13px | `Outfit-SemiBold` | Uppercase + letter-spacing 0.8 |
| Body text | 14px | `Outfit-Regular` | — |
| Numeric values (stats) | 20px | `Outfit-Bold` | — |
| List primary text | 15px | `Outfit-SemiBold` | — |
| List secondary text | 13px | `Outfit-Regular` | — |
| Button label | 14px | `Outfit-SemiBold` | — |

### Component Patterns

**Stat cards** — Three equal-width cards in a row. Each has a colored background tint and matching text color per token table above. No shadow. No border.

**List rows (Sales, Inventory)** — No card wrapping. Each row is flat: primary text + value on one line, secondary info on the second line. Separated by a 1px `border` divider. No left-border accent. Status shown as colored text inline, not a badge.

**Section headers** — Uppercase label style (13px, 600, letter-spacing). Used above list sections, not as screen titles.

**Home screen** — No hint banner. No Quick Actions. Header + stat cards + "Recent Transactions" section (last 5, flat row style) + floating action button (bottom-right) for new transaction.

**Buttons** — Primary: `primary` bg + white text. Destructive: `danger` bg + white text. No rounded pill shapes.

**Inputs / Search bars** — `surface` bg, `border` border (1px), radius 4px.

---

## Known Issues / Tech Debt

1. `backend/routes/products.js` — log writes use `req.userId` (undefined); should be `req.user.id`.
2. `backend/routes/sales.js` `transaction-update-products` — compares `transaction.seller._id` (ObjectId) with `req.user.id` (string); needs `.toString()`.
3. No middleware for manager role; enforced inline per-route only.
4. No request validation/sanitization on any backend route.
5. Reports tab is a stub — to be replaced with analytics + export UI.
6. `frontend/context/AuthContext.jsx` — dev/prod API URL switch is manual (not env-flag driven).
7. Log schema uses loose `type` enum — must be migrated to structured `event` codes (see Event Types above).
8. Transaction `products` array has no `price_at_sale` snapshot — historical totals are unreliable if prices change.
9. `STOCK_SOLD` event not emitted on finalize — stock decrements are untracked in audit log.
