-- 003_multi_user.sql
-- Multi-user migration: Add user ownership to all data
--
-- PREREQUISITES:
--   1. Full database backup taken locally
--   2. Supabase Auth user created (YOUR_USER_ID known)
--   3. Email/Password provider enabled in Supabase dashboard
--
-- IMPORTANT: Replace YOUR_USER_ID with actual UUID before running
-- Run steps one at a time, verify after each step

-- ============================================================
-- STEP 1: Create profiles table
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  email text NOT NULL,
  avatar_url text,
  username text UNIQUE,
  currency_code text NOT NULL DEFAULT 'INR',
  currency_symbol text NOT NULL DEFAULT '₹',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username) WHERE username IS NOT NULL;

-- ============================================================
-- STEP 2: Add user_id columns (nullable for now)
-- ============================================================

ALTER TABLE categories ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_default boolean NOT NULL DEFAULT false;
ALTER TABLE subcategories ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================================
-- STEP 3: Backfill - Bind all data to your account
-- Replace YOUR_USER_ID below!
-- ============================================================

-- INSERT YOUR PROFILE
-- INSERT INTO profiles (id, display_name, email)
-- VALUES ('YOUR_USER_ID', 'Manish', 'your@email.com');

-- BIND ALL DATA
-- UPDATE transactions SET user_id = 'YOUR_USER_ID' WHERE user_id IS NULL;
-- UPDATE categories SET user_id = 'YOUR_USER_ID' WHERE user_id IS NULL;
-- UPDATE categories SET is_default = true WHERE user_id = 'YOUR_USER_ID';
-- UPDATE subcategories SET user_id = 'YOUR_USER_ID' WHERE user_id IS NULL;
-- UPDATE events SET user_id = 'YOUR_USER_ID' WHERE user_id IS NULL;
-- UPDATE settings SET user_id = 'YOUR_USER_ID' WHERE user_id IS NULL;

-- ============================================================
-- STEP 4: Verify (run these, all must return 0)
-- ============================================================

-- SELECT 'transactions' as tbl, COUNT(*) as orphans FROM transactions WHERE user_id IS NULL
-- UNION ALL SELECT 'categories', COUNT(*) FROM categories WHERE user_id IS NULL
-- UNION ALL SELECT 'subcategories', COUNT(*) FROM subcategories WHERE user_id IS NULL
-- UNION ALL SELECT 'events', COUNT(*) FROM events WHERE user_id IS NULL
-- UNION ALL SELECT 'settings', COUNT(*) FROM settings WHERE user_id IS NULL;

-- ============================================================
-- STEP 5: Enforce NOT NULL + update constraints
-- ============================================================

-- ALTER TABLE transactions ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE categories ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE subcategories ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE events ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE settings ALTER COLUMN user_id SET NOT NULL;

-- ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_name_key;
-- ALTER TABLE categories ADD CONSTRAINT categories_user_name_unique UNIQUE(user_id, name);

-- ALTER TABLE subcategories DROP CONSTRAINT IF EXISTS subcategories_category_id_name_key;
-- ALTER TABLE subcategories ADD CONSTRAINT subcategories_user_cat_name_unique UNIQUE(user_id, category_id, name);

-- ALTER TABLE settings DROP CONSTRAINT settings_pkey;
-- ALTER TABLE settings ADD PRIMARY KEY (user_id, key);

-- ============================================================
-- STEP 6: Create new indexes
-- ============================================================

-- DROP INDEX IF EXISTS idx_transactions_date;
-- DROP INDEX IF EXISTS idx_transactions_category;
-- DROP INDEX IF EXISTS idx_transactions_type_date;
-- DROP INDEX IF EXISTS idx_transactions_necessity;

-- CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
-- CREATE INDEX idx_transactions_user_category ON transactions(user_id, category_id);
-- CREATE INDEX idx_transactions_user_type_date ON transactions(user_id, type, transaction_date DESC);
-- CREATE INDEX idx_transactions_user_necessity ON transactions(user_id, necessity) WHERE type = 'expense';

-- CREATE INDEX idx_categories_user ON categories(user_id);
-- CREATE INDEX idx_subcategories_user ON subcategories(user_id);
-- CREATE INDEX idx_events_user ON events(user_id);

-- ============================================================
-- STEP 7: Create new tables
-- ============================================================

-- CREATE TABLE user_streaks (
--   user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
--   current_streak integer NOT NULL DEFAULT 0,
--   longest_streak integer NOT NULL DEFAULT 0,
--   last_log_date date,
--   total_transactions integer NOT NULL DEFAULT 0,
--   milestones_achieved integer[] NOT NULL DEFAULT '{}',
--   updated_at timestamptz NOT NULL DEFAULT now()
-- );

-- CREATE TABLE category_usage (
--   user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
--   category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
--   usage_count integer NOT NULL DEFAULT 0,
--   last_used_at timestamptz NOT NULL DEFAULT now(),
--   PRIMARY KEY (user_id, category_id)
-- );

-- CREATE INDEX idx_category_usage_frequent ON category_usage(user_id, usage_count DESC);

-- INSERT INTO user_streaks (user_id) VALUES ('YOUR_USER_ID');

-- ============================================================
-- STEP 8: Default categories template
-- ============================================================

-- CREATE TABLE default_categories (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   name text NOT NULL,
--   icon text NOT NULL,
--   color text NOT NULL,
--   is_essential boolean NOT NULL DEFAULT false,
--   is_income boolean NOT NULL DEFAULT false,
--   sort_order integer NOT NULL DEFAULT 0
-- );

-- CREATE TABLE default_subcategories (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   category_id uuid NOT NULL REFERENCES default_categories(id) ON DELETE CASCADE,
--   name text NOT NULL,
--   sort_order integer NOT NULL DEFAULT 0
-- );

-- INSERT INTO default_categories (name, icon, color, is_essential, is_income, sort_order)
-- SELECT name, icon, color, is_essential, is_income, sort_order
-- FROM categories WHERE user_id = 'YOUR_USER_ID';

-- INSERT INTO default_subcategories (category_id, name, sort_order)
-- SELECT dc.id, s.name, s.sort_order
-- FROM subcategories s
-- JOIN categories c ON s.category_id = c.id
-- JOIN default_categories dc ON dc.name = c.name AND dc.is_income = c.is_income
-- WHERE s.user_id = 'YOUR_USER_ID';

-- ============================================================
-- STEP 9: Seeding function + trigger
-- ============================================================

-- CREATE OR REPLACE FUNCTION seed_user_defaults(p_user_id uuid)
-- RETURNS void AS $$
-- DECLARE
--   cat_mapping jsonb := '{}';
--   new_id uuid;
--   cat_row RECORD;
--   sub_row RECORD;
-- BEGIN
--   FOR cat_row IN SELECT * FROM default_categories ORDER BY sort_order LOOP
--     new_id := gen_random_uuid();
--     INSERT INTO categories (id, user_id, name, icon, color, is_essential, is_income, sort_order, is_default)
--     VALUES (new_id, p_user_id, cat_row.name, cat_row.icon, cat_row.color,
--             cat_row.is_essential, cat_row.is_income, cat_row.sort_order, true);
--     cat_mapping := cat_mapping || jsonb_build_object(cat_row.id::text, new_id::text);
--   END LOOP;
--
--   FOR sub_row IN
--     SELECT ds.*, dc.id as dc_id
--     FROM default_subcategories ds
--     JOIN default_categories dc ON ds.category_id = dc.id
--     ORDER BY ds.sort_order
--   LOOP
--     INSERT INTO subcategories (user_id, category_id, name, sort_order)
--     VALUES (p_user_id, (cat_mapping->>sub_row.dc_id::text)::uuid, sub_row.name, sub_row.sort_order);
--   END LOOP;
--
--   INSERT INTO settings (user_id, key, value) VALUES
--     (p_user_id, 'initial_balance', '{"amount": 0}'),
--     (p_user_id, 'budget_mode', '{"active": false, "daily_limit": 500, "activated_at": null}');
--
--   INSERT INTO user_streaks (user_id) VALUES (p_user_id);
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- CREATE OR REPLACE FUNCTION handle_new_user()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   INSERT INTO public.profiles (id, display_name, email, avatar_url)
--   VALUES (
--     NEW.id,
--     COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
--     COALESCE(NEW.email, ''),
--     NEW.raw_user_meta_data->>'avatar_url'
--   );
--   PERFORM seed_user_defaults(NEW.id);
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- STEP 10: Cleanup
-- ============================================================

-- DELETE FROM settings WHERE key = 'app_lock';
-- DROP TABLE IF EXISTS monthly_summaries;

-- ============================================================
-- STEP 11: Enable RLS + policies
-- ============================================================

-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE events ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE category_usage ENABLE ROW LEVEL SECURITY;

-- Profiles
-- CREATE POLICY "Profiles are viewable by authenticated users" ON profiles FOR SELECT USING (auth.role() = 'authenticated');
-- CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Categories
-- CREATE POLICY "Users can view own categories" ON categories FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Users can insert own categories" ON categories FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users can update own categories" ON categories FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users can delete own non-default categories" ON categories FOR DELETE USING (auth.uid() = user_id AND is_default = false);

-- Subcategories
-- CREATE POLICY "Users can view own subcategories" ON subcategories FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Users can insert own subcategories" ON subcategories FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users can update own subcategories" ON subcategories FOR UPDATE USING (auth.uid() = user_id);
-- CREATE POLICY "Users can delete own subcategories" ON subcategories FOR DELETE USING (auth.uid() = user_id);

-- Transactions
-- CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Users can insert own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users can update own transactions" ON transactions FOR UPDATE USING (auth.uid() = user_id);
-- CREATE POLICY "Users can delete own transactions" ON transactions FOR DELETE USING (auth.uid() = user_id);

-- Events
-- CREATE POLICY "Users can view own events" ON events FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Users can insert own events" ON events FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users can update own events" ON events FOR UPDATE USING (auth.uid() = user_id);
-- CREATE POLICY "Users can delete own events" ON events FOR DELETE USING (auth.uid() = user_id);

-- Settings
-- CREATE POLICY "Users can view own settings" ON settings FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Users can upsert own settings" ON settings FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users can update own settings" ON settings FOR UPDATE USING (auth.uid() = user_id);

-- User Streaks
-- CREATE POLICY "Users can view own streak" ON user_streaks FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Users can upsert own streak" ON user_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users can update own streak" ON user_streaks FOR UPDATE USING (auth.uid() = user_id);

-- Category Usage
-- CREATE POLICY "Users can view own usage" ON category_usage FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Users can upsert own usage" ON category_usage FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users can update own usage" ON category_usage FOR UPDATE USING (auth.uid() = user_id);
