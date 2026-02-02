# Database Architecture (Supabase / PostgreSQL)

## Why Supabase
- Managed PostgreSQL - data persists, no file-based DB headaches
- Free tier is generous (500MB DB, 50K monthly active users)
- Built-in Row Level Security (we'll use a simple PIN approach)
- Real-time subscriptions if we ever want live updates
- Easy backups and data export

## Connection
- Use `@supabase/supabase-js` client
- Server-side: use service role key (in server actions / API routes)
- Client-side: use anon key with RLS policies
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

---

## Schema

### Table: `categories`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | |
| name | text | NOT NULL, UNIQUE | e.g., "Food", "Transport" |
| icon | text | NOT NULL, default '📦' | Emoji or icon identifier |
| color | text | NOT NULL, default '#6B7280' | Hex color for charts |
| is_essential | boolean | NOT NULL, default false | Used by budget mode |
| is_income | boolean | NOT NULL, default false | true = income category |
| sort_order | integer | NOT NULL, default 0 | Display ordering |
| created_at | timestamptz | NOT NULL, default now() | |

### Table: `subcategories`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | |
| category_id | uuid | FK -> categories(id) ON DELETE CASCADE | Parent category |
| name | text | NOT NULL | e.g., "Groceries", "Eating Out" |
| sort_order | integer | NOT NULL, default 0 | |
| created_at | timestamptz | NOT NULL, default now() | |

UNIQUE constraint on (category_id, name).

### Table: `transactions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | |
| type | text | NOT NULL, CHECK (type IN ('expense', 'income')) | |
| amount | numeric(12,2) | NOT NULL, CHECK (amount > 0) | Always positive, type determines sign |
| category_id | uuid | FK -> categories(id) | |
| subcategory_id | uuid | FK -> subcategories(id), NULLABLE | Optional |
| necessity | text | CHECK (necessity IN ('necessary', 'unnecessary', 'debatable')), NULLABLE | NULL for income |
| note | text | NULLABLE | Short description |
| transaction_date | date | NOT NULL, default CURRENT_DATE | When it happened |
| event_id | uuid | FK -> events(id) ON DELETE SET NULL, NULLABLE | If part of an event |
| is_budget_mode | boolean | NOT NULL, default false | Was budget mode on when this was logged? |
| created_at | timestamptz | NOT NULL, default now() | |
| updated_at | timestamptz | NOT NULL, default now() | |

Indexes:
- `idx_transactions_date` on (transaction_date DESC)
- `idx_transactions_category` on (category_id)
- `idx_transactions_event` on (event_id) WHERE event_id IS NOT NULL
- `idx_transactions_type_date` on (type, transaction_date DESC)
- `idx_transactions_necessity` on (necessity) WHERE type = 'expense'

### Table: `events`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | |
| name | text | NOT NULL | e.g., "Goa Trip with GF" |
| description | text | NULLABLE | Optional details |
| start_date | date | NOT NULL | |
| end_date | date | NOT NULL | |
| created_at | timestamptz | NOT NULL, default now() | |

CHECK constraint: end_date >= start_date.

### Table: `settings`

Key-value store for app settings. Single row approach won't scale well, so use KV.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| key | text | PK | Setting name |
| value | jsonb | NOT NULL | Setting value |
| updated_at | timestamptz | NOT NULL, default now() | |

Known keys:
- `initial_balance` → `{ "amount": 5000.00 }`
- `monthly_income_expectation` → `{ "amount": 50000.00 }`
- `budget_mode` → `{ "active": false, "daily_limit": 500.00, "activated_at": null }`
- `pin` → `{ "hash": "..." }` (for future PIN protection)
- `currency` → `{ "code": "INR", "symbol": "₹" }`

### Table: `monthly_summaries` (Materialized / Cache Table)

Pre-computed monthly aggregates for fast dashboard loading. Updated via DB trigger or app logic.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | |
| month | date | NOT NULL, UNIQUE | First day of month (2025-01-01) |
| total_income | numeric(12,2) | NOT NULL, default 0 | |
| total_expense | numeric(12,2) | NOT NULL, default 0 | |
| necessary_expense | numeric(12,2) | NOT NULL, default 0 | |
| unnecessary_expense | numeric(12,2) | NOT NULL, default 0 | |
| debatable_expense | numeric(12,2) | NOT NULL, default 0 | |
| updated_at | timestamptz | NOT NULL, default now() | |

---

## SQL Migration

```sql
-- 001_initial_schema.sql

-- Categories
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  icon text NOT NULL DEFAULT '📦',
  color text NOT NULL DEFAULT '#6B7280',
  is_essential boolean NOT NULL DEFAULT false,
  is_income boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Subcategories
CREATE TABLE subcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(category_id, name)
);

-- Events
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_date >= start_date)
);

-- Transactions
CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('expense', 'income')),
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  category_id uuid NOT NULL REFERENCES categories(id),
  subcategory_id uuid REFERENCES subcategories(id),
  necessity text CHECK (necessity IN ('necessary', 'unnecessary', 'debatable')),
  note text,
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  is_budget_mode boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_event ON transactions(event_id) WHERE event_id IS NOT NULL;
CREATE INDEX idx_transactions_type_date ON transactions(type, transaction_date DESC);
CREATE INDEX idx_transactions_necessity ON transactions(necessity) WHERE type = 'expense';

-- Settings
CREATE TABLE settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Monthly Summaries (cache)
CREATE TABLE monthly_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month date NOT NULL UNIQUE,
  total_income numeric(12,2) NOT NULL DEFAULT 0,
  total_expense numeric(12,2) NOT NULL DEFAULT 0,
  necessary_expense numeric(12,2) NOT NULL DEFAULT 0,
  unnecessary_expense numeric(12,2) NOT NULL DEFAULT 0,
  debatable_expense numeric(12,2) NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## Seed Data

```sql
-- 002_seed_categories.sql

-- Expense Categories
INSERT INTO categories (name, icon, color, is_essential, is_income, sort_order) VALUES
  ('Rent',          '🏠', '#EF4444', true,  false, 1),
  ('Food',          '🍔', '#F59E0B', true,  false, 2),
  ('Transport',     '🚗', '#3B82F6', true,  false, 3),
  ('Shopping',      '🛍️', '#EC4899', false, false, 4),
  ('Bills',         '📱', '#8B5CF6', true,  false, 5),
  ('Entertainment', '🎬', '#F97316', false, false, 6),
  ('Subscriptions', '💳', '#06B6D4', false, false, 7),
  ('Professional',  '💻', '#10B981', true,  false, 8),
  ('Savings',       '🏦', '#14B8A6', true,  false, 9),
  ('Investments',   '📈', '#6366F1', true,  false, 10),
  ('Girlfriend',    '❤️', '#E11D48', false, false, 11),
  ('Family',        '👨‍👩‍👦', '#7C3AED', true,  false, 12),
  ('Friends',       '🤝', '#2563EB', false, false, 13),
  ('Health',        '💊', '#059669', true,  false, 14),
  ('Daily Small',   '☕', '#D97706', false, false, 15);

-- Income Categories
INSERT INTO categories (name, icon, color, is_essential, is_income, sort_order) VALUES
  ('Salary',        '💰', '#22C55E', false, true, 1),
  ('Freelance',     '🔧', '#84CC16', false, true, 2),
  ('Refund',        '↩️', '#A3E635', false, true, 3),
  ('Gift Received', '🎁', '#4ADE80', false, true, 4),
  ('Returns',       '📊', '#34D399', false, true, 5),
  ('Other Income',  '💵', '#6EE7B7', false, true, 6);

-- Subcategories
INSERT INTO subcategories (category_id, name, sort_order)
SELECT c.id, s.name, s.sort_order
FROM categories c
CROSS JOIN LATERAL (VALUES
  -- Rent
  ('Rent', 'Monthly Rent', 1),
  ('Rent', 'Maintenance', 2),
  ('Rent', 'Society Charges', 3),
  -- Food
  ('Food', 'Groceries', 1),
  ('Food', 'Eating Out', 2),
  ('Food', 'Ordering In', 3),
  ('Food', 'Tea/Coffee', 4),
  ('Food', 'Snacks', 5),
  ('Food', 'Water', 6),
  -- Transport
  ('Transport', 'Auto/Cab', 1),
  ('Transport', 'Fuel', 2),
  ('Transport', 'Metro', 3),
  ('Transport', 'Bus', 4),
  ('Transport', 'Parking', 5),
  -- Shopping
  ('Shopping', 'Clothes', 1),
  ('Shopping', 'Electronics', 2),
  ('Shopping', 'Household', 3),
  ('Shopping', 'Personal Care', 4),
  -- Bills
  ('Bills', 'Electricity', 1),
  ('Bills', 'WiFi', 2),
  ('Bills', 'Phone Recharge', 3),
  ('Bills', 'Gas', 4),
  -- Entertainment
  ('Entertainment', 'Movies', 1),
  ('Entertainment', 'Outings', 2),
  ('Entertainment', 'Games', 3),
  ('Entertainment', 'Events', 4),
  -- Subscriptions
  ('Subscriptions', 'Claude', 1),
  ('Subscriptions', 'Gemini', 2),
  ('Subscriptions', 'Netflix', 3),
  ('Subscriptions', 'Spotify', 4),
  ('Subscriptions', 'Other Tools', 5),
  -- Professional
  ('Professional', 'Hosting', 1),
  ('Professional', 'Domains', 2),
  ('Professional', 'Courses', 3),
  ('Professional', 'Software', 4),
  -- Savings
  ('Savings', 'Fixed Deposit', 1),
  ('Savings', 'Emergency Fund', 2),
  ('Savings', 'General', 3),
  -- Investments
  ('Investments', 'Stocks', 1),
  ('Investments', 'Mutual Funds', 2),
  ('Investments', 'Crypto', 3),
  -- Girlfriend
  ('Girlfriend', 'Food', 1),
  ('Girlfriend', 'Gifts', 2),
  ('Girlfriend', 'Travel', 3),
  ('Girlfriend', 'Activities', 4),
  -- Family
  ('Family', 'Money Sent', 1),
  ('Family', 'Gifts', 2),
  ('Family', 'Travel', 3),
  -- Friends
  ('Friends', 'Lending', 1),
  ('Friends', 'Outings', 2),
  ('Friends', 'Gifts', 3),
  -- Health
  ('Health', 'Medicines', 1),
  ('Health', 'Doctor', 2),
  ('Health', 'Gym', 3),
  ('Health', 'Supplements', 4),
  -- Daily Small
  ('Daily Small', 'Chai', 1),
  ('Daily Small', 'Cigarettes', 2),
  ('Daily Small', 'Random Snack', 3),
  ('Daily Small', 'Misc Small', 4)
) AS s(cat_name, name, sort_order)
WHERE c.name = s.cat_name;

-- Default Settings
INSERT INTO settings (key, value) VALUES
  ('initial_balance', '{"amount": 0}'),
  ('monthly_income_expectation', '{"amount": 0}'),
  ('budget_mode', '{"active": false, "daily_limit": 500, "activated_at": null}'),
  ('currency', '{"code": "INR", "symbol": "₹"}');
```

---

## Supabase RLS (Row Level Security)

Since this is a single-user app, we keep RLS simple. Two approaches:

**Option A (Recommended for now): Disable RLS, use service role key only from server.**
All DB calls happen in Next.js Server Actions / Route Handlers. The anon key is never exposed to do DB operations directly. This is simplest.

**Option B (If we add PIN auth later): Enable RLS with a simple policy.**
```sql
-- Allow all operations (single user app)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON transactions FOR ALL USING (true);
-- Repeat for other tables
```

**We go with Option A for Phase 1.**
