import api from './client';
import { EventWithDetails, EventDetail, CreateEventInput, ActionResult, Event } from '../types';

export async function getEvents(): Promise<EventWithDetails[]> {
  const { data } = await api.get('/events');
  return data;
}

export async function getEvent(id: string): Promise<EventDetail> {
  const { data } = await api.get(`/events/${id}`);
  return data;
}

export async function createEvent(input: CreateEventInput): Promise<ActionResult<Event>> {
  const { data } = await api.post('/events', input);
  return data;
}

export async function updateEvent(id: string, input: Partial<CreateEventInput>): Promise<ActionResult<Event>> {
  const { data } = await api.patch(`/events/${id}`, input);
  return data;
}

export async function deleteEvent(id: string): Promise<ActionResult> {
  const { data } = await api.delete(`/events/${id}`);
  return data;
}
