"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BarChart3,
  Plus,
  Calendar,
  Menu,
  List,
  CalendarDays,
  Grid3X3,
  TrendingUp,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, MORE_MENU_ITEMS } from "@/lib/constants";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  BarChart3,
  Plus,
  Calendar,
  Menu,
  List,
  CalendarDays,
  Grid3x3: Grid3X3,
  TrendingUp,
  Settings,
};

export function MobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
        <div className="flex items-end justify-around px-2 pb-[env(safe-area-inset-bottom)]">
          {NAV_ITEMS.map((item) => {
            const Icon = ICON_MAP[item.icon];
            const isAdd = item.label === "Add";
            const isMore = item.label === "More";
            const isActive =
              !isMore &&
              !isAdd &&
              (item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href));

            if (isMore) {
              return (
                <Sheet key={item.label} open={moreOpen} onOpenChange={setMoreOpen}>
                  <SheetTrigger asChild>
                    <button
                      className="flex flex-col items-center justify-center gap-0.5 py-2 px-3 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Icon className="size-5" />
                      <span className="text-[10px] font-medium">{item.label}</span>
                    </button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="rounded-t-2xl pb-8">
                    <SheetHeader>
                      <SheetTitle>More</SheetTitle>
                    </SheetHeader>
                    <div className="grid grid-cols-3 gap-4 px-4 pt-2">
                      {MORE_MENU_ITEMS.map((menuItem) => {
                        const MenuIcon = ICON_MAP[menuItem.icon];
                        return (
                          <Link
                            key={menuItem.href}
                            href={menuItem.href}
                            onClick={() => setMoreOpen(false)}
                            className={cn(
                              "flex flex-col items-center gap-2 rounded-xl p-4 transition-colors hover:bg-muted",
                              pathname.startsWith(menuItem.href) && "bg-muted text-foreground"
                            )}
                          >
                            {MenuIcon && <MenuIcon className="size-6 text-muted-foreground" />}
                            <span className="text-xs font-medium">{menuItem.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </SheetContent>
                </Sheet>
              );
            }

            if (isAdd) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex flex-col items-center justify-center -mt-4"
                >
                  <div
                    className={cn(
                      "flex items-center justify-center size-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-transform active:scale-95",
                      pathname === "/add" && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    )}
                  >
                    <Plus className="size-7" strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] font-medium text-primary mt-0.5">
                    {item.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-2 px-3 transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop sidebar nav */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 md:border-r md:border-border md:bg-card">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">M</span>
          </div>
          <span className="font-semibold text-foreground">Money Manager</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.filter((i) => i.label !== "More" && i.label !== "Add").map(
            (item) => {
              const Icon = ICON_MAP[item.icon];
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="size-5" />
                  {item.label}
                </Link>
              );
            }
          )}
          <div className="pt-2 pb-1">
            <span className="px-3 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              More
            </span>
          </div>
          {MORE_MENU_ITEMS.map((item) => {
            const Icon = ICON_MAP[item.icon];
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {Icon && <Icon className="size-5" />}
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <Link
            href="/add"
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium transition-colors hover:bg-primary/90",
              pathname === "/add" && "ring-2 ring-primary/50"
            )}
          >
            <Plus className="size-5" />
            Add Transaction
          </Link>
        </div>
      </aside>
    </>
  );
}
