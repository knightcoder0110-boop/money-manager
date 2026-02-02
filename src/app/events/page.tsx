import Link from "next/link";
import AppShell from "@/components/layout/app-shell";
import PageHeader from "@/components/layout/page-header";
import EventCard from "@/components/events/event-card";
import { getEvents } from "@/actions/events";
import { Button } from "@/components/ui/button";
import { Plus, CalendarDays } from "lucide-react";

export default async function EventsPage() {
  const { data: events } = await getEvents();

  return (
    <AppShell>
      <PageHeader
        title="Events"
        action={
          <Link href="/events/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          </Link>
        }
      />
      <div className="p-4 space-y-3">
        {events.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">No events created yet.</p>
            <p className="text-sm text-muted-foreground">Plan your next trip or party!</p>
            <Link href="/events/new">
              <Button className="mt-2">
                <Plus className="h-4 w-4 mr-1" />
                Create Event
              </Button>
            </Link>
          </div>
        ) : (
          events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))
        )}
      </div>
    </AppShell>
  );
}
