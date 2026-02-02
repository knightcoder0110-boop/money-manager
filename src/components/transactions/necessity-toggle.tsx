"use client";

import { cn } from "@/lib/utils";
import { NECESSITY_COLORS } from "@/lib/constants";
import type { Necessity } from "@/types";

interface NecessityToggleProps {
  value: Necessity | undefined;
  onChange: (value: Necessity) => void;
  className?: string;
}

const OPTIONS: { value: Necessity; label: string }[] = [
  { value: "necessary", label: "Necessary" },
  { value: "unnecessary", label: "Unnecessary" },
  { value: "debatable", label: "Debatable" },
];

export function NecessityToggle({ value, onChange, className }: NecessityToggleProps) {
  return (
    <div className={cn("flex gap-2", className)}>
      {OPTIONS.map((option) => {
        const colors = NECESSITY_COLORS[option.value];
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all border",
              isSelected
                ? cn(colors.bg, colors.text, colors.border)
                : "border-border text-muted-foreground hover:border-muted-foreground/50"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
