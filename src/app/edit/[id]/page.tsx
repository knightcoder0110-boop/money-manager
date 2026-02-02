import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { getTransaction } from "@/actions/transactions";
import { getCategories } from "@/actions/categories";
import { getDashboardData } from "@/actions/dashboard";

export default async function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [transaction, categories, dashboard] = await Promise.all([
    getTransaction(id),
    getCategories({ include_subcategories: false }),
    getDashboardData(),
  ]);

  if (!transaction) {
    notFound();
  }

  // Find the category for this transaction
  const category = categories.find((c) => c.id === transaction.category_id) ?? null;

  const editTransaction = {
    ...transaction,
    category: category
      ? {
          id: category.id,
          name: category.name,
          icon: category.icon,
          is_essential: category.is_essential,
          is_income: category.is_income,
        }
      : null,
  };

  return (
    <AppShell
      balance={dashboard.balance}
      budgetMode={dashboard.budget_mode}
    >
      <div className="px-4 pt-4">
        <PageHeader title="Edit Transaction" backHref="/transactions" />
        <div className="mt-4">
          <TransactionForm editTransaction={editTransaction} />
        </div>
      </div>
    </AppShell>
  );
}
