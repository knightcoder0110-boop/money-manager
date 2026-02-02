"use server";

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
}): Promise<{ data: Transaction[]; count: number }> {
  // Stub
  return { data: [], count: 0 };
}

export async function getTransaction(id: string): Promise<Transaction | null> {
  // Stub
  return null;
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
  // Stub
  return { data: null, error: "Not implemented" };
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
  // Stub
  return { data: null, error: "Not implemented" };
}

export async function deleteTransaction(id: string): Promise<{ error: string | null }> {
  // Stub
  return { error: "Not implemented" };
}
