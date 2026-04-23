import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api.client';

export interface TicketType {
  id: string;
  name: string;
  price: string;
  maxCapacity: number;
  registeredCount: number;
  availableCapacity: number;
  isSoldOut: boolean;
  status: 'available' | 'sold_out';
}

export interface AdminEvent {
  id: string;
  title: string;
  description?: string;
  location: string;
  startDatetime: string;
  endDatetime: string;
  status: 'draft' | 'published' | 'cancelled';
  ticketTypes: TicketType[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  location: string;
  startDatetime: string;
  endDatetime: string;
  ticketTypes: { name: string; price: number; maxCapacity: number }[];
}

export type UpdateEventInput = Partial<CreateEventInput>;

async function fetchAdminEvents(): Promise<AdminEvent[]> {
  const { data } = await apiClient.get<{ data: AdminEvent[] }>('/admin/events');
  return data.data;
}

async function createEvent(input: CreateEventInput): Promise<AdminEvent> {
  const { data } = await apiClient.post<{ data: AdminEvent }>('/admin/events', input);
  return data.data;
}

async function updateEvent(id: string, input: UpdateEventInput): Promise<AdminEvent> {
  const { data } = await apiClient.put<{ data: AdminEvent }>(`/admin/events/${id}`, input);
  return data.data;
}

async function changeEventStatus(
  id: string,
  status: 'published' | 'cancelled',
): Promise<AdminEvent> {
  const { data } = await apiClient.patch<{ data: AdminEvent }>(`/admin/events/${id}/status`, {
    status,
  });
  return data.data;
}

export function useAdminEvents() {
  return useQuery({ queryKey: ['admin', 'events'], queryFn: fetchAdminEvents });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'events'] }),
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateEventInput }) =>
      updateEvent(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'events'] }),
  });
}

export function useChangeEventStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'published' | 'cancelled' }) =>
      changeEventStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'events'] }),
  });
}
