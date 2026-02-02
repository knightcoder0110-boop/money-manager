"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  backHref?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, backHref, action }: PageHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between px-4 py-4 border-b border-border">
      <div className="flex items-center gap-3">
        {backHref && (
          <Button variant="ghost" size="icon" onClick={() => router.push(backHref)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
