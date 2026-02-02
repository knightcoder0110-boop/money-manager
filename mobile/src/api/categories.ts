import api from './client';
import { CategoryWithSubs, CreateCategoryInput, CreateSubcategoryInput, ActionResult, Category, Subcategory } from '../types';

export async function getCategories(includeSubcategories = true): Promise<CategoryWithSubs[]> {
  const { data } = await api.get('/categories', {
    params: { include_subcategories: includeSubcategories },
  });
  return data;
}

export async function createCategory(input: CreateCategoryInput): Promise<ActionResult<Category>> {
  const { data } = await api.post('/categories', input);
  return data;
}

export async function updateCategory(id: string, input: Partial<CreateCategoryInput>): Promise<ActionResult<Category>> {
  const { data } = await api.patch(`/categories/${id}`, input);
  return data;
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const { data } = await api.delete(`/categories/${id}`);
  return data;
}

export async function createSubcategory(input: CreateSubcategoryInput): Promise<ActionResult<Subcategory>> {
  const { data } = await api.post('/categories/subcategories', input);
  return data;
}

export async function updateSubcategory(id: string, name: string): Promise<ActionResult<Subcategory>> {
  const { data } = await api.patch(`/categories/subcategories/${id}`, { name });
  return data;
}

export async function deleteSubcategory(id: string): Promise<ActionResult> {
  const { data } = await api.delete(`/categories/subcategories/${id}`);
  return data;
}
