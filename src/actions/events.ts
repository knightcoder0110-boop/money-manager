"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, getCurrentUser } from "@/lib/supabase/server";
import type { Event, Transaction } from "@/types";

export async function getEvents(
  options?: { limit?: number; offset?: number },
  userId?: string
): Promise<{ data: Event[]; count: number }> {
  const supabase = createServerClient();
  const uid = userId ?? (await getCurrentUser()).id;
  const limit = options?.limit ?? 50;
  const offset = options?.offset ?? 0;

  const { data, count, error } = await supabase
    .from("events")
    .select("*", { count: "exact" })
    .eq("user_id", uid)
    .order("start_date", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("getEvents error:", error.message);
    return { data: [], count: 0 };
  }

  return { data: (data as Event[]) ?? [], count: count ?? 0 };
}

export async function getEventsWithTotals(
  options?: { limit?: number; offset?: number },
  userId?: string
): Promise<{ data: (Event & { total_cost: number })[]; count: number }> {
  const supabase = createServerClient();
  const uid = userId ?? (await getCurrentUser()).id;
  const limit = options?.limit ?? 50;
  const offset = options?.offset ?? 0;

  const { data: events, count, error } = await supabase
    .from("events")
    .select("*", { count: "exact" })
    .eq("user_id", uid)
    .order("start_date", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !events) {
    console.error("getEventsWithTotals error:", error?.message);
    return { data: [], count: 0 };
  }

  const eventIds = events.map((e) => e.id);

  if (eventIds.length === 0) {
    return { data: [], count: count ?? 0 };
  }

  const { data: transactions } = await supabase
    .from("transactions")
    .select("event_id, amount, type")
    .eq("user_id", uid)
    .in("event_id", eventIds)
    .eq("type", "expense");

  const totalsMap = new Map<string, number>();
  for (const tx of transactions ?? []) {
    const prev = totalsMap.get(tx.event_id!) ?? 0;
    totalsMap.set(tx.event_id!, prev + Number(tx.amount));
  }

  const result = (events as Event[]).map((event) => ({
    ...event,
    total_cost: totalsMap.get(event.id) ?? 0,
  }));

  return { data: result, count: count ?? 0 };
}

export async function getEventWithTransactions(
  id: string,
  userId?: string
): Promise<{
  event: Event | null;
  transactions: Transaction[];
  total: number;
  breakdown: { category_name: string; amount: number }[];
} | null> {
  const supabase = createServerClient();
  const uid = userId ?? (await getCurrentUser()).id;

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .eq("user_id", uid)
    .single();

  if (eventError || !event) {
    console.error("getEventWithTransactions event error:", eventError?.message);
    return null;
  }

  const { data: transactions, error: txError } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", uid)
    .eq("event_id", id)
    .order("transaction_date", { ascending: false });

  if (txError) {
    console.error("getEventWithTransactions transactions error:", txError.message);
    return null;
  }

  const txList = (transactions as Transaction[]) ?? [];

  const total = txList
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const categoryMap = new Map<string, { category_name: string; amount: number }>();

  const categoryIds = [...new Set(txList.filter((t) => t.type === "expense").map((t) => t.category_id))];

  if (categoryIds.length > 0) {
    const { data: categories } = await supabase
      .from("categories")
      .select("id, name")
      .eq("user_id", uid)
      .in("id", categoryIds);

    const catNameMap = new Map<string, string>();
    for (const cat of categories ?? []) {
      catNameMap.set(cat.id, cat.name);
    }

    for (const tx of txList) {
      if (tx.type !== "expense") continue;
      const catName = catNameMap.get(tx.category_id) ?? "Unknown";
      const existing = categoryMap.get(tx.category_id);
      if (existing) {
        existing.amount += Number(tx.amount);
      } else {
        categoryMap.set(tx.category_id, { category_name: catName, amount: Number(tx.amount) });
      }
    }
  }

  const breakdown = Array.from(categoryMap.values()).sort((a, b) => b.amount - a.amount);

  return {
    event: event as Event,
    transactions: txList,
    total,
    breakdown,
  };
}

export async function createEvent(
  input: {
    name: string;
    description?: string;
    start_date: string;
    end_date: string;
  },
  userId?: string
): Promise<{ data: Event | null; error: string | null }> {
  const supabase = createServerClient();
  const uid = userId ?? (await getCurrentUser()).id;

  const { data, error } = await supabase
    .from("events")
    .insert({
      user_id: uid,
      name: input.name,
      description: input.description ?? null,
      start_date: input.start_date,
      end_date: input.end_date,
    })
    .select()
    .single();

  if (error) {
    console.error("createEvent error:", error.message);
    return { data: null, error: "Failed to create event. Please try again." };
  }

  revalidatePath("/");
  return { data: data as Event, error: null };
}

export async function updateEvent(
  id: string,
  input: Partial<{
    name: string;
    description: string;
    start_date: string;
    end_date: string;
  }>,
  userId?: string
): Promise<{ data: Event | null; error: string | null }> {
  const supabase = createServerClient();
  const uid = userId ?? (await getCurrentUser()).id;

  const { data, error } = await supabase
    .from("events")
    .update(input)
    .eq("id", id)
    .eq("user_id", uid)
    .select()
    .single();

  if (error) {
    console.error("updateEvent error:", error.message);
    return { data: null, error: "Failed to update event. Please try again." };
  }

  revalidatePath("/");
  return { data: data as Event, error: null };
}

export async function deleteEvent(id: string, userId?: string): Promise<{ error: string | null }> {
  const supabase = createServerClient();
  const uid = userId ?? (await getCurrentUser()).id;

  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", id)
    .eq("user_id", uid);

  if (error) {
    console.error("deleteEvent error:", error.message);
    return { error: "Failed to delete event. Please try again." };
  }

  revalidatePath("/");
  return { error: null };
}
