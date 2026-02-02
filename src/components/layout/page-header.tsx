"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  backHref?: string;
  rightAction?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  showBack = false,
  backHref,
  rightAction,
  className,
}: PageHeaderProps) {
  const router = useRouter();

  return (
    <div className={cn("flex items-center justify-between px-4 py-3", className)}>
      <div className="flex items-center gap-2">
        {showBack && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              if (backHref) {
                router.push(backHref);
              } else {
                router.back();
              }
            }}
          >
            <ArrowLeft className="size-5" />
          </Button>
        )}
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>
      {rightAction && <div>{rightAction}</div>}
    </div>
  );
}
