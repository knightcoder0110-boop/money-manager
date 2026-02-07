"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, getCurrentUser } from "@/lib/supabase/server";
import type { Category, CategoryWithSubs, Subcategory } from "@/types";

export async function getCategories(
  options?: {
    include_subcategories?: boolean;
    type?: "expense" | "income";
  },
  userId?: string
): Promise<CategoryWithSubs[]> {
  const supabase = createServerClient();
  const uid = userId ?? (await getCurrentUser()).id;
  const includeSubs = options?.include_subcategories !== false;

  let query = supabase
    .from("categories")
    .select(includeSubs ? "*, subcategories(*)" : "*")
    .eq("user_id", uid)
    .order("sort_order", { ascending: true });

  if (options?.type === "income") {
    query = query.eq("is_income", true);
  } else if (options?.type === "expense") {
    query = query.eq("is_income", false);
  }

  const { data, error } = await query;

  if (error) {
    console.error("getCategories error:", error.message);
    return [];
  }

  if (!includeSubs) {
    return ((data as unknown as Category[]) ?? []).map((c) => ({
      ...c,
      subcategories: [],
    }));
  }

  return (data as unknown as CategoryWithSubs[]) ?? [];
}

export async function createCategory(
  input: {
    name: string;
    icon?: string;
    color?: string;
    is_essential?: boolean;
    is_income?: boolean;
  },
  userId?: string
): Promise<{ data: Category | null; error: string | null }> {
  const supabase = createServerClient();
  const uid = userId ?? (await getCurrentUser()).id;

  const { data, error } = await supabase
    .from("categories")
    .insert({
      user_id: uid,
      name: input.name,
      icon: input.icon ?? "📦",
      color: input.color ?? "#6B7280",
      is_essential: input.is_essential ?? false,
      is_income: input.is_income ?? false,
    })
    .select()
    .single();

  if (error) {
    console.error("createCategory error:", error.message);
    if (error.message.includes("duplicate") || error.message.includes("unique")) {
      return { data: null, error: "A category with this name already exists." };
    }
    return { data: null, error: "Failed to create category. Please try again." };
  }

  revalidatePath("/");
  return { data: data as Category, error: null };
}

export async function updateCategory(
  id: string,
  input: Partial<{
    name: string;
    icon: string;
    color: string;
    is_essential: boolean;
    sort_order: number;
  }>,
  userId?: string
): Promise<{ data: Category | null; error: string | null }> {
  const supabase = createServerClient();
  const uid = userId ?? (await getCurrentUser()).id;

  const { data, error } = await supabase
    .from("categories")
    .update(input)
    .eq("id", id)
    .eq("user_id", uid)
    .select()
    .single();

  if (error) {
    console.error("updateCategory error:", error.message);
    return { data: null, error: "Failed to update category. Please try again." };
  }

  revalidatePath("/");
  return { data: data as Category, error: null };
}

export async function deleteCategory(id: string, userId?: string): Promise<{ error: string | null }> {
  const supabase = createServerClient();
  const uid = userId ?? (await getCurrentUser()).id;

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .eq("user_id", uid);

  if (error) {
    console.error("deleteCategory error:", error.message);
    if (error.message.includes("foreign") || error.message.includes("referenced")) {
      return { error: "Cannot delete this category because it has transactions. Remove the transactions first." };
    }
    return { error: "Failed to delete category. Please try again." };
  }

  revalidatePath("/");
  return { error: null };
}

export async function createSubcategory(
  input: {
    category_id: string;
    name: string;
  },
  userId?: string
): Promise<{ data: Subcategory | null; error: string | null }> {
  const supabase = createServerClient();
  const uid = userId ?? (await getCurrentUser()).id;

  const { data, error } = await supabase
    .from("subcategories")
    .insert({
      user_id: uid,
      category_id: input.category_id,
      name: input.name,
    })
    .select()
    .single();

  if (error) {
    console.error("createSubcategory error:", error.message);
    if (error.message.includes("duplicate") || error.message.includes("unique")) {
      return { data: null, error: "This subcategory already exists in this category." };
    }
    return { data: null, error: "Failed to create subcategory. Please try again." };
  }

  revalidatePath("/");
  return { data: data as Subcategory, error: null };
}

export async function updateSubcategory(
  id: string,
  input: Partial<{ name: string; sort_order: number }>,
  userId?: string
): Promise<{ data: Subcategory | null; error: string | null }> {
  const supabase = createServerClient();
  const uid = userId ?? (await getCurrentUser()).id;

  const { data, error } = await supabase
    .from("subcategories")
    .update(input)
    .eq("id", id)
    .eq("user_id", uid)
    .select()
    .single();

  if (error) {
    console.error("updateSubcategory error:", error.message);
    return { data: null, error: "Failed to update subcategory. Please try again." };
  }

  revalidatePath("/");
  return { data: data as Subcategory, error: null };
}

export async function deleteSubcategory(id: string, userId?: string): Promise<{ error: string | null }> {
  const supabase = createServerClient();
  const uid = userId ?? (await getCurrentUser()).id;

  const { error } = await supabase
    .from("subcategories")
    .delete()
    .eq("id", id)
    .eq("user_id", uid);

  if (error) {
    console.error("deleteSubcategory error:", error.message);
    return { error: "Failed to delete subcategory. Please try again." };
  }

  revalidatePath("/");
  return { error: null };
}
