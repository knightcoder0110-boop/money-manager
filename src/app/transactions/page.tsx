import AppShell from "@/components/layout/app-shell";
import PageHeader from "@/components/layout/page-header";
import TransactionFilters from "@/components/transactions/transaction-filters";
import { getTransactions } from "@/actions/transactions";
import { getCategories } from "@/actions/categories";
import { getCurrentMonth, getMonthDateRange } from "@/lib/utils";
import type { TransactionType, Necessity } from "@/types";
import TransactionsPageClient from "./transactions-page-client";

const PAGE_SIZE = 50;

interface TransactionsPageProps {
  searchParams: Promise<{
    type?: string;
    category?: string;
    necessity?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function TransactionsPage({ searchParams }: TransactionsPageProps) {
  const params = await searchParams;

  const type = (params.type === "expense" || params.type === "income")
    ? params.type as TransactionType
    : undefined;
  const necessity = (params.necessity === "necessary" || params.necessity === "unnecessary" || params.necessity === "debatable")
    ? params.necessity as Necessity
    : undefined;
  const category_id = params.category || undefined;
  const search = params.search || undefined;

  // Default date range: current month
  const { year, month } = getCurrentMonth();
  const { start, end } = getMonthDateRange(year, month);
  const date_from = params.date_from || start;
  const date_to = params.date_to || end;

  const page = Math.max(1, parseInt(params.page || "1", 10));
  const offset = (page - 1) * PAGE_SIZE;

  const [{ data: transactions, count }, categories] = await Promise.all([
    getTransactions({
      type,
      category_id,
      necessity,
      date_from,
      date_to,
      search,
      limit: PAGE_SIZE,
      offset,
    }),
    getCategories({ include_subcategories: true }),
  ]);

  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <AppShell>
      <PageHeader title="Transactions" />
      <div className="mx-auto max-w-2xl">
        <TransactionFilters
          categories={categories}
          currentType={type}
          currentCategory={category_id}
          currentNecessity={necessity}
          currentDateFrom={date_from}
          currentDateTo={date_to}
        />
        <TransactionsPageClient
          initialTransactions={transactions}
          totalCount={count}
          currentPage={page}
          totalPages={totalPages}
          pageSize={PAGE_SIZE}
          filters={{
            type,
            category_id,
            necessity,
            date_from,
            date_to,
            search,
          }}
        />
      </div>
    </AppShell>
  );
}
