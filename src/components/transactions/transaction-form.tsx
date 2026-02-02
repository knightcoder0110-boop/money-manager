"use client";

import type { CategoryWithSubs, Event } from "@/types";

interface TransactionFormProps {
  categories: CategoryWithSubs[];
  events: Event[];
}

export default function TransactionForm({ categories, events }: TransactionFormProps) {
  return (
    <div className="p-4 text-zinc-400">
      <p>Transaction Form (stub — {categories.length} categories, {events.length} events loaded)</p>
    </div>
  );
}
