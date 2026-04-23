import React from 'react';
import type { CheckInResult } from '../hooks/useCheckIn';

interface CheckInResultCardProps {
  result: CheckInResult | null;
}

const STYLES: Record<
  string,
  { background: string; border: string; icon: string }
> = {
  valid: { background: '#dcfce7', border: '2px solid #22c55e', icon: '✅' },
  already_used: { background: '#fee2e2', border: '2px solid #ef4444', icon: '🔴' },
  invalid: { background: '#fee2e2', border: '2px solid #ef4444', icon: '❌' },
};

export function CheckInResultCard({ result }: CheckInResultCardProps) {
  if (!result) return null;

  const style = STYLES[result.result] ?? {
    background: '#f3f4f6',
    border: '1px solid #d1d5db',
    icon: '?',
  };

  return (
    <div
      style={{
        ...style,
        borderRadius: 8,
        padding: '1.5rem',
        marginTop: '1rem',
        maxWidth: 400,
      }}
    >
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{style.icon}</div>
      <strong style={{ fontSize: '1.2rem', textTransform: 'capitalize' }}>
        {result.result.replace('_', ' ')}
      </strong>
      <p style={{ margin: '0.5rem 0' }}>{result.message}</p>
      {result.attendee && (
        <div style={{ marginTop: '0.75rem', fontSize: '0.9em' }}>
          <div>
            <strong>Name:</strong> {result.attendee.name}
          </div>
          <div>
            <strong>Email:</strong> {result.attendee.email}
          </div>
          <div>
            <strong>Ticket:</strong> {result.attendee.ticketTypeName}
          </div>
        </div>
      )}
    </div>
  );
}
