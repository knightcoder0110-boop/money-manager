"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

export function QuickAddFab() {
  return (
    <Link
      href="/add"
      className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 md:bottom-8"
      aria-label="Add transaction"
    >
      <Plus className="h-7 w-7" />
    </Link>
  );
}
