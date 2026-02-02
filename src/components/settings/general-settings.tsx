"use client";

import { useState } from "react";
import { updateSetting } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface GeneralSettingsProps {
  currency: string;
  currencySymbol: string;
  initialBalance: number;
}

export default function GeneralSettings({
  currency,
  currencySymbol,
  initialBalance,
}: GeneralSettingsProps) {
  const router = useRouter();
  const [currencyCode, setCurrencyCode] = useState(currency);
  const [symbol, setSymbol] = useState(currencySymbol);
  const [balance, setBalance] = useState(String(initialBalance));
  const [loading, setLoading] = useState(false);

  async function handleSaveCurrency() {
    setLoading(true);
    try {
      const result = await updateSetting("currency", {
        code: currencyCode,
        symbol: symbol,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Currency updated");
        router.refresh();
      }
    } catch {
      toast.error("Failed to update currency");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveBalance() {
    const balNum = parseFloat(balance);
    if (isNaN(balNum)) {
      toast.error("Enter a valid number");
      return;
    }
    setLoading(true);
    try {
      const result = await updateSetting("initial_balance", balNum);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Initial balance updated");
        router.refresh();
      }
    } catch {
      toast.error("Failed to update balance");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base">General</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Currency */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Currency
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="currency-code" className="text-xs">Code</Label>
              <Input
                id="currency-code"
                placeholder="INR"
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="currency-symbol" className="text-xs">Symbol</Label>
              <Input
                id="currency-symbol"
                placeholder="₹"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
              />
            </div>
          </div>
          <Button size="sm" onClick={handleSaveCurrency} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Currency
          </Button>
        </div>

        {/* Initial Balance */}
        <div className="space-y-3 pt-2 border-t border-border">
          <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Initial Balance
          </Label>
          <p className="text-xs text-muted-foreground">
            Starting balance before any transactions. This adjusts your total balance calculation.
          </p>
          <Input
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            className="font-mono"
          />
          <Button size="sm" onClick={handleSaveBalance} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Balance
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
