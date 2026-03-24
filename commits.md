# commits.md

Prepend a new entry here after every commit. Most recent commit at top.

### `935ac39` · 2026-03-24 · fix: increase POS cart input height to fit placeholder text
- `frontend/app/pos.jsx`

### `c139115` · 2026-03-24 · fix: clip overflowing placeholder text in POS cart inputs
- `frontend/app/pos.jsx`

### `29ff39c` · 2026-03-24 · chore: add .git backup script and post-commit rule
- `scripts/backup_git.sh`
- `CLAUDE.md`
- `.gitignore`

### `0e4ea19` · 2026-03-24 · fix: POS product grid 3-col compact tiles
- `frontend/app/pos.jsx`

### `1971885` · 2026-03-24 · fix: Loading wrapper missing flex:1 caused FlatList to push cart off screen
- `frontend/components/ui/Loading.jsx`

### `ed6d135` · 2026-03-24 · fix: POS chips flatten, paginate product grid, bottom scroll padding
- `frontend/app/pos.jsx`

### `76f81cc` · 2026-03-24 · feat: POS mode — 2-col grid, category chips, discount/notes, hold/recall
- `frontend/app/pos.jsx`

### `a4416f5` · 2026-03-24 · feat: pass discount and notes through POST /sales/transaction
- `backend/routes/sales.js`

### `6e85c6a` · 2026-03-24 · docs: allow clarifying questions via AskUserQuestion tool
- `CLAUDE.md`

### `d64f5b5` · 2026-03-24 · feat: replace Create Transaction with full POS Mode screen
- `frontend/app/pos.jsx` (new)
- `frontend/app/transaction.jsx` (deleted)
- `frontend/app/_layout.jsx`
- `frontend/app/(tabs)/inventory.jsx`
- `frontend/app/(tabs)/index.jsx`
- `frontend/utils/quickActions.js`
- `FILE_INDEX.md`

Format:
```
### `<short-hash or pending>` · <YYYY-MM-DD> · <commit subject>
- `affected/file1`
- `affected/file2`
```

---

### `<pending>` · 2026-03-24 · feat: replace New Category FAB action with Edit Categories screen
- `frontend/app/categories.jsx` *(new)*
- `frontend/app/add-category.jsx` *(deleted)*
- `frontend/app/_layout.jsx`
- `frontend/app/(tabs)/inventory.jsx`
- `FILE_INDEX.md`

### `<pending>` · 2026-03-24 · fix: replace category chip bar with bottom-sheet dropdown on inventory
- `frontend/app/(tabs)/inventory.jsx`

### `<pending>` · 2026-03-24 · fix: FAB color adapts to theme via fabBg/fabIcon tokens
- `frontend/constants/colors.js`
- `frontend/components/ui/FAB.jsx`

### `<pending>` · 2026-03-24 · feat: category filter chips on inventory + clean up product detail category picker
- `frontend/app/(tabs)/inventory.jsx`
- `frontend/app/products/[productId].jsx`

### `<pending>` · 2026-03-24 · feat: new-category FAB action and add-category screen
- `frontend/app/add-category.jsx` *(new)*
- `frontend/app/_layout.jsx`
- `frontend/app/(tabs)/inventory.jsx`
- `frontend/app/add-category.jsx` *(new)*
- `frontend/app/_layout.jsx`
- `frontend/app/(tabs)/inventory.jsx`
- `frontend/app/products/[productId].jsx`
- `FILE_INDEX.md`

### `<pending>` · 2026-03-24 · feat: product detail screen with toggleable edit mode
- `frontend/app/products/[productId].jsx` *(new)*
- `frontend/app/_layout.jsx`
- `frontend/components/ProductCard.jsx`
- `frontend/app/(tabs)/inventory.jsx`
- `frontend/components/UpdateStockModal.jsx` *(deleted)*
- `backend/routes/products.js`
- `FILE_INDEX.md`

### `<pending>` · 2026-03-24 · feat: add seed_products.bat root script
- `seed_products.bat` *(new)*
- `FILE_INDEX.md`

### `92f7c01` · 2026-03-24 · feat: add seed-products script for sample data
- `backend/scripts/seed-products.js` *(new)*
- `backend/package.json`

### `a5a375a` · 2026-03-24 · fix: FAB bottom prop + users screen lift
- `frontend/components/ui/FAB.jsx`
- `frontend/app/users.jsx`

### `bd35c69` · 2026-03-24 · docs: reflect product schema overhaul in PLAN, PHASES, FILE_INDEX
- `PLAN.md`
- `PHASES.md`
- `FILE_INDEX.md`

### `c712be6` · 2026-03-24 · feat: update ProductCard and add-product screen for new schema
- `frontend/components/ProductCard.jsx`
- `frontend/app/add-product.jsx`

### `f16d385` · 2026-03-24 · feat: product schema overhaul + Category model
- `backend/Models/Category.js` *(new)*
- `backend/Models/Product.js`
- `backend/routes/categories.js` *(new)*
- `backend/routes/products.js`
- `backend/server.js`

### `a2adb49` · 2026-03-24 · feat: replace AddProductModal with add-product modal screen
- `frontend/app/add-product.jsx` *(new)*
- `frontend/app/_layout.jsx`
- `frontend/app/(tabs)/inventory.jsx`

### `1a8fafa` · 2026-03-24 · feat: sleek login screen redesign + PasswordInput forwardRef
- `frontend/app/(auth)/login.jsx`
- `frontend/components/PasswordInput.jsx`

### `84937d4` · 2026-03-24 · feat: overhaul Users screen and unmodified UI components
- `frontend/app/users.jsx`
- `frontend/components/ui/Card.jsx`
- `frontend/components/ui/Modal.jsx`
- `frontend/components/ui/Dropdown.jsx`
- `frontend/components/ui/FormField.jsx`
- `frontend/components/PasswordInput.jsx`
- `frontend/components/UpdateStockModal.jsx`
- `frontend/components/AddProductModal.jsx`

### `bdef47b` · 2026-03-24 · fix: update all Log writes to new event/actor schema across auth, products, sales routes
- `backend/routes/auth.js`
- `backend/routes/products.js`
- `backend/routes/sales.js`

### `0f2e8de` · 2026-03-24 · fix: remove next param from async pre-save hook
- `backend/Models/User.js`

### `982824b` · 2026-03-24 · feat: add BCRYPT_PEPPER env var; apply pepper in pre-save hash and login compare
- `backend/Models/User.js`
- `backend/routes/auth.js`

### `2129520` · 2026-03-24 · feat: bcrypt pre-save hook on User model; remove manual hashing from auth routes
- `backend/Models/User.js`
- `backend/routes/auth.js`

### `89c8df6` · 2026-03-24 · feat: apply Outfit font and design tokens to UI components
- `frontend/components/ui/Typography.jsx`
- `frontend/components/ui/Button.jsx`
- `frontend/components/ui/Input.jsx`
- `frontend/components/ui/Header.jsx`

### `f09de51` · 2026-03-24 · feat: transaction detail receipt card layout, truncated ID, action buttons below
- `frontend/app/transactions/[transactionId]/index.jsx`

### `e379c23` · 2026-03-24 · feat: new transaction screen - receipt rows, cart bottom sheet
- `frontend/app/transaction.jsx`

### `c6bdd96` · 2026-03-24 · feat: inventory screen 2-column tile grid; ProductCard tile redesign
- `frontend/app/(tabs)/inventory.jsx`
- `frontend/components/ProductCard.jsx`

### `dd313c8` · 2026-03-24 · feat: sales screen - title in body, 2+1 stat cards, flat transaction list
- `frontend/app/(tabs)/sales.jsx`

### `3d1319f` · 2026-03-24 · feat: TransactionItem flat row - colored status, chevron, no badge/border
- `frontend/components/TransactionItem.jsx`

### `e8dba66` · 2026-03-24 · feat: home screen - title in body, 2+1 stat cards, recent transactions, FAB
- `frontend/app/(tabs)/index.jsx`

### `7c229e9` · 2026-03-24 · feat: StatCard color-coded tint scheme (blue/green/neutral)
- `frontend/components/home/StatCard.jsx`

### `86a48af` · 2026-03-24 · feat: tab bar icon-only with pill highlight, no labels
- `frontend/app/(tabs)/_layout.jsx`

### `0f2ec9b` · 2026-03-23 · docs: update UI spec with structural layout decisions (tab bar, headers, grid, receipt, cart sheet)
- `PLAN.md`
- `PHASES.md`

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
