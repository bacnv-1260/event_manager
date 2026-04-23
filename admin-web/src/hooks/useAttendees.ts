import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api.client';

export interface Attendee {
  registrationId: string;
  userId: string;
  name: string;
  email: string;
  ticketTypeName: string;
  registeredAt: string;
  status: 'active' | 'used' | 'void';
  checkedInAt: string | null;
}

interface AttendeesResponse {
  data: Attendee[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

async function fetchAttendees(
  eventId: string,
  page: number,
  pageSize: number,
): Promise<AttendeesResponse> {
  const { data } = await apiClient.get<AttendeesResponse>(
    `/admin/events/${eventId}/attendees`,
    { params: { page, pageSize } },
  );
  return data;
}

export function useAttendees(eventId: string, page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ['admin', 'attendees', eventId, page, pageSize],
    queryFn: () => fetchAttendees(eventId, page, pageSize),
    enabled: !!eventId,
  });
}
