import React, { useState } from 'react';
import type { Attendee } from '../hooks/useAttendees';
import { useManualCheckIn } from '../hooks/useCheckIn';
import { ConfirmDialog } from './ConfirmDialog';

interface AttendeeTableProps {
  attendees: Attendee[];
  eventId: string;
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function AttendeeTable({
  attendees,
  eventId,
  page,
  total,
  pageSize,
  onPageChange,
}: AttendeeTableProps) {
  const { mutate: checkIn, isPending } = useManualCheckIn();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Name</th>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Email</th>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Ticket Type</th>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Check-in Status</th>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {attendees.map((a) => (
            <tr key={a.registrationId} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '0.5rem' }}>{a.name}</td>
              <td style={{ padding: '0.5rem' }}>{a.email}</td>
              <td style={{ padding: '0.5rem' }}>{a.ticketTypeName}</td>
              <td style={{ padding: '0.5rem' }}>
                {a.status === 'used' ? (
                  <span style={{ color: '#16a34a' }}>
                    ✅ Checked In{' '}
                    {a.checkedInAt && (
                      <small>({new Date(a.checkedInAt).toLocaleTimeString()})</small>
                    )}
                  </span>
                ) : (
                  <span style={{ color: '#6b7280' }}>Not Yet</span>
                )}
              </td>
              <td style={{ padding: '0.5rem' }}>
                {a.status !== 'used' && (
                  <button
                    onClick={() => setPendingId(a.registrationId)}
                    disabled={isPending}
                    style={{ fontSize: '0.8em' }}
                  >
                    Mark Checked In
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            Prev
          </button>
          <span>
            Page {page} / {totalPages}
          </span>
          <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
            Next
          </button>
        </div>
      )}

      <ConfirmDialog
        open={!!pendingId}
        title="Manual Check-In"
        message="Mark this attendee as checked in? This cannot be undone."
        confirmLabel="Check In"
        onConfirm={() => {
          if (pendingId) checkIn({ registrationId: pendingId, eventId });
          setPendingId(null);
        }}
        onCancel={() => setPendingId(null)}
      />
    </div>
  );
}
