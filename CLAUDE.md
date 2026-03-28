# Shopping List — Web App (Stock Management)

This is a React web application for **stock management only** — it is not a shopping list UI. It connects to an existing Supabase project whose schema and RLS policies are already in place.

## Tech Stack

- **React 18** with **TypeScript** (strict mode)
- **Vite** as build tool
- **Tailwind CSS v4** for styling — utility classes only, no custom CSS files
- **Supabase JS client** (`@supabase/supabase-js`)
- **TanStack Query** (`@tanstack/react-query`) for data fetching and cache management
- **React Router v6** for routing
- Auth token stored in `localStorage` (Supabase default for web — no special storage adapter needed)

## Supabase Backend

The Supabase project already exists with its full schema and RLS policies in place. This app only uses a subset of the schema:

- `profiles` — user display names
- `products` — shared product catalog (name, id)
- `stock` — per-list stock entries (quantity, unit, product_id, list_id)
- `lists` / `list_members` — to resolve which list(s) the user can access

All RLS policies are already in place on the backend. Auth is required for all queries.

## Directory Structure

```
src/
├── components/
│   └── stock/
│       ├── StockList.tsx          # Main list of stock entries
│       ├── StockRow.tsx           # Single row: name, quantity badge, +/- buttons, edit, delete
│       ├── StockEditModal.tsx     # Edit quantity + unit for an existing entry
│       ├── StockAddModal.tsx      # Add new stock entry (product search + quantity + unit)
│       └── ProductSearchInput.tsx # Autocomplete input backed by ProductsService.searchProducts()
├── hooks/
│   └── useStock.ts                # TanStack Query wrapper: fetch, increment, decrement, set, delete
├── services/
│   └── supabase/
│       ├── client.ts              # Supabase client init
│       ├── auth.ts                # AuthService
│       ├── stock.ts               # StockService (mirrors the RN app's service)
│       └── products.ts            # ProductsService (mirrors the RN app's service)
├── types/
│   ├── database.ts                # Supabase table types (copy from RN app, prune unused tables if desired)
│   └── models.ts                  # App-level interfaces (StockEntry, Product)
├── pages/
│   ├── LoginPage.tsx
│   └── StockPage.tsx              # Main page — list selector + stock list
├── context/
│   └── AuthContext.tsx            # User/session state
└── main.tsx
```

## Database Schema (stock-relevant tables only)

### products
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| name | TEXT NOT NULL | Unique by convention (case-insensitive) |
| created_by | UUID FK | -> auth.users |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### stock
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| product_id | UUID FK | -> products |
| list_id | UUID FK | -> lists |
| quantity | NUMERIC | Default 0, never negative |
| unit | TEXT | Nullable (e.g. "kg", "L", "pieces") |
| updated_at | TIMESTAMPTZ | |
| updated_by | UUID FK | -> auth.users, nullable |

UNIQUE constraint on `(product_id, list_id)`.

### RLS on stock
- SELECT: list members only (via `is_list_member()` function)
- INSERT/UPDATE/DELETE: list editor or owner

## RPC Functions

### `upsert_stock(p_product_id, p_list_id, p_quantity_delta)`
Atomically increments (or creates) a stock row. Always use this for **increment** operations — never do a read-then-write for incrementing.

```typescript
await supabase.rpc('upsert_stock', {
  p_product_id: productId,
  p_list_id: listId,
  p_quantity_delta: delta,
});
```

### `is_list_member(p_list_id, p_user_id) -> BOOLEAN`
Used internally by RLS. You do not call this directly.

## TypeScript Models

```typescript
// src/types/models.ts

export interface StockEntry {
  id: string;
  productId: string;
  productName: string;
  listId: string;
  quantity: number;
  unit: string | null;
  updatedAt: string;
  updatedBy: string | null;
}

export interface Product {
  id: string;
  name: string;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}
```

Database columns are **snake_case**; app models are **camelCase**. Always map at the service/hook layer, never in components.

## Service Layer

All Supabase calls go through static service classes. Never call `supabase.from()` directly in components or hooks.

### StockService — key methods

```typescript
// Fetch all stock for a list, joined with product name, ordered by updated_at desc
StockService.getListStock(listId: string)
  => { data: StockRowWithProduct[], error }

// Increment via RPC (fire-and-forget safe)
StockService.incrementStock(productId, listId, delta = 1)
  => { error }

// Decrement with guard: returns { blocked: true } if quantity < delta
// Also has a DB-level .gte('quantity', delta) guard for race conditions
StockService.decrementStock(stockId, currentQuantity, delta = 1)
  => { data, error, blocked: boolean }

// Upsert: set quantity + unit directly (used from edit modal and manual add)
StockService.setStock(productId, listId, quantity, unit)
  => { data, error }

// Hard delete a stock entry (removes product from tracking for this list)
StockService.deleteStock(stockId)
  => { error }
```

### ProductsService — key methods

```typescript
// Autocomplete search (prefix match, case-insensitive, limit 10)
ProductsService.searchProducts(query, limit = 10)
  => { data: ProductRow[], error }

// Find existing product by exact name (case-insensitive)
ProductsService.findByName(name)
  => { data: ProductRow | null, error }

// Find or create — use this when adding stock for a typed-in name
ProductsService.findOrCreate(name)
  => { data: ProductRow, error }
```

## Known Gotchas

1. **Increment must use the RPC** (`upsert_stock`), never a read-modify-write. The RPC is atomic and creates the row if it doesn't exist.

2. **Decrement has a two-level guard**: check `currentQuantity < delta` in JS before calling, AND pass `.gte('quantity', delta)` to the DB update. If the DB guard blocks (race condition), `data` will be `null` — treat this as `blocked: true` and refetch.

3. **Quantity is never negative**: enforce `qty >= 0` before any write. The UI should disable the `−` button when `quantity === 0`.

4. **Product names are shared** across all users/lists in the `products` table. `findOrCreate` uses a case-insensitive match to avoid duplicates — always go through it, never insert directly.

5. **List resolution**: The stock screen needs a `listId`. On load, read the user's lists via `ListsService.getUserLists(userId)` and let them pick one, or persist the last selected list in `localStorage` under `default_list_id`.

6. **`stock` rows joined with `products`**: Fetch with `.select('*, products(name)')` to get the product name in one query. The `StockRowWithProduct` type handles this join shape.

## Feature Requirements

### Stock Page

- **List selector**: dropdown or tab to choose which list's stock to view. Persist selection in `localStorage`.
- **Stock list**: sorted alphabetically by product name. Each row shows:
  - Product name
  - Quantity badge (red when 0, primary color otherwise)
  - Unit label (if set)
  - `−` button (disabled at 0)
  - `+` button
  - Edit button → opens `StockEditModal`
  - Delete button → confirm then remove
- **Add stock button** (FAB or top-right): opens `StockAddModal`
- **Optimistic updates** on `+` and `−`: update local state immediately, revert on error

### StockAddModal

- Product search input with debounced autocomplete (300ms, min 2 chars)
- Dropdown shows matching products + "Add as new product" option when no exact match
- Quantity input (numeric, default 1)
- Unit input (text, optional)
- On save: `ProductsService.findOrCreate(name)` then `StockService.setStock(...)`

### StockEditModal

- Shows product name (read-only)
- Quantity input (numeric, pre-filled)
- Unit input (text, pre-filled)
- On save: `StockService.setStock(productId, listId, qty, unit)`

### Authentication

- Email + password sign in only (sign up is handled by the mobile app)
- Redirect unauthenticated users to `/login`
- On sign-in, read `default_list_id` from `localStorage` to restore last list

## Conventions

- **TypeScript strict mode** throughout
- **Functional components** with hooks — no class components
- **Named exports** for all components and services
- **Static methods** on service classes — no instantiation
- **Files**: PascalCase for components (`StockRow.tsx`), camelCase for hooks/utils (`useStock.ts`)
- **Services return `{ data, error }` tuples** (Supabase pattern) — handle errors in the hook or component, never swallow silently
- All user text input must be **sanitized** before writing to the DB (strip HTML tags, trim whitespace)
- Use **TanStack Query** for all server state — do not store fetched data in `useState` directly. Use `useMutation` for writes and `useQuery` for reads.

## Styling (Tailwind CSS)

- Use **Tailwind utility classes** directly on JSX elements — no separate CSS files, no CSS modules, no inline `style` props
- Do not use `@apply` in CSS files except for truly global base styles (e.g. `body` font)
- For conditional classes, use template literals or the `clsx` / `cn` helper:
  ```tsx
  import { clsx } from 'clsx';
  <span className={clsx('rounded-full px-2 py-0.5 text-sm font-bold text-white', isAtZero ? 'bg-red-500' : 'bg-orange-600')} />
  ```
- **Color palette** (mirrors the mobile app's earthy theme):
  - Primary (burnt orange): `bg-orange-600` / `text-orange-600`
  - Warning / important: `bg-amber-400` / `text-amber-400`
  - Success / bought: `text-olive` → use `text-yellow-700` as closest Tailwind approximation
  - Error / zero stock: `bg-red-500` / `text-red-500`
  - Background light: `bg-stone-50`, dark: `bg-stone-900`
  - Card light: `bg-white`, dark: `bg-stone-800`
  - Border: `border-stone-200` / dark: `border-stone-700`
- Support **dark mode** via Tailwind's `dark:` variant (use `class` strategy in `tailwind.config`)
- Do not hardcode hex colors in className strings — stick to Tailwind palette tokens

## Auth Setup

```typescript
// src/services/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/database';

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

Required `.env` variables:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Build & Dev

```bash
npm run dev      # Vite dev server
npm run build    # Production build
npm run preview  # Preview production build
```
