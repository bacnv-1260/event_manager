import React from 'react';
import { Link } from 'react-router-dom';
import { useAdminEvents } from '../hooks/useAdminEvents';
import { EventStatusControl } from '../components/EventStatusControl';
import { TableSkeleton, EmptyState } from '../components/LoadingSkeleton';

const STATUS_COLORS: Record<string, string> = {
  draft: '#6b7280',
  published: '#22c55e',
  cancelled: '#ef4444',
};

export default function EventsPage() {
  const { data: events, isLoading, isError } = useAdminEvents();

  if (isLoading) return <TableSkeleton rows={5} />;
  if (isError) return <p style={{ color: 'red' }}>Failed to load events.</p>;
    console.log("render============")
  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>My Events</h1>
        <Link to="/events/new"
            style={{
                padding: '0.5rem 1rem',
                background: '#3b82f6',
                color: '#fff',
                borderRadius: 6,
                textDecoration: 'none',
                fontWeight: 500,
            }}>
          + Create Event
        </Link>
      </div>

      {events?.length === 0 && (
        <EmptyState
          title="No events yet"
          description="Create your first event to get started."
          action={
            <Link to="/events/new">
              <button>+ Create Event</button>
            </Link>
          }
        />
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Title</th>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Location</th>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Start</th>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Status</th>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {events?.map((event) => (
            <tr key={event.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '0.5rem' }}>{event.title}</td>
              <td style={{ padding: '0.5rem' }}>{event.location}</td>
              <td style={{ padding: '0.5rem' }}>
                {new Date(event.startDatetime).toLocaleString()}
              </td>
              <td style={{ padding: '0.5rem' }}>
                <span
                  style={{
                    background: STATUS_COLORS[event.status],
                    color: '#fff',
                    padding: '0.2rem 0.5rem',
                    borderRadius: 4,
                    fontSize: '0.8em',
                  }}
                >
                  {event.status}
                </span>
              </td>
              <td style={{ padding: '0.5rem' }}>
                <Link to={`/events/${event.id}/edit`} style={{ marginRight: '0.5rem' }}>
                  Edit
                </Link>
                <Link to={`/events/${event.id}/attendees`} style={{ marginRight: '0.5rem' }}>
                  Attendees
                </Link>
                <EventStatusControl event={event} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
