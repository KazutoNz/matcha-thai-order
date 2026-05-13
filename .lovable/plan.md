# Plan: Migrate All Data to Database API

## Goal
Replace every remaining mock-data / localStorage reference with real Supabase database queries. No page should read from `useCartStore.orders` or the static `products` array anymore.

## Phase 1: Database Migration
- Add `sweetness text` and `toppings text[]` columns to `order_items` so customisations are persisted.

## Phase 2: New / Updated Hooks
- `src/hooks/useOrders.ts` – Fetch current-user orders (for Home banner & Tracking) with auto-refresh.
- `src/hooks/useAdminOrders.ts` – Fetch **all** orders (admin only) with status counts for the dashboard.

## Phase 3: Page Refactors

### Home.tsx
- Replace `products.slice(0, 3)` with a live query `SELECT * FROM products ORDER BY order_count DESC LIMIT 3`.
- Replace `useCartStore.orders` with `useOrders()` to show the latest real order status banner.

### Tracking.tsx
- Replace `useCartStore.orders` with `useOrders()`.
- Display the most recent DB order with its items (joined query).

### Checkout.tsx
- When inserting `order_items`, also write `sweetness` and `toppings` into the new columns.
- After success, invalidate the orders cache so Tracking & Home see the new order immediately.

### Admin Dashboard
- Replace `useCartStore` stats with aggregated DB query (`count(*)`, `sum(total)` grouped by status).

### Admin Orders
- Replace `useCartStore.orders` with `useAdminOrders()`.
- Add a Supabase `update` call when admin changes order status.

### Admin Products
- Already uses DB; no changes needed.

## Phase 4: Cleanup
- Remove the static `products` array from `src/lib/products.ts` (keep types, toppings, sweetness constants).
- Strip `orders`, `addOrder`, `updateOrderStatus` out of `useCartStore` (cart items stay in memory).

## Technical Details
- Use `supabase.from(...).select(...)` with `useEffect` + `useState` for now (project already does this in Menu.tsx).
- RLS policies already allow authenticated users to read their own orders and admins to read all orders.
- For admin pages we can query `orders` directly; the RLS admin policy handles authorization.
