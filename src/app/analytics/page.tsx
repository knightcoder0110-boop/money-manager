import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import AnalyticsDashboard from "./analytics-dashboard";
import { getMonthlyTrends, getTopCategories } from "@/actions/analytics";

export default async function AnalyticsPage() {
  const [trends, topCategories] = await Promise.all([
    getMonthlyTrends(12),
    getTopCategories({ limit: 10 }),
  ]);

  return (
    <AppShell>
      <PageHeader title="Analytics" />
      <AnalyticsDashboard trends={trends} topCategories={topCategories} />
    </AppShell>
  );
}
