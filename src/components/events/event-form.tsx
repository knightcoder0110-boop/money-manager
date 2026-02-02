"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEvent } from "@/actions/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function EventForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Event name is required");
      return;
    }
    if (!startDate) {
      toast.error("Start date is required");
      return;
    }
    if (!endDate) {
      toast.error("End date is required");
      return;
    }
    if (endDate < startDate) {
      toast.error("End date cannot be before start date");
      return;
    }

    setLoading(true);
    try {
      const result = await createEvent({
        name: name.trim(),
        description: description.trim() || undefined,
        start_date: startDate,
        end_date: endDate,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Event created");
        router.push("/events");
      }
    } catch {
      toast.error("Failed to create event. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 px-4 py-6">
      <div className="space-y-2">
        <Label htmlFor="name">Event Name</Label>
        <Input
          id="name"
          placeholder="e.g. Goa Trip, Birthday Party"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          placeholder="What's this event about?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Start Date</Label>
          <Input
            id="start_date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-foreground [color-scheme:dark]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date">End Date</Label>
          <Input
            id="end_date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-foreground [color-scheme:dark]"
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Event
      </Button>
    </form>
  );
}
