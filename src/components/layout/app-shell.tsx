"use client";

import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";

interface AppShellProps {
  children: React.ReactNode;
  balance?: number;
  budgetMode?: {
    active: boolean;
    daily_limit: number;
    today_remaining: number;
  };
}

export function AppShell({
  children,
  balance = 0,
  budgetMode = { active: false, daily_limit: 0, today_remaining: 0 },
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header balance={balance} budgetMode={budgetMode} />

      {/* Main content area */}
      <main className="pb-20 md:pb-0 md:pl-60">
        <div className="mx-auto max-w-2xl">{children}</div>
      </main>

      <MobileNav balance={balance} budgetMode={budgetMode} />
    </div>
  );
}
