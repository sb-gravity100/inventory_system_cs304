# commits.md

Prepend a new entry here after every commit. Most recent commit at top.

Format:
```
### `<short-hash>` · <YYYY-MM-DD> · <commit subject>
- `affected/file1`
- `affected/file2`
```

---

### `0c31bd1` · 2026-03-23 · docs: update typography spec to reference Outfit font and mark design system tasks done
- `PLAN.md`
- `PHASES.md`

### `10f94d6` · 2026-03-23 · feat: add Outfit font and design system tokens (colors, spacing, radius, typography)
- `frontend/app/_layout.jsx`
- `frontend/assets/fonts/` (9 Outfit .ttf files)
- `frontend/constants/colors.js`

### `c89a24b` · 2026-03-23 · docs: add UI design system spec and Phase 5.5 UI overhaul tasks
- `PLAN.md`
- `PHASES.md`

### `f016811` · 2026-03-23 · feat: rename bat scripts to underscore case and add reset_db.bat
- `run_backend.bat`
- `run_frontend.bat`
- `reset_db.bat`
- `FILE_INDEX.md`

---

### `e0dd0ad` · 2026-03-23 · feat: add reset-db script to wipe collections and re-seed admin
- `backend/scripts/reset-db.js`
- `backend/package.json`
- `FILE_INDEX.md`

---

### `dbaabbd` · 2026-03-23 · feat: add ErrorBoundary component wrapping root layout
- `frontend/components/ErrorBoundary.jsx`
- `frontend/app/_layout.jsx`
- `FILE_INDEX.md`

---

### `0a5203a` · 2026-03-23 · docs: mark Phase 4 tasks done (except error boundary)
- `PHASES.md`

---

### `edce1e5` · 2026-03-23 · feat: add pull-to-refresh on users screen
- `frontend/app/users.jsx`

---

### `449f923` · 2026-03-23 · feat: add inline request validation on all backend routes
- `backend/routes/auth.js`
- `backend/routes/products.js`
- `backend/routes/sales.js`

---

### `f11132b` · 2026-03-23 · feat: add verifyManager middleware for manager/admin role guard
- `backend/middlewares.js`

---

### `864491c` · 2026-03-23 · fix: ObjectId string comparison and add manager/admin bypass in sales routes
- `backend/routes/sales.js`

---

### `06b1e49` · 2026-03-23 · fix: replace req.userId with req.user.id in products route log writes
- `backend/routes/products.js`

---

### `2fbc06e` · 2026-03-23 · scripts: add run-backend and run-frontend bat scripts
- `run-backend.bat`
- `run-frontend.bat`

---

### `6f1df03` · 2026-03-23 · docs: add PHASES.md with 7-phase development plan
- `PHASES.md`

---

### `e933e73` · 2026-03-23 · docs: add PLAN.md with POS schema, endpoints, and event types
- `PLAN.md`

---

### `587829e` · 2026-03-23 · docs: update commits.md
- `commits.md`

---

### `734b671` · 2026-03-23 · docs: add FILE_INDEX.md
- `FILE_INDEX.md`

---

### `7114d91` · 2026-03-23 · docs: rewrite CLAUDE.md with general session rules and project context
- `CLAUDE.md`

---

### `f95b277` · 2026-03-23 · Initial commit: Il Vento inventory management system
- `backend/server.js`
- `backend/db.js`
- `backend/middlewares.js`
- `backend/Models/User.js`
- `backend/Models/Product.js`
- `backend/Models/Transaction.js`
- `backend/Models/Log.js`
- `backend/routes/auth.js`
- `backend/routes/products.js`
- `backend/routes/sales.js`
- `frontend/app/_layout.jsx`
- `frontend/app/(auth)/_layout.jsx`
- `frontend/app/(auth)/login.jsx`
- `frontend/app/(tabs)/_layout.jsx`
- `frontend/app/(tabs)/index.jsx`
- `frontend/app/(tabs)/inventory.jsx`
- `frontend/app/(tabs)/sales.jsx`
- `frontend/app/(tabs)/reports.jsx`
- `frontend/app/transaction.jsx`
- `frontend/app/users.jsx`
- `frontend/app/transactions/[transactionId]/index.jsx`
- `frontend/context/AuthContext.jsx`
- `frontend/components/` *(all)*
- `frontend/constants/colors.js`
- `frontend/utils/quickActions.js`
