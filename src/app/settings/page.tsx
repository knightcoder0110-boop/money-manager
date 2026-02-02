import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import GeneralSettings from "@/components/settings/general-settings";
import BudgetModeSettings from "@/components/settings/budget-mode-settings";
import AppLockSettings from "@/components/settings/app-lock-settings";
import { getAllSettings } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Grid3X3, ChevronRight } from "lucide-react";

export default async function SettingsPage() {
  const settings = await getAllSettings();

  const currency = (settings.currency as { code?: string; symbol?: string }) || {};
  const budgetMode = (settings.budget_mode as { active?: boolean; daily_limit?: number }) || {};
  const initialBalance = (settings.initial_balance as number) || 0;
  const appLock = (settings.app_lock as { enabled?: boolean; password_hash?: string }) || {};

  return (
    <AppShell>
      <PageHeader title="Settings" />
      <div className="p-4 space-y-4">
        <GeneralSettings
          currency={currency.code || "INR"}
          currencySymbol={currency.symbol || "₹"}
          initialBalance={initialBalance}
        />

        <BudgetModeSettings
          active={budgetMode.active || false}
          dailyLimit={budgetMode.daily_limit || 0}
        />

        <AppLockSettings hasPassword={!!appLock.enabled} />

        {/* Categories Link */}
        <Link href="/categories">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Grid3X3 className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base">Manage Categories</CardTitle>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Add, edit, or delete spending categories and subcategories.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </AppShell>
  );
}
