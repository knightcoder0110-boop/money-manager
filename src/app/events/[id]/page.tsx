import { notFound } from "next/navigation";
import AppShell from "@/components/layout/app-shell";
import PageHeader from "@/components/layout/page-header";
import EventBreakdown from "@/components/events/event-breakdown";
import EventDetailActions from "./event-detail-actions";
import { getEventWithTransactions } from "@/actions/events";
import { formatCurrency, formatDate } from "@/lib/utils";

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;
  const result = await getEventWithTransactions(id);

  if (!result || !result.event) {
    notFound();
  }

  const { event, transactions, total, breakdown } = result;

  return (
    <AppShell>
      <PageHeader
        title={event.name}
        backHref="/events"
        action={<EventDetailActions eventId={event.id} />}
      />
      <div className="p-4 space-y-6">
        {/* Event Info */}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            {formatDate(event.start_date)}
            {event.start_date !== event.end_date && ` - ${formatDate(event.end_date)}`}
          </p>
          {event.description && (
            <p className="text-sm text-muted-foreground">{event.description}</p>
          )}
          <p className="text-2xl font-mono font-bold tabular-nums mt-2">
            {formatCurrency(total)}
          </p>
          <p className="text-xs text-muted-foreground">Total spent</p>
        </div>

        {/* Breakdown + Transactions */}
        <EventBreakdown breakdown={breakdown} transactions={transactions} total={total} />
      </div>
    </AppShell>
  );
}
