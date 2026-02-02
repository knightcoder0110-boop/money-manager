import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import CategoryManager from "@/components/settings/category-manager";
import { getCategories } from "@/actions/categories";

export default async function CategoriesPage() {
  const categories = await getCategories({ include_subcategories: true });

  return (
    <AppShell>
      <PageHeader title="Categories" backHref="/settings" />
      <div className="p-4">
        <CategoryManager categories={categories} />
      </div>
    </AppShell>
  );
}
