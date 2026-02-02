"use server";

import type { CategoryWithSubs } from "@/types";

export async function getCategories(_options?: {
  include_subcategories?: boolean;
  type?: "expense" | "income";
}): Promise<CategoryWithSubs[]> {
  return [];
}
