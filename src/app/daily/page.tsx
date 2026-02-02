import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { getDailySpending } from "@/actions/dashboard";
import { getCurrentMonth } from "@/lib/utils";
import DailyPageClient from "./daily-page-client";

interface DailyPageProps {
  searchParams: Promise<{
    year?: string;
    month?: string;
  }>;
}

export default async function DailyPage({ searchParams }: DailyPageProps) {
  const params = await searchParams;
  const current = getCurrentMonth();

  const year = params.year ? parseInt(params.year, 10) : current.year;
  const month = params.month ? parseInt(params.month, 10) : current.month;

  const dailySpending = await getDailySpending({ year, month });

  return (
    <AppShell>
      <PageHeader title="Daily Log" />
      <div className="mx-auto max-w-lg">
        <DailyPageClient
          year={year}
          month={month}
          dailySpending={dailySpending}
        />
      </div>
    </AppShell>
  );
}
