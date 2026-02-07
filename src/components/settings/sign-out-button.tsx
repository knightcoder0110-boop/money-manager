"use client";

import { signOut } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut } from "lucide-react";

export default function SignOutButton({ email }: { email: string }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <LogOut className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base">Account</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Signed in as <span className="font-medium text-foreground">{email}</span>
        </p>
        <form action={signOut}>
          <Button type="submit" variant="outline" className="w-full">
            Sign out
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
