"use server";

import type { Event } from "@/types";

export async function getEvents(_options?: {
  limit?: number;
  offset?: number;
}): Promise<{ data: Event[]; count: number }> {
  return { data: [], count: 0 };
}
