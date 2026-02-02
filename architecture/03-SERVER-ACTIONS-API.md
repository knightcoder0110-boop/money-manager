# Server Actions — API Contract

Every function below is a Server Action (`"use server"`). These are the ONLY way the app talks to the database. Every agent building UI components must use these exact function signatures.

---

## `src/actions/transactions.ts`

```typescript
"use server"

// GET — List transactions with optional filters
export async function getTransactions(filters?: {
  type?: "expense" | "income";
  category_id?: string;
  subcategory_id?: string;
  necessity?: "necessary" | "unnecessary" | "debatable";
  event_id?: string;
  date_from?: string;       // ISO date string "2025-01-01"
  date_to?: string;         // ISO date string "2025-01-31"
  search?: string;          // search in notes
  limit?: number;           // default 50
  offset?: number;          // for pagination
}): Promise<{
  data: Transaction[];
  count: number;
}>

// GET — Single transaction
export async function getTransaction(id: string): Promise<Transaction | null>

// CREATE
export async function createTransaction(input: {
  type: "expense" | "income";
  amount: number;
  category_id: string;
  subcategory_id?: string;
  necessity?: "necessary" | "unnecessary" | "debatable";
  note?: string;
  transaction_date?: string;  // ISO date, defaults to today
  event_id?: string;
}): Promise<{ data: Transaction | null; error: string | null }>

// UPDATE
export async function updateTransaction(
  id: string,
  input: Partial<{
    amount: number;
    category_id: string;
    subcategory_id: string;
    necessity: "necessary" | "unnecessary" | "debatable";
    note: string;
    transaction_date: string;
    event_id: string | null;
  }>
): Promise<{ data: Transaction | null; error: string | null }>

// DELETE
export async function deleteTransaction(id: string): Promise<{ error: string | null }>
```

---

## `src/actions/categories.ts`

```typescript
"use server"

// GET — All categories with their subcategories
export async function getCategories(options?: {
  include_subcategories?: boolean;  // default true
  type?: "expense" | "income";     // filter by is_income
}): Promise<CategoryWithSubs[]>

// CREATE category
export async function createCategory(input: {
  name: string;
  icon?: string;
  color?: string;
  is_essential?: boolean;
  is_income?: boolean;
}): Promise<{ data: Category | null; error: string | null }>

// UPDATE category
export async function updateCategory(
  id: string,
  input: Partial<{
    name: string;
    icon: string;
    color: string;
    is_essential: boolean;
    sort_order: number;
  }>
): Promise<{ data: Category | null; error: string | null }>

// DELETE category
export async function deleteCategory(id: string): Promise<{ error: string | null }>

// CREATE subcategory
export async function createSubcategory(input: {
  category_id: string;
  name: string;
}): Promise<{ data: Subcategory | null; error: string | null }>

// UPDATE subcategory
export async function updateSubcategory(
  id: string,
  input: Partial<{ name: string; sort_order: number }>
): Promise<{ data: Subcategory | null; error: string | null }>

// DELETE subcategory
export async function deleteSubcategory(id: string): Promise<{ error: string | null }>
```

---

## `src/actions/events.ts`

```typescript
"use server"

// GET — All events
export async function getEvents(options?: {
  limit?: number;
  offset?: number;
}): Promise<{ data: Event[]; count: number }>

// GET — Single event with its transactions
export async function getEventWithTransactions(id: string): Promise<{
  event: Event | null;
  transactions: Transaction[];
  total: number;
  breakdown: { category_name: string; amount: number }[];
} | null>

// CREATE event
export async function createEvent(input: {
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
}): Promise<{ data: Event | null; error: string | null }>

// UPDATE event
export async function updateEvent(
  id: string,
  input: Partial<{
    name: string;
    description: string;
    start_date: string;
    end_date: string;
  }>
): Promise<{ data: Event | null; error: string | null }>

// DELETE event (transactions unlinked, not deleted)
export async function deleteEvent(id: string): Promise<{ error: string | null }>
```

---

## `src/actions/dashboard.ts`

```typescript
"use server"

// Main dashboard data — single call, returns everything the dashboard needs
export async function getDashboardData(): Promise<{
  balance: number;                  // initial_balance + all income - all expenses
  today_expense: number;
  today_income: number;
  month_expense: number;
  month_income: number;
  month_necessary: number;
  month_unnecessary: number;
  month_debatable: number;
  budget_mode: {
    active: boolean;
    daily_limit: number;
    today_remaining: number;        // daily_limit - today_expense
  };
  recent_transactions: Transaction[];  // last 10
  category_breakdown: {              // this month
    category_id: string;
    category_name: string;
    category_icon: string;
    category_color: string;
    total: number;
  }[];
}>

// Daily spending for a given month (for daily bar chart)
export async function getDailySpending(params: {
  year: number;
  month: number;  // 1-12
}): Promise<{
  date: string;
  total: number;
  necessary: number;
  unnecessary: number;
}[]>
```

---

## `src/actions/analytics.ts`

```typescript
"use server"

// Monthly totals for the last N months
export async function getMonthlyTrends(months?: number): Promise<{
  month: string;          // "2025-01"
  income: number;
  expense: number;
  necessary: number;
  unnecessary: number;
  savings: number;        // income - expense
}[]>

// Category breakdown for a specific month
export async function getCategoryBreakdown(params: {
  year: number;
  month: number;
  category_id?: string;   // if provided, returns subcategory breakdown
}): Promise<{
  id: string;
  name: string;
  icon: string;
  color: string;
  total: number;
  necessary: number;
  unnecessary: number;
  debatable: number;
  transaction_count: number;
}[]>

// Top spending categories across all time or date range
export async function getTopCategories(params?: {
  date_from?: string;
  date_to?: string;
  limit?: number;         // default 5
}): Promise<{
  category_name: string;
  category_icon: string;
  total: number;
  percentage: number;
}[]>
```

---

## `src/actions/settings.ts`

```typescript
"use server"

// GET a setting
export async function getSetting(key: string): Promise<any>

// GET all settings
export async function getAllSettings(): Promise<Record<string, any>>

// UPDATE a setting (upsert)
export async function updateSetting(
  key: string,
  value: any
): Promise<{ error: string | null }>

// Toggle budget mode
export async function toggleBudgetMode(
  active: boolean,
  daily_limit?: number
): Promise<{ error: string | null }>
```

---

## Notes for Agents

1. **Every mutation must call `revalidatePath("/")`** at the end to refresh cached data across all pages.
2. **The `is_budget_mode` field** on transactions is set automatically by `createTransaction` — it reads the current budget_mode setting and stamps it.
3. **Error handling pattern**: Every write action returns `{ data, error }`. If error is non-null, the UI should show a toast.
4. **Amount is always positive** in the DB. The `type` field determines if it's income or expense. The balance calculation is: `initial_balance + SUM(income) - SUM(expense)`.
