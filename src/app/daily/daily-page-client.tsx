"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getTransactions } from "@/actions/transactions";
import { formatCurrency } from "@/lib/utils";
import { TRANSACTION_TYPE_COLORS } from "@/lib/constants";
import type { DailySpending, TransactionWithDetails } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

interface DailyPageClientProps {
  year: number;
  month: number;
  dailySpending: DailySpending[];
}

function getDayColor(total: number): string {
  if (total === 0) return "bg-zinc-800 text-zinc-500";
  if (total < 500) return "bg-green-500/20 text-green-400 ring-1 ring-green-500/30";
  if (total < 1000) return "bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/30";
  return "bg-red-500/20 text-red-400 ring-1 ring-red-500/30";
}

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1);
  // getDay() returns 0 for Sunday; adjust to make Monday = 0
  let startWeekday = firstDay.getDay() - 1;
  if (startWeekday < 0) startWeekday = 6;

  const daysInMonth = new Date(year, month, 0).getDate();

  const days: (number | null)[] = [];
  // Pad leading empty days
  for (let i = 0; i < startWeekday; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }
  return days;
}

export default function DailyPageClient({
  year,
  month,
  dailySpending,
}: DailyPageClientProps) {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [dayTransactions, setDayTransactions] = useState<TransactionWithDetails[]>([]);
  const [isLoadingDay, startDayTransition] = useTransition();

  // Build a map of date string -> spending data
  const spendingMap = new Map<string, DailySpending>();
  for (const ds of dailySpending) {
    spendingMap.set(ds.date, ds);
  }

  const calendarDays = getCalendarDays(year, month);

  function navigateMonth(direction: -1 | 1) {
    let newMonth = month + direction;
    let newYear = year;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    } else if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    setSelectedDay(null);
    setDayTransactions([]);
    router.push(`/daily?year=${newYear}&month=${newMonth}`);
  }

  function handleDayClick(day: number) {
    setSelectedDay(day);
    startDayTransition(async () => {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const result = await getTransactions({
        date_from: dateStr,
        date_to: dateStr,
        limit: 100,
      });
      setDayTransactions(result.data);
    });
  }

  const selectedDateStr = selectedDay
    ? `${year}-${String(month).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`
    : null;
  const selectedSpending = selectedDateStr ? spendingMap.get(selectedDateStr) : null;

  return (
    <div className="pb-24">
      {/* Month navigation */}
      <div className="flex items-center justify-between px-4 py-4">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-200"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold text-zinc-100">
          {MONTH_NAMES[month - 1]} {year}
        </h2>
        <button
          onClick={() => navigateMonth(1)}
          className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-200"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="px-4">
        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAY_LABELS.map((label) => (
            <div
              key={label}
              className="text-center text-xs font-medium text-zinc-500 py-1"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="aspect-square" />;
            }

            const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const spending = spendingMap.get(dateStr);
            const total = spending?.total ?? 0;
            const colorClass = getDayColor(total);
            const isSelected = selectedDay === day;

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm font-medium transition-all ${colorClass} ${
                  isSelected
                    ? "ring-2 ring-blue-500 ring-offset-1 ring-offset-zinc-950"
                    : ""
                }`}
              >
                <span>{day}</span>
                {total > 0 && (
                  <span className="text-[10px] leading-tight mt-0.5 opacity-80">
                    {total >= 1000
                      ? `${(total / 1000).toFixed(1)}k`
                      : total.toFixed(0)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Color legend */}
      <div className="flex items-center justify-center gap-4 px-4 py-3 mt-2">
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <span className="w-3 h-3 rounded bg-zinc-800" />
          None
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <span className="w-3 h-3 rounded bg-green-500/20 ring-1 ring-green-500/30" />
          &lt;500
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <span className="w-3 h-3 rounded bg-yellow-500/20 ring-1 ring-yellow-500/30" />
          &lt;1K
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <span className="w-3 h-3 rounded bg-red-500/20 ring-1 ring-red-500/30" />
          &gt;1K
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDay !== null && (
        <div className="mt-4 border-t border-zinc-800">
          <div className="px-4 py-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-200">
              {MONTH_NAMES[month - 1]} {selectedDay}
            </h3>
            {selectedSpending && selectedSpending.total > 0 && (
              <span className="text-sm font-mono tabular-nums text-zinc-300">
                {formatCurrency(selectedSpending.total)}
              </span>
            )}
          </div>

          {isLoadingDay ? (
            <div className="px-4 py-8 text-center">
              <div className="text-zinc-500 text-sm">Loading transactions...</div>
            </div>
          ) : dayTransactions.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-zinc-500 text-sm">No transactions on this day</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {dayTransactions.map((txn) => {
                const typeColor = TRANSACTION_TYPE_COLORS[txn.type];
                const categoryName = txn.category?.name ?? (txn.type === "expense" ? "Expense" : "Income");
                const categoryIcon = txn.category?.icon;
                const categoryColor = txn.category?.color;

                const secondaryParts: string[] = [];
                if (txn.subcategory?.name) secondaryParts.push(txn.subcategory.name);
                if (txn.event?.name) secondaryParts.push(txn.event.name);
                if (txn.note) secondaryParts.push(txn.note);

                return (
                  <div
                    key={txn.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-900/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/edit/${txn.id}`)}
                  >
                    {/* Category icon */}
                    <div
                      className="flex items-center justify-center size-8 rounded-full text-sm shrink-0"
                      style={{ backgroundColor: categoryColor ? `${categoryColor}20` : "rgb(39 39 42)" }}
                    >
                      {categoryIcon ?? categoryName.charAt(0)}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-sm font-medium text-zinc-100 truncate">
                          {categoryName}
                        </p>
                        <span
                          className={`text-sm font-mono tabular-nums font-medium shrink-0 ${typeColor.text}`}
                        >
                          {typeColor.prefix}
                          {formatCurrency(txn.amount)}
                        </span>
                      </div>
                      {secondaryParts.length > 0 && (
                        <p className="text-xs text-zinc-500 truncate mt-0.5">
                          {secondaryParts.join(" · ")}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
