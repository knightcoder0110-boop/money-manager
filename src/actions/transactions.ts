"use server";

import type { Transaction, CreateTransactionInput, UpdateTransactionInput } from "@/types";

export async function getTransactions(_filters?: {
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
  return { data: [], count: 0 };
}

export async function getTransaction(_id: string): Promise<Transaction | null> {
  return null;
}

export async function createTransaction(
  _input: CreateTransactionInput
): Promise<{ data: Transaction | null; error: string | null }> {
  return { data: null, error: null };
}

export async function updateTransaction(
  _id: string,
  _input: UpdateTransactionInput
): Promise<{ data: Transaction | null; error: string | null }> {
  return { data: null, error: null };
}

export async function deleteTransaction(
  _id: string
): Promise<{ error: string | null }> {
  return { error: null };
}
