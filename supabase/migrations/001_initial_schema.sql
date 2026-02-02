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
