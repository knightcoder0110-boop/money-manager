"use client";

import { useState } from "react";
import { toggleBudgetMode } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

interface BudgetModeSettingsProps {
  active: boolean;
  dailyLimit: number;
}

export default function BudgetModeSettings({ active, dailyLimit }: BudgetModeSettingsProps) {
  const router = useRouter();
  const [isActive, setIsActive] = useState(active);
  const [limit, setLimit] = useState(String(dailyLimit || ""));
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    const newActive = !isActive;
    const limitNum = parseFloat(limit) || 0;

    if (newActive && limitNum <= 0) {
      toast.error("Set a daily limit before enabling budget mode");
      return;
    }

    setLoading(true);
    try {
      const result = await toggleBudgetMode(newActive, limitNum);
      if (result.error) {
        toast.error(result.error);
      } else {
        setIsActive(newActive);
        toast.success(newActive ? "Budget mode activated" : "Budget mode deactivated");
        router.refresh();
      }
    } catch {
      toast.error("Failed to update budget mode");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateLimit() {
    const limitNum = parseFloat(limit) || 0;
    if (limitNum <= 0) {
      toast.error("Daily limit must be greater than zero");
      return;
    }
    setLoading(true);
    try {
      const result = await toggleBudgetMode(isActive, limitNum);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Daily limit updated");
        router.refresh();
      }
    } catch {
      toast.error("Failed to update limit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className={isActive ? "border-red-500/50" : ""}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldAlert className={`h-5 w-5 ${isActive ? "text-red-500" : "text-muted-foreground"}`} />
          <CardTitle className="text-base">Budget Mode</CardTitle>
        </div>
        <CardDescription>
          {isActive
            ? `Active — Daily limit: ${formatCurrency(parseFloat(limit) || 0)}`
            : "When active, you get warnings before non-essential spending"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="daily-limit">Daily Spending Limit</Label>
          <div className="flex items-center gap-2">
            <Input
              id="daily-limit"
              type="number"
              inputMode="decimal"
              placeholder="e.g. 500"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="font-mono"
            />
            {isActive && (
              <Button variant="outline" size="sm" onClick={handleUpdateLimit} disabled={loading}>
                Update
              </Button>
            )}
          </div>
        </div>

        <Button
          onClick={handleToggle}
          disabled={loading}
          variant={isActive ? "destructive" : "default"}
          className="w-full"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isActive ? "Deactivate Budget Mode" : "Activate Budget Mode"}
        </Button>
      </CardContent>
    </Card>
  );
}
