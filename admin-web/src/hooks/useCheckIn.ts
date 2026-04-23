import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api.client';

export interface CheckInResult {
  result: 'valid' | 'already_used' | 'invalid';
  attendee?: {
    name: string;
    email: string;
    ticketTypeName: string;
  };
  message: string;
}

async function scanToken(payload: { qrToken: string; eventId: string }): Promise<CheckInResult> {
  const { data } = await apiClient.post<{ data: CheckInResult }>('/admin/checkin/scan', payload);
  return data.data;
}

async function manualCheckIn({
  registrationId,
  eventId,
}: {
  registrationId: string;
  eventId: string;
}): Promise<CheckInResult> {
  const { data } = await apiClient.patch<CheckInResult>(
    `/admin/checkin/registrations/${registrationId}/checkin`,
    { eventId },
  );
  return data;
}

export function useScanToken() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: scanToken,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'attendees'] });
    },
  });
}

export function useManualCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ registrationId, eventId }: { registrationId: string; eventId: string }) =>
      manualCheckIn({ registrationId, eventId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'attendees'] });
    },
  });
}
