"use server";

import { createServerClient } from "@/lib/supabase/server";
import type { MonthlyTrend, CategoryAnalytics, TopCategory } from "@/types";

export async function getMonthlyTrends(months?: number): Promise<MonthlyTrend[]> {
  const supabase = createServerClient();
  const numMonths = months ?? 6;

  // Calculate start date: N months ago, first day of that month
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - numMonths + 1, 1);
  const startStr = startDate.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("transactions")
    .select("type, amount, necessity, transaction_date")
    .gte("transaction_date", startStr)
    .order("transaction_date", { ascending: true });

  if (error) {
    console.error("getMonthlyTrends error:", error.message);
    return [];
  }

  // Aggregate by month
  const monthlyMap = new Map<string, MonthlyTrend>();

  // Initialize all months
  for (let i = 0; i < numMonths; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - numMonths + 1 + i, 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap.set(monthKey, {
      month: monthKey,
      income: 0,
      expense: 0,
      necessary: 0,
      unnecessary: 0,
      savings: 0,
    });
  }

  for (const tx of data ?? []) {
    const monthKey = tx.transaction_date.substring(0, 7); // "YYYY-MM"
    const entry = monthlyMap.get(monthKey);
    if (!entry) continue;
    const amt = Number(tx.amount);

    if (tx.type === "income") {
      entry.income += amt;
    } else {
      entry.expense += amt;
      if (tx.necessity === "necessary") entry.necessary += amt;
      else if (tx.necessity === "unnecessary") entry.unnecessary += amt;
    }
  }

  // Calculate savings
  for (const entry of monthlyMap.values()) {
    entry.savings = entry.income - entry.expense;
  }

  return Array.from(monthlyMap.values());
}

export async function getCategoryBreakdown(params: {
  year: number;
  month: number;
  category_id?: string;
}): Promise<CategoryAnalytics[]> {
  const supabase = createServerClient();

  const monthStr = String(params.month).padStart(2, "0");
  const startDate = `${params.year}-${monthStr}-01`;
  const lastDay = new Date(params.year, params.month, 0).getDate();
  const endDate = `${params.year}-${monthStr}-${String(lastDay).padStart(2, "0")}`;

  if (params.category_id) {
    // Subcategory breakdown for a specific category
    const { data, error } = await supabase
      .from("transactions")
      .select("amount, necessity, subcategory_id, subcategories(id, name)")
      .eq("type", "expense")
      .eq("category_id", params.category_id)
      .gte("transaction_date", startDate)
      .lte("transaction_date", endDate);

    if (error) {
      console.error("getCategoryBreakdown (subcategory) error:", error.message);
      return [];
    }

    // Get the parent category info
    const { data: catData } = await supabase
      .from("categories")
      .select("icon, color")
      .eq("id", params.category_id)
      .single();

    const subMap = new Map<string, CategoryAnalytics>();

    for (const tx of data ?? []) {
      const sub = tx.subcategories as unknown as { id: string; name: string } | null;
      const subId = sub?.id ?? "uncategorized";
      const subName = sub?.name ?? "Uncategorized";
      const amt = Number(tx.amount);

      const existing = subMap.get(subId);
      if (existing) {
        existing.total += amt;
        existing.transaction_count += 1;
        if (tx.necessity === "necessary") existing.necessary += amt;
        else if (tx.necessity === "unnecessary") existing.unnecessary += amt;
        else if (tx.necessity === "debatable") existing.debatable += amt;
      } else {
        subMap.set(subId, {
          id: subId,
          name: subName,
          icon: catData?.icon ?? "📦",
          color: catData?.color ?? "#6B7280",
          total: amt,
          necessary: tx.necessity === "necessary" ? amt : 0,
          unnecessary: tx.necessity === "unnecessary" ? amt : 0,
          debatable: tx.necessity === "debatable" ? amt : 0,
          transaction_count: 1,
        });
      }
    }

    return Array.from(subMap.values()).sort((a, b) => b.total - a.total);
  }

  // Category-level breakdown
  const { data, error } = await supabase
    .from("transactions")
    .select("amount, necessity, category_id, categories(id, name, icon, color)")
    .eq("type", "expense")
    .gte("transaction_date", startDate)
    .lte("transaction_date", endDate);

  if (error) {
    console.error("getCategoryBreakdown error:", error.message);
    return [];
  }

  const catMap = new Map<string, CategoryAnalytics>();

  for (const tx of data ?? []) {
    const cat = tx.categories as unknown as { id: string; name: string; icon: string; color: string } | null;
    if (!cat) continue;
    const amt = Number(tx.amount);

    const existing = catMap.get(cat.id);
    if (existing) {
      existing.total += amt;
      existing.transaction_count += 1;
      if (tx.necessity === "necessary") existing.necessary += amt;
      else if (tx.necessity === "unnecessary") existing.unnecessary += amt;
      else if (tx.necessity === "debatable") existing.debatable += amt;
    } else {
      catMap.set(cat.id, {
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        total: amt,
        necessary: tx.necessity === "necessary" ? amt : 0,
        unnecessary: tx.necessity === "unnecessary" ? amt : 0,
        debatable: tx.necessity === "debatable" ? amt : 0,
        transaction_count: 1,
      });
    }
  }

  return Array.from(catMap.values()).sort((a, b) => b.total - a.total);
}

export async function getTopCategories(params?: {
  date_from?: string;
  date_to?: string;
  limit?: number;
}): Promise<TopCategory[]> {
  const supabase = createServerClient();
  const resultLimit = params?.limit ?? 5;

  let query = supabase
    .from("transactions")
    .select("amount, category_id, categories(name, icon)")
    .eq("type", "expense");

  if (params?.date_from) {
    query = query.gte("transaction_date", params.date_from);
  }
  if (params?.date_to) {
    query = query.lte("transaction_date", params.date_to);
  }

  const { data, error } = await query;

  if (error) {
    console.error("getTopCategories error:", error.message);
    return [];
  }

  const catTotals = new Map<string, { name: string; icon: string; total: number }>();
  let grandTotal = 0;

  for (const tx of data ?? []) {
    const cat = tx.categories as unknown as { name: string; icon: string } | null;
    if (!cat) continue;
    const amt = Number(tx.amount);
    grandTotal += amt;

    const existing = catTotals.get(tx.category_id);
    if (existing) {
      existing.total += amt;
    } else {
      catTotals.set(tx.category_id, { name: cat.name, icon: cat.icon, total: amt });
    }
  }

  const sorted = Array.from(catTotals.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, resultLimit);

  return sorted.map((c) => ({
    category_name: c.name,
    category_icon: c.icon,
    total: c.total,
    percentage: grandTotal > 0 ? Math.round((c.total / grandTotal) * 10000) / 100 : 0,
  }));
}
