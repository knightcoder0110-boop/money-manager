# Agent Task Breakdown — 5 Parallel Agents

## How This Works

Each agent works **independently** on a well-defined slice. No two agents touch the same files. After all agents complete, we do a quick integration pass to wire everything together.

### Shared Dependencies (Created Before Agents Start)
These files must exist BEFORE agents begin. We create them in a **setup step**:

1. `package.json` with all dependencies
2. `next.config.ts`
3. `tailwind.config.ts` + `src/app/globals.css`
4. `tsconfig.json`
5. `components.json` (shadcn/ui config)
6. `src/types/index.ts` (all TypeScript types)
7. `src/lib/supabase/client.ts` + `src/lib/supabase/server.ts`
8. `src/lib/utils.ts` (cn helper, formatCurrency, formatDate)
9. `src/lib/constants.ts`
10. `.env.example`
11. All shadcn/ui components installed in `src/components/ui/`
12. `src/app/layout.tsx` (root layout with font + providers)

---

## Agent 1: Database + Server Actions

**Owns:** `src/actions/*`, Supabase SQL setup

**Deliverables:**
1. SQL migration file: `supabase/migrations/001_initial_schema.sql`
2. SQL seed file: `supabase/migrations/002_seed_data.sql`
3. `src/actions/transactions.ts` — full CRUD with all filters
4. `src/actions/categories.ts` — full CRUD for categories + subcategories
5. `src/actions/events.ts` — full CRUD + getEventWithTransactions
6. `src/actions/settings.ts` — get/set settings + toggleBudgetMode
7. `src/actions/dashboard.ts` — getDashboardData + getDailySpending
8. `src/actions/analytics.ts` — getMonthlyTrends + getCategoryBreakdown + getTopCategories

**References:**
- `architecture/01-DATABASE.md` for schema
- `architecture/03-SERVER-ACTIONS-API.md` for exact function signatures
- `architecture/04-TYPES.md` for types

**Rules:**
- Every write action returns `{ data, error }` pattern
- Every write action calls `revalidatePath("/")` on success
- `createTransaction` must read budget_mode setting and set `is_budget_mode` automatically
- All Supabase queries use the server client (`src/lib/supabase/server.ts`)
- Handle Supabase errors gracefully, return user-friendly error strings

---

## Agent 2: Layout + Shared Components

**Owns:** `src/components/layout/*`, `src/components/transactions/*`, `src/hooks/*`

**Deliverables:**
1. `src/components/layout/app-shell.tsx` — wraps all pages (header + nav + content area)
2. `src/components/layout/mobile-nav.tsx` — bottom nav bar with 5 items
3. `src/components/layout/header.tsx` — top bar: balance display, budget mode indicator
4. `src/components/layout/page-header.tsx` — reusable page title with optional back button
5. `src/components/transactions/transaction-form.tsx` — the add/edit expense+income form
6. `src/components/transactions/transaction-list.tsx` — scrollable list of transactions
7. `src/components/transactions/transaction-item.tsx` — single transaction row
8. `src/components/transactions/transaction-filters.tsx` — filter bar (type, category, necessity, date range)
9. `src/components/transactions/category-picker.tsx` — grid of categories
10. `src/components/transactions/subcategory-picker.tsx` — subcategory dropdown
11. `src/components/transactions/necessity-toggle.tsx` — 3-button toggle
12. `src/hooks/use-budget-mode.ts` — hook to read budget mode state
13. `src/hooks/use-categories.ts` — hook to fetch and cache categories
14. `src/hooks/use-settings.ts` — hook to read settings

**References:**
- `architecture/05-UI-DESIGN.md` for layout specs and component wireframes
- `architecture/04-TYPES.md` for types
- `architecture/03-SERVER-ACTIONS-API.md` for server action signatures (to call from forms)

**Rules:**
- All components must be mobile-responsive
- `transaction-form.tsx` is the MOST IMPORTANT component — must be fast and clean
- Form calls server actions directly (imported at top of client component)
- Use shadcn/ui components from `src/components/ui/` as building blocks
- Use `sonner` for toast notifications after actions
- Amount input must use `inputMode="decimal"` for mobile numeric keyboard
- Category picker: grid layout, tappable icons+labels
- Necessity toggle: 3 colored buttons, one selected at a time
- Budget mode friction dialog: shown when category is non-essential and budget mode is active

---

## Agent 3: Dashboard + Monthly Breakdown Pages

**Owns:** `src/app/page.tsx`, `src/app/monthly/page.tsx`, `src/components/dashboard/*`, `src/components/charts/*`

**Deliverables:**
1. `src/app/page.tsx` — Dashboard page (server component, fetches data, renders components)
2. `src/components/dashboard/balance-card.tsx` — big balance number display
3. `src/components/dashboard/budget-mode-banner.tsx` — red war mode banner
4. `src/components/dashboard/today-summary.tsx` — today's income vs expense
5. `src/components/dashboard/month-summary.tsx` — this month's income vs expense
6. `src/components/dashboard/recent-transactions.tsx` — last 10 transactions
7. `src/components/dashboard/quick-add-fab.tsx` — floating button linking to /add
8. `src/app/monthly/page.tsx` — monthly breakdown page
9. `src/components/charts/category-pie-chart.tsx` — pie chart for category breakdown
10. `src/components/charts/necessity-bar-chart.tsx` — necessary vs unnecessary bar chart
11. `src/components/charts/monthly-trend-chart.tsx` — spending trend line chart
12. `src/components/charts/daily-bar-chart.tsx` — daily spending bar chart

**References:**
- `architecture/05-UI-DESIGN.md` for dashboard and monthly wireframes
- `architecture/03-SERVER-ACTIONS-API.md` for getDashboardData, getDailySpending, getCategoryBreakdown
- `architecture/04-TYPES.md` for types

**Rules:**
- Dashboard page.tsx is a Server Component — call server actions directly
- Chart components are Client Components (`"use client"`) — they receive data as props
- Use Recharts for all charts
- Charts must have consistent colors matching category colors
- Balance card: positive = green, negative = red
- Necessity bar chart: green (necessary), red (unnecessary), yellow (debatable)
- Include the "savings insight" text: "If you cut unnecessary spending, you'd save ₹X"
- Monthly page has a month selector (prev/next arrows)

---

## Agent 4: Add Transaction + Transaction List + Daily Log Pages

**Owns:** `src/app/add/page.tsx`, `src/app/transactions/page.tsx`, `src/app/daily/page.tsx`

**Deliverables:**
1. `src/app/add/page.tsx` — Add expense/income page (composes transaction-form)
2. `src/app/transactions/page.tsx` — All transactions with filters and pagination
3. `src/app/daily/page.tsx` — Calendar-based daily spending log

**References:**
- `architecture/05-UI-DESIGN.md` for page wireframes
- Components from Agent 2 (transaction-form, transaction-list, transaction-filters, etc.)
- Server actions from Agent 1

**Rules:**
- `/add` page: simple wrapper around `transaction-form`, redirects to dashboard after save
- `/transactions` page: server component that fetches transactions with URL-based filters (searchParams)
- `/daily` page: calendar grid showing spending per day, click a day to see detail
- Calendar should color-code days by spending amount (green < ₹500, yellow < ₹1000, red > ₹1000)
- All pages must be responsive

**Important — Handling Dependencies:**
This agent will reference components from Agent 2. Since agents work in parallel, this agent should:
- Import components assuming they exist at the paths defined in Agent 2's deliverables
- If Agent 2 isn't done yet, the imports will resolve once both agents complete
- Focus on page composition logic, data fetching, and any page-specific UI

---

## Agent 5: Events + Categories + Settings + Analytics Pages

**Owns:** `src/app/events/*`, `src/app/categories/*`, `src/app/analytics/*`, `src/app/settings/*`, `src/components/events/*`, `src/components/settings/*`

**Deliverables:**
1. `src/app/events/page.tsx` — Events list
2. `src/app/events/new/page.tsx` — Create event form
3. `src/app/events/[id]/page.tsx` — Event detail with breakdown
4. `src/components/events/event-form.tsx` — Create/edit event form
5. `src/components/events/event-card.tsx` — Event summary card
6. `src/components/events/event-breakdown.tsx` — Category breakdown within event
7. `src/app/categories/page.tsx` — Category management page
8. `src/app/categories/[id]/page.tsx` — Category deep dive (subcategory breakdown + transactions)
9. `src/components/settings/category-manager.tsx` — Add/edit/delete categories UI
10. `src/components/settings/budget-mode-settings.tsx` — Toggle + daily limit config
11. `src/components/settings/general-settings.tsx` — Currency, initial balance
12. `src/app/settings/page.tsx` — Settings page
13. `src/app/analytics/page.tsx` — Trends & insights page

**References:**
- `architecture/05-UI-DESIGN.md` for wireframes
- `architecture/03-SERVER-ACTIONS-API.md` for server action signatures
- Chart components from Agent 3 (import and use for analytics page)

**Rules:**
- Event form: name, description, date range picker
- Event detail: show total, breakdown by category (bar chart), and list of all transactions
- Category management: list categories, tap to edit (name, icon, color, essential toggle), delete with confirmation
- Settings page: grouped sections (General, Budget Mode, Categories link, Data Export placeholder)
- Analytics page: monthly trend chart, top categories, unnecessary spending trend
- All pages must be responsive

---

## Integration Step (After All 5 Agents Complete)

After all agents finish, a final pass to:
1. Verify all imports resolve correctly
2. Wire up `app-shell` in `layout.tsx` to wrap all pages
3. Test that navigation works between all pages
4. Fix any type mismatches between server actions and components
5. Run `next build` to catch compile errors

---

## File Ownership Matrix (No Overlaps)

| File/Folder | Agent |
|-------------|-------|
| `supabase/migrations/*` | 1 |
| `src/actions/*` | 1 |
| `src/components/layout/*` | 2 |
| `src/components/transactions/*` | 2 |
| `src/hooks/*` | 2 |
| `src/components/dashboard/*` | 3 |
| `src/components/charts/*` | 3 |
| `src/app/page.tsx` (dashboard) | 3 |
| `src/app/monthly/*` | 3 |
| `src/app/add/*` | 4 |
| `src/app/transactions/*` | 4 |
| `src/app/daily/*` | 4 |
| `src/app/events/*` | 5 |
| `src/app/categories/*` | 5 |
| `src/app/settings/*` | 5 |
| `src/app/analytics/*` | 5 |
| `src/components/events/*` | 5 |
| `src/components/settings/*` | 5 |

**Zero overlap. Every file has exactly one owner.**
