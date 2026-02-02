"use client";

import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";

interface AppShellClientProps {
  children: React.ReactNode;
  balance: number;
  budgetMode: {
    active: boolean;
    daily_limit: number;
    today_remaining: number;
  };
}

export function AppShellClient({
  children,
  balance,
  budgetMode,
}: AppShellClientProps) {
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
