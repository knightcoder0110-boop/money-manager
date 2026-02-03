"use client";

import { cn } from "@/lib/utils";
import type { CategoryWithSubs } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryIcon } from "@/components/icons/category-icon";

interface CategoryPickerProps {
  categories: CategoryWithSubs[];
  selectedId: string | undefined;
  onSelect: (category: CategoryWithSubs) => void;
  isLoading?: boolean;
  className?: string;
}

export function CategoryPicker({
  categories,
  selectedId,
  onSelect,
  isLoading = false,
  className,
}: CategoryPickerProps) {
  if (isLoading) {
    return (
      <div className={cn("grid grid-cols-4 gap-2", className)}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        No categories found. Add some in Settings.
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-4 gap-2", className)}>
      {categories.map((cat) => {
        const isSelected = selectedId === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat)}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-xl p-3 transition-all border text-center",
              isSelected
                ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary"
                : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <CategoryIcon icon={cat.icon} size={24} />
            <span className="text-[11px] font-medium leading-tight truncate w-full">
              {cat.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
