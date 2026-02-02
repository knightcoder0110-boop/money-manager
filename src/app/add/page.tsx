import AppShell from "@/components/layout/app-shell";
import PageHeader from "@/components/layout/page-header";
import TransactionForm from "@/components/transactions/transaction-form";
import { getCategories } from "@/actions/categories";
import { getEvents } from "@/actions/events";

export default async function AddPage() {
  const [categories, eventsResult] = await Promise.all([
    getCategories({ include_subcategories: true }),
    getEvents(),
  ]);

  return (
    <AppShell>
      <PageHeader title="Add Transaction" />
      <div className="mx-auto max-w-lg">
        <TransactionForm
          categories={categories}
          events={eventsResult.data}
        />
      </div>
    </AppShell>
  );
}
