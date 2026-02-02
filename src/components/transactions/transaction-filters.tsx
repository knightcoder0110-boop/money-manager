"use client";

import { cn } from "@/lib/utils";
import type { TransactionType, Necessity, CategoryWithSubs } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

export interface TransactionFilters {
  type?: TransactionType;
  category_id?: string;
  necessity?: Necessity;
  date_from?: string;
  date_to?: string;
}

interface TransactionFiltersBarProps {
  filters: TransactionFilters;
  onChange: (filters: TransactionFilters) => void;
  categories?: CategoryWithSubs[];
  className?: string;
}

export function TransactionFiltersBar({
  filters,
  onChange,
  categories = [],
  className,
}: TransactionFiltersBarProps) {
  const [dateFromOpen, setDateFromOpen] = useState(false);
  const [dateToOpen, setDateToOpen] = useState(false);

  const hasFilters =
    filters.type || filters.category_id || filters.necessity || filters.date_from || filters.date_to;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap gap-2">
        {/* Type filter */}
        <Select
          value={filters.type ?? "all"}
          onValueChange={(val) =>
            onChange({ ...filters, type: val === "all" ? undefined : (val as TransactionType) })
          }
        >
          <SelectTrigger className="w-[120px]" size="sm">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="expense">Expenses</SelectItem>
            <SelectItem value="income">Income</SelectItem>
          </SelectContent>
        </Select>

        {/* Category filter */}
        <Select
          value={filters.category_id ?? "all"}
          onValueChange={(val) =>
            onChange({ ...filters, category_id: val === "all" ? undefined : val })
          }
        >
          <SelectTrigger className="w-[140px]" size="sm">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Necessity filter */}
        <Select
          value={filters.necessity ?? "all"}
          onValueChange={(val) =>
            onChange({
              ...filters,
              necessity: val === "all" ? undefined : (val as Necessity),
            })
          }
        >
          <SelectTrigger className="w-[140px]" size="sm">
            <SelectValue placeholder="Necessity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="necessary">Necessary</SelectItem>
            <SelectItem value="unnecessary">Unnecessary</SelectItem>
            <SelectItem value="debatable">Debatable</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date range */}
      <div className="flex flex-wrap items-center gap-2">
        <Popover open={dateFromOpen} onOpenChange={setDateFromOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <CalendarIcon className="size-3.5" />
              {filters.date_from
                ? format(new Date(filters.date_from), "MMM d, yyyy")
                : "From date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filters.date_from ? new Date(filters.date_from) : undefined}
              onSelect={(date) => {
                onChange({
                  ...filters,
                  date_from: date ? format(date, "yyyy-MM-dd") : undefined,
                });
                setDateFromOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>

        <span className="text-xs text-muted-foreground">to</span>

        <Popover open={dateToOpen} onOpenChange={setDateToOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <CalendarIcon className="size-3.5" />
              {filters.date_to
                ? format(new Date(filters.date_to), "MMM d, yyyy")
                : "To date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filters.date_to ? new Date(filters.date_to) : undefined}
              onSelect={(date) => {
                onChange({
                  ...filters,
                  date_to: date ? format(date, "yyyy-MM-dd") : undefined,
                });
                setDateToOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-xs text-muted-foreground"
            onClick={() => onChange({})}
          >
            <X className="size-3" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
