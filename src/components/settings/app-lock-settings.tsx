"use client";

import { useState } from "react";
import { setAppLockPassword, removeAppLockPassword } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AppLockSettingsProps {
  hasPassword: boolean;
}

export default function AppLockSettings({ hasPassword }: AppLockSettingsProps) {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRemove, setShowRemove] = useState(false);
  const [removePassword, setRemovePassword] = useState("");

  function resetForm() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setRemovePassword("");
    setShowRemove(false);
  }

  async function handleSetPassword() {
    if (newPassword.length < 4) {
      toast.error("Password must be at least 4 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const result = await setAppLockPassword(
        newPassword,
        hasPassword ? currentPassword : undefined
      );
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(hasPassword ? "Password changed" : "App lock enabled");
        resetForm();
        router.refresh();
      }
    } catch {
      toast.error("Failed to set password");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemovePassword() {
    if (!removePassword) {
      toast.error("Enter your current password");
      return;
    }

    setLoading(true);
    try {
      const result = await removeAppLockPassword(removePassword);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("App lock removed");
        resetForm();
        router.refresh();
      }
    } catch {
      toast.error("Failed to remove password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <LockKeyhole className={`h-5 w-5 ${hasPassword ? "text-primary" : "text-muted-foreground"}`} />
          <CardTitle className="text-base">App Lock</CardTitle>
        </div>
        <CardDescription>
          {hasPassword
            ? "Your app is protected with a password"
            : "Set a password to protect your app"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasPassword && (
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="new-password">{hasPassword ? "New Password" : "Password"}</Label>
          <Input
            id="new-password"
            type="password"
            placeholder={hasPassword ? "Enter new password" : "Choose a password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input
            id="confirm-password"
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <Button onClick={handleSetPassword} disabled={loading} className="w-full">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {hasPassword ? "Change Password" : "Set Password"}
        </Button>

        {hasPassword && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>

            {!showRemove ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowRemove(true)}
              >
                Remove Password
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="remove-password">Confirm Current Password</Label>
                  <Input
                    id="remove-password"
                    type="password"
                    placeholder="Enter current password to remove"
                    value={removePassword}
                    onChange={(e) => setRemovePassword(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={handleRemovePassword}
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Remove
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowRemove(false);
                      setRemovePassword("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
