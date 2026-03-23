# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Il Vento" — a full-stack inventory management system built for CS304. React Native/Expo frontend + Node.js/Express backend + MongoDB.

## Commands

### Backend (`/backend`)
```bash
npm run dev      # Start with nodemon (auto-reload)
npm start        # Start production server
```

### Frontend (`/frontend`)
```bash
npm start        # Start Expo dev server
npm run android  # Run on Android
npm run ios      # Run on iOS
npm run web      # Run in browser
```

## Architecture

### Backend
REST API on port 3000 (configurable via `.env`). Three route groups:
- `POST /auth/login`, `/auth/users` (admin-only user management), `/auth/change-password`
- `/products` — CRUD + stock operations (`increaseStock`, `decreaseStock`)
- `/sales` — transaction lifecycle + statistics

All requests (except login) require JWT in `Authorization: Bearer <token>` header. Role-based middleware in `middlewares.js` gates routes by `admin > manager > staff` hierarchy. Major actions are written to the `Log` collection for audit trail.

### Frontend
Expo Router file-based routing. Auth state (JWT + user info) lives in `context/AuthContext.jsx` and is persisted via `expo-secure-store`.

Tab layout (`app/(tabs)/`):
- **Home** — dashboard stats
- **Inventory** — product list, add/update products via modals
- **Sales** — create/manage transactions
- **Reports** — analytics

Admin-only `app/users.jsx` is accessible outside the tab bar. Transaction detail/edit lives at `app/transactions/[transactionId]/`.

UI components are in `components/ui/` (Button, Card, Modal, Input, etc.) backed by `react-native-paper`.

### Data Models
- **User**: `username`, `password` (bcrypt), `role` (admin/manager/staff)
- **Product**: `name`, `price`, `stock`
- **Transaction**: `status` (pending/completed/cancelled), `seller` (User ref), `products` array of `{product, quantity}`
- **Log**: audit record with `message`, `type`, `user`, `transaction_id`, `products_involved`

## Environment
Both `backend/.env` and `frontend/.env` are required. Backend needs `MONGO_URI`, `JWT_SECRET`, `PORT`. Frontend needs the backend API base URL.
