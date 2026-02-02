"use client";

import type { Subcategory } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SubcategoryPickerProps {
  subcategories: Subcategory[];
  selectedId: string | undefined;
  onSelect: (id: string | undefined) => void;
  className?: string;
}

export function SubcategoryPicker({
  subcategories,
  selectedId,
  onSelect,
  className,
}: SubcategoryPickerProps) {
  if (subcategories.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <Select
        value={selectedId ?? ""}
        onValueChange={(val) => onSelect(val || undefined)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select subcategory (optional)" />
        </SelectTrigger>
        <SelectContent>
          {subcategories.map((sub) => (
            <SelectItem key={sub.id} value={sub.id}>
              {sub.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
