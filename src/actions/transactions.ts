"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import type { Transaction } from "@/types";

export async function getTransactions(filters?: {
  type?: "expense" | "income";
  category_id?: string;
  subcategory_id?: string;
  necessity?: "necessary" | "unnecessary" | "debatable";
  event_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{
  data: Transaction[];
  count: number;
}> {
  const supabase = createServerClient();
  const limit = filters?.limit ?? 50;
  const offset = filters?.offset ?? 0;

  let query = supabase
    .from("transactions")
    .select("*", { count: "exact" })
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters?.type) {
    query = query.eq("type", filters.type);
  }
  if (filters?.category_id) {
    query = query.eq("category_id", filters.category_id);
  }
  if (filters?.subcategory_id) {
    query = query.eq("subcategory_id", filters.subcategory_id);
  }
  if (filters?.necessity) {
    query = query.eq("necessity", filters.necessity);
  }
  if (filters?.event_id) {
    query = query.eq("event_id", filters.event_id);
  }
  if (filters?.date_from) {
    query = query.gte("transaction_date", filters.date_from);
  }
  if (filters?.date_to) {
    query = query.lte("transaction_date", filters.date_to);
  }
  if (filters?.search) {
    query = query.ilike("note", `%${filters.search}%`);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error("getTransactions error:", error.message);
    return { data: [], count: 0 };
  }

  return { data: (data as Transaction[]) ?? [], count: count ?? 0 };
}

export async function getTransaction(id: string): Promise<Transaction | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("getTransaction error:", error.message);
    return null;
  }

  return data as Transaction;
}

export async function createTransaction(input: {
  type: "expense" | "income";
  amount: number;
  category_id: string;
  subcategory_id?: string;
  necessity?: "necessary" | "unnecessary" | "debatable";
  note?: string;
  transaction_date?: string;
  event_id?: string;
}): Promise<{ data: Transaction | null; error: string | null }> {
  const supabase = createServerClient();

  // Read budget_mode setting to auto-stamp is_budget_mode
  const { data: budgetSetting } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "budget_mode")
    .single();

  const isBudgetMode = budgetSetting?.value?.active === true;

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      type: input.type,
      amount: input.amount,
      category_id: input.category_id,
      subcategory_id: input.subcategory_id ?? null,
      necessity: input.necessity ?? null,
      note: input.note ?? null,
      transaction_date: input.transaction_date ?? new Date().toISOString().split("T")[0],
      event_id: input.event_id ?? null,
      is_budget_mode: isBudgetMode,
    })
    .select()
    .single();

  if (error) {
    console.error("createTransaction error:", error.message);
    return { data: null, error: "Failed to create transaction. Please try again." };
  }

  revalidatePath("/");
  return { data: data as Transaction, error: null };
}

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
): Promise<{ data: Transaction | null; error: string | null }> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("transactions")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("updateTransaction error:", error.message);
    return { data: null, error: "Failed to update transaction. Please try again." };
  }

  revalidatePath("/");
  return { data: data as Transaction, error: null };
}

export async function deleteTransaction(id: string): Promise<{ error: string | null }> {
  const supabase = createServerClient();

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("deleteTransaction error:", error.message);
    return { error: "Failed to delete transaction. Please try again." };
  }

  revalidatePath("/");
  return { error: null };
}
