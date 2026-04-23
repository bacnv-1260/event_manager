import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAttendees } from '../hooks/useAttendees';
import { AttendeeTable } from '../components/AttendeeTable';
import { useAdminEvents } from '../hooks/useAdminEvents';

export default function AttendeeListPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const { data: events } = useAdminEvents();
  const event = events?.find((e) => e.id === eventId);

  const { data, isLoading, isError, refetch } = useAttendees(eventId ?? '', page, PAGE_SIZE);

  if (!eventId) return <p>Invalid event.</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Attendees{event ? ` — ${event.title}` : ''}</h1>
      <button onClick={() => refetch()} style={{ marginBottom: '1rem' }}>
        Refresh
      </button>

      {isLoading && <p>Loading attendees…</p>}
      {isError && <p style={{ color: 'red' }}>Failed to load attendees.</p>}

      {data && (
        <>
          <p style={{ marginBottom: '0.5rem' }}>
            Total: <strong>{data.pagination.total}</strong> attendees
          </p>
          <AttendeeTable
            attendees={data.data}
            eventId={eventId}
            page={page}
            total={data.pagination.total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
