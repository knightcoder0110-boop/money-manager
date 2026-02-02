"use server";

import type { Event, Transaction } from "@/types";

export async function getEvents(options?: {
  limit?: number;
  offset?: number;
}): Promise<{ data: Event[]; count: number }> {
  return { data: [], count: 0 };
}

export async function getEventWithTransactions(id: string): Promise<{
  event: Event | null;
  transactions: Transaction[];
  total: number;
  breakdown: { category_name: string; amount: number }[];
} | null> {
  return null;
}

export async function createEvent(input: {
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
}): Promise<{ data: Event | null; error: string | null }> {
  return { data: null, error: "Not implemented" };
}

export async function updateEvent(
  id: string,
  input: Partial<{
    name: string;
    description: string;
    start_date: string;
    end_date: string;
  }>
): Promise<{ data: Event | null; error: string | null }> {
  return { data: null, error: "Not implemented" };
}

export async function deleteEvent(id: string): Promise<{ error: string | null }> {
  return { error: "Not implemented" };
}
