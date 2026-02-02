// ============================================
// Database row types (match Supabase schema)
// ============================================

export type TransactionType = "expense" | "income";
export type Necessity = "necessary" | "unnecessary" | "debatable";

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  is_essential: boolean;
  is_income: boolean;
  sort_order: number;
  created_at: string;
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category_id: string;
  subcategory_id: string | null;
  necessity: Necessity | null;
  note: string | null;
  transaction_date: string;
  event_id: string | null;
  is_budget_mode: boolean;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  created_at: string;
}

export interface Setting {
  key: string;
  value: unknown;
  updated_at: string;
}

export interface MonthlySummary {
  id: string;
  month: string;
  total_income: number;
  total_expense: number;
  necessary_expense: number;
  unnecessary_expense: number;
  debatable_expense: number;
  updated_at: string;
}

// ============================================
// Joined / enriched types
// ============================================

export interface CategoryWithSubs extends Category {
  subcategories: Subcategory[];
}

export interface TransactionWithDetails extends Transaction {
  category: Category;
  subcategory: Subcategory | null;
  event: Event | null;
}

// ============================================
// Form input types
// ============================================

export interface CreateTransactionInput {
  type: TransactionType;
  amount: number;
  category_id: string;
  subcategory_id?: string;
  necessity?: Necessity;
  note?: string;
  transaction_date?: string;
  event_id?: string;
}

export interface UpdateTransactionInput {
  amount?: number;
  category_id?: string;
  subcategory_id?: string;
  necessity?: Necessity;
  note?: string;
  transaction_date?: string;
  event_id?: string | null;
}

export interface CreateCategoryInput {
  name: string;
  icon?: string;
  color?: string;
  is_essential?: boolean;
  is_income?: boolean;
}

export interface CreateSubcategoryInput {
  category_id: string;
  name: string;
}

export interface CreateEventInput {
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
}

// ============================================
// Dashboard / Analytics types
// ============================================

export interface DashboardData {
  balance: number;
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
    today_remaining: number;
  };
  recent_transactions: TransactionWithDetails[];
  category_breakdown: CategoryBreakdownItem[];
}

export interface CategoryBreakdownItem {
  category_id: string;
  category_name: string;
  category_icon: string;
  category_color: string;
  total: number;
}

export interface DailySpending {
  date: string;
  total: number;
  necessary: number;
  unnecessary: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
  necessary: number;
  unnecessary: number;
  savings: number;
}

export interface CategoryAnalytics {
  id: string;
  name: string;
  icon: string;
  color: string;
  total: number;
  necessary: number;
  unnecessary: number;
  debatable: number;
  transaction_count: number;
}

export interface TopCategory {
  category_name: string;
  category_icon: string;
  total: number;
  percentage: number;
}

// ============================================
// Settings types
// ============================================

export interface BudgetModeSettings {
  active: boolean;
  daily_limit: number;
  activated_at: string | null;
}

export interface CurrencySettings {
  code: string;
  symbol: string;
}

// ============================================
// API types
// ============================================

export interface ActionResult<T = unknown> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
}

export interface EventWithDetails extends Event {
  transaction_count: number;
  total_spent: number;
}

export interface EventDetail {
  event: Event;
  transactions: TransactionWithDetails[];
  total: number;
  category_breakdown: CategoryBreakdownItem[];
}
