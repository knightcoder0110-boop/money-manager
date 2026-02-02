import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import CategoryDeepDive from "./category-deep-dive";
import { getCategoryBreakdown } from "@/actions/analytics";
import { getTransactions } from "@/actions/transactions";
import { getCategories } from "@/actions/categories";
import { getCurrentMonth } from "@/lib/utils";

interface CategoryDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  const { id } = await params;
  const { year, month } = getCurrentMonth();

  const categories = await getCategories();
  const category = categories.find((c) => c.id === id);

  if (!category) {
    notFound();
  }

  const [subcategoryBreakdown, transactionsResult] = await Promise.all([
    getCategoryBreakdown({ year, month, category_id: id }),
    getTransactions({ category_id: id, limit: 50 }),
  ]);

  return (
    <AppShell>
      <PageHeader
        title={`${category.icon} ${category.name}`}
        backHref="/categories"
      />
      <CategoryDeepDive
        category={category}
        subcategoryBreakdown={subcategoryBreakdown}
        transactions={transactionsResult.data}
        initialYear={year}
        initialMonth={month}
      />
    </AppShell>
  );
}
