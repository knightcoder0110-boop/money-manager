"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock } from "lucide-react";

interface LockScreenProps {
  from?: string;
}

export default function LockScreen({ from }: LockScreenProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push(from || "/");
        router.refresh();
      } else {
        setError("Wrong password");
        setShake(true);
        setPassword("");
        setTimeout(() => setShake(false), 500);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4">
      <div className="w-full max-w-xs space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-semibold">Money Manager</h1>
          <p className="text-sm text-muted-foreground">Enter your password to unlock</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="sr-only">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className={shake ? "animate-shake" : ""}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={loading || !password}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Unlock
          </Button>
        </form>
      </div>
    </div>
  );
}
