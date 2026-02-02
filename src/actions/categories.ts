"use server";

import type { CategoryWithSubs, Category, Subcategory } from "@/types";

export async function getCategories(options?: {
  include_subcategories?: boolean;
  type?: "expense" | "income";
}): Promise<CategoryWithSubs[]> {
  // Stub — will be implemented by the server actions agent
  return [];
}

export async function createCategory(input: {
  name: string;
  icon?: string;
  color?: string;
  is_essential?: boolean;
  is_income?: boolean;
}): Promise<{ data: Category | null; error: string | null }> {
  return { data: null, error: "Not implemented" };
}

export async function updateCategory(
  id: string,
  input: Partial<{
    name: string;
    icon: string;
    color: string;
    is_essential: boolean;
    sort_order: number;
  }>
): Promise<{ data: Category | null; error: string | null }> {
  return { data: null, error: "Not implemented" };
}

export async function deleteCategory(id: string): Promise<{ error: string | null }> {
  return { error: "Not implemented" };
}

export async function createSubcategory(input: {
  category_id: string;
  name: string;
}): Promise<{ data: Subcategory | null; error: string | null }> {
  return { data: null, error: "Not implemented" };
}

export async function updateSubcategory(
  id: string,
  input: Partial<{ name: string; sort_order: number }>
): Promise<{ data: Subcategory | null; error: string | null }> {
  return { data: null, error: "Not implemented" };
}

export async function deleteSubcategory(id: string): Promise<{ error: string | null }> {
  return { error: "Not implemented" };
}
