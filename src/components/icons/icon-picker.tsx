"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ICON_REGISTRY } from "./category-icons";
import { Search } from "lucide-react";

interface IconPickerProps {
  value: string;
  onChange: (iconKey: string) => void;
  className?: string;
}

export function IconPicker({ value, onChange, className }: IconPickerProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return ICON_REGISTRY;
    const q = search.toLowerCase();
    return ICON_REGISTRY.filter(
      (entry) =>
        entry.label.toLowerCase().includes(q) ||
        entry.key.includes(q) ||
        entry.tags.some((t) => t.includes(q))
    );
  }, [search]);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search icons..."
          className="w-full rounded-md border border-input bg-background pl-8 pr-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
      <div className="grid grid-cols-7 gap-1 max-h-48 overflow-y-auto rounded-md border border-border p-1.5">
        {filtered.length === 0 ? (
          <p className="col-span-7 text-center text-xs text-muted-foreground py-4">
            No icons found
          </p>
        ) : (
          filtered.map((entry) => {
            const Icon = entry.icon;
            const isSelected = value === entry.key;
            return (
              <button
                key={entry.key}
                type="button"
                title={entry.label}
                onClick={() => onChange(entry.key)}
                className={cn(
                  "flex items-center justify-center rounded-md p-2 transition-colors",
                  isSelected
                    ? "bg-primary text-primary-foreground ring-1 ring-primary"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon size={18} />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
