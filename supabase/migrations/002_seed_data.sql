-- 002_seed_data.sql

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
