import AppShell from "@/components/layout/app-shell";
import PageHeader from "@/components/layout/page-header";
import EventForm from "@/components/events/event-form";

export default function NewEventPage() {
  return (
    <AppShell>
      <PageHeader title="New Event" backHref="/events" />
      <EventForm />
    </AppShell>
  );
}
