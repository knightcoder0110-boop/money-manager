"use client";

import Link from "next/link";
import type { Event } from "@/types";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

interface EventCardProps {
  event: Event;
  totalCost?: number;
  breakdown?: { category_name: string; amount: number }[];
}

export default function EventCard({ event, totalCost = 0, breakdown = [] }: EventCardProps) {
  const dateRange =
    event.start_date === event.end_date
      ? formatDateShort(event.start_date)
      : `${formatDateShort(event.start_date)} - ${formatDateShort(event.end_date)}`;

  return (
    <Link href={`/events/${event.id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer">
        <CardContent className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-base">{event.name}</h3>
            </div>
            <span className="font-mono text-sm font-medium tabular-nums">
              {formatCurrency(totalCost)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{dateRange}</p>
          {event.description && (
            <p className="text-sm text-muted-foreground line-clamp-1">{event.description}</p>
          )}
          {breakdown.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {breakdown.slice(0, 3).map((item) => (
                <span
                  key={item.category_name}
                  className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md"
                >
                  {item.category_name} {formatCurrency(item.amount)}
                </span>
              ))}
              {breakdown.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{breakdown.length - 3} more
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
