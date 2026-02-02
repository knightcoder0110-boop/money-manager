"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Tag, StickyNote, CalendarDays } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { CategoryPicker } from "@/components/transactions/category-picker";
import { SubcategoryPicker } from "@/components/transactions/subcategory-picker";
import { NecessityToggle } from "@/components/transactions/necessity-toggle";

import { useCategories } from "@/hooks/use-categories";
import { useBudgetMode } from "@/hooks/use-budget-mode";

import { createTransaction, updateTransaction } from "@/actions/transactions";
import { getEvents } from "@/actions/events";

import type {
  TransactionType,
  Necessity,
  CategoryWithSubs,
  Transaction,
  Event,
} from "@/types";

interface TransactionFormProps {
  /** If provided, the form is in edit mode */
  editTransaction?: Transaction & {
    category?: { id: string; name: string; icon: string; is_essential: boolean; is_income: boolean } | null;
  };
  /** Pre-select a type */
  defaultType?: TransactionType;
  /** Called after successful submit */
  onSuccess?: () => void;
  className?: string;
}

export function TransactionForm({
  editTransaction,
  defaultType,
  onSuccess,
  className,
}: TransactionFormProps) {
  const router = useRouter();
  const isEdit = !!editTransaction;

  // Form state
  const [type, setType] = useState<TransactionType>(
    editTransaction?.type ?? defaultType ?? "expense"
  );
  const [amount, setAmount] = useState<string>(
    editTransaction ? String(editTransaction.amount) : ""
  );
  const [categoryId, setCategoryId] = useState<string | undefined>(
    editTransaction?.category_id ?? undefined
  );
  const [selectedCategory, setSelectedCategory] = useState<CategoryWithSubs | undefined>();
  const [subcategoryId, setSubcategoryId] = useState<string | undefined>(
    editTransaction?.subcategory_id ?? undefined
  );
  const [necessity, setNecessity] = useState<Necessity | undefined>(
    editTransaction?.necessity ?? undefined
  );
  const [note, setNote] = useState(editTransaction?.note ?? "");
  const [date, setDate] = useState<Date>(
    editTransaction?.transaction_date
      ? new Date(editTransaction.transaction_date)
      : new Date()
  );
  const [eventId, setEventId] = useState<string | undefined>(
    editTransaction?.event_id ?? undefined
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [budgetWarningOpen, setBudgetWarningOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);

  const amountInputRef = useRef<HTMLInputElement>(null);

  // Fetch categories for the selected type
  const { categories, isLoading: categoriesLoading } = useCategories(
    type === "income" ? "income" : "expense"
  );

  // Fetch budget mode
  const { budgetMode } = useBudgetMode();

  // Fetch events
  useEffect(() => {
    getEvents({ limit: 50 }).then((res) => setEvents(res.data));
  }, []);

  // When categories load, find the pre-selected category
  useEffect(() => {
    if (categoryId && categories.length > 0) {
      const found = categories.find((c) => c.id === categoryId);
      if (found) setSelectedCategory(found);
    }
  }, [categoryId, categories]);

  // Focus amount input on mount
  useEffect(() => {
    const timeout = setTimeout(() => {
      amountInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timeout);
  }, []);

  // Handle type change — reset category-related selections
  const handleTypeChange = useCallback((newType: string) => {
    setType(newType as TransactionType);
    setCategoryId(undefined);
    setSelectedCategory(undefined);
    setSubcategoryId(undefined);
    if (newType === "income") {
      setNecessity(undefined);
    }
  }, []);

  // Handle category selection
  const handleCategorySelect = useCallback((cat: CategoryWithSubs) => {
    setCategoryId(cat.id);
    setSelectedCategory(cat);
    setSubcategoryId(undefined);
  }, []);

  // Format amount display
  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow only digits and one decimal point
    const cleaned = raw.replace(/[^0-9.]/g, "");
    // Prevent multiple decimal points
    const parts = cleaned.split(".");
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setAmount(cleaned);
  }, []);

  // Submit handler
  const handleSubmit = useCallback(async () => {
    // Validation
    const numericAmount = parseFloat(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      toast.error("Please enter a valid amount");
      amountInputRef.current?.focus();
      return;
    }
    if (!categoryId) {
      toast.error("Please select a category");
      return;
    }
    if (type === "expense" && !necessity) {
      toast.error("Please select necessity");
      return;
    }

    // Budget mode friction for non-essential categories
    if (
      type === "expense" &&
      budgetMode.active &&
      selectedCategory &&
      !selectedCategory.is_essential &&
      !budgetWarningOpen
    ) {
      setBudgetWarningOpen(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const dateStr = format(date, "yyyy-MM-dd");

      if (isEdit && editTransaction) {
        const result = await updateTransaction(editTransaction.id, {
          amount: numericAmount,
          category_id: categoryId,
          subcategory_id: subcategoryId,
          necessity: type === "expense" ? necessity : undefined,
          note: note || undefined,
          transaction_date: dateStr,
          event_id: eventId ?? null,
        });
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Transaction updated");
          onSuccess?.();
          router.back();
        }
      } else {
        const result = await createTransaction({
          type,
          amount: numericAmount,
          category_id: categoryId,
          subcategory_id: subcategoryId,
          necessity: type === "expense" ? necessity : undefined,
          note: note || undefined,
          transaction_date: dateStr,
          event_id: eventId,
        });
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success(
            type === "expense" ? "Expense added" : "Income added"
          );
          // Reset form for quick re-entry
          setAmount("");
          setCategoryId(undefined);
          setSelectedCategory(undefined);
          setSubcategoryId(undefined);
          setNecessity(undefined);
          setNote("");
          setEventId(undefined);
          setDate(new Date());
          amountInputRef.current?.focus();
          onSuccess?.();
        }
      }
    } catch {
      toast.error("Failed to save. Try again.");
    } finally {
      setIsSubmitting(false);
      setBudgetWarningOpen(false);
    }
  }, [
    amount,
    categoryId,
    type,
    necessity,
    budgetMode,
    selectedCategory,
    budgetWarningOpen,
    date,
    isEdit,
    editTransaction,
    subcategoryId,
    note,
    eventId,
    onSuccess,
    router,
  ]);

  return (
    <div className={cn("space-y-5 pb-6", className)}>
      {/* Type toggle tabs */}
      <Tabs value={type} onValueChange={handleTypeChange} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="expense" className="flex-1">
            Expense
          </TabsTrigger>
          <TabsTrigger value="income" className="flex-1">
            Income
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Amount input — big and prominent */}
      <div className="flex flex-col items-center py-4">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-muted-foreground">&#8377;</span>
          <input
            ref={amountInputRef}
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0"
            className="bg-transparent text-5xl font-bold font-mono tabular-nums text-foreground outline-none w-48 text-center placeholder:text-muted-foreground/30"
            autoComplete="off"
          />
        </div>
      </div>

      {/* Category picker */}
      <div>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
          Category
        </label>
        <CategoryPicker
          categories={categories}
          selectedId={categoryId}
          onSelect={handleCategorySelect}
          isLoading={categoriesLoading}
        />
      </div>

      {/* Subcategory picker — shows after category selected */}
      {selectedCategory && selectedCategory.subcategories.length > 0 && (
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
            Subcategory
          </label>
          <SubcategoryPicker
            subcategories={selectedCategory.subcategories}
            selectedId={subcategoryId}
            onSelect={setSubcategoryId}
          />
        </div>
      )}

      {/* Necessity toggle — only for expenses */}
      {type === "expense" && (
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
            Necessity
          </label>
          <NecessityToggle value={necessity} onChange={setNecessity} />
        </div>
      )}

      {/* Note, Date, Event in a compact section */}
      <div className="space-y-3">
        {/* Note */}
        <div className="flex items-start gap-3">
          <StickyNote className="size-5 text-muted-foreground mt-2.5 shrink-0" />
          <Textarea
            placeholder="Add a note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={1}
            className="min-h-10 resize-none"
          />
        </div>

        {/* Date picker */}
        <div className="flex items-center gap-3">
          <CalendarDays className="size-5 text-muted-foreground shrink-0" />
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="justify-start text-left font-normal flex-1"
              >
                <CalendarIcon className="size-4 mr-2" />
                {format(date, "EEE, MMM d, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => {
                  if (d) setDate(d);
                  setDateOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Event picker */}
        {events.length > 0 && (
          <div className="flex items-center gap-3">
            <Tag className="size-5 text-muted-foreground shrink-0" />
            <Select
              value={eventId ?? "none"}
              onValueChange={(val) => setEventId(val === "none" ? undefined : val)}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Link to event (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No event</SelectItem>
                {events.map((evt) => (
                  <SelectItem key={evt.id} value={evt.id}>
                    {evt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Submit button */}
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full h-12 text-base font-semibold"
        size="lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-5 animate-spin" />
            Saving...
          </>
        ) : isEdit ? (
          "Update Transaction"
        ) : type === "expense" ? (
          "Save Expense"
        ) : (
          "Save Income"
        )}
      </Button>

      {/* Budget mode friction dialog */}
      <Dialog open={budgetWarningOpen} onOpenChange={setBudgetWarningOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              Budget Mode Active
            </DialogTitle>
            <DialogDescription>
              You&apos;re about to spend on{" "}
              <span className="font-semibold text-foreground">
                {selectedCategory?.name}
              </span>{" "}
              (non-essential).
              {budgetMode.daily_limit > 0 && (
                <>
                  {" "}
                  Your daily limit is{" "}
                  <span className="font-mono font-semibold">
                    &#8377;{budgetMode.daily_limit.toLocaleString("en-IN")}
                  </span>
                  .
                </>
              )}
              <br />
              <br />
              Are you sure you want to proceed?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBudgetWarningOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleSubmit}>
              Yes, Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
