import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { TransactionForm } from "@/components/transactions/transaction-form";

export default async function AddPage() {
  return (
    <AppShell>
      <PageHeader title="Add Transaction" />
      <div className="mx-auto max-w-lg">
        <TransactionForm />
      </div>
    </AppShell>
  );
}
