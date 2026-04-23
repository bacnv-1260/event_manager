import React, { useCallback, useState } from 'react';
import { CheckInResultCard } from '../components/CheckInResultCard';
import { QrScanner } from '../components/QrScanner';
import { CheckInResult, useScanToken } from '../hooks/useCheckIn';
import { useAdminEvents } from '../hooks/useAdminEvents';

export default function CheckInPage() {
  const { data: events } = useAdminEvents();
  const [selectedEventId, setSelectedEventId] = useState('');
  const [lastResult, setLastResult] = useState<CheckInResult | null>(null);
  const [history, setHistory] = useState<CheckInResult[]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const { mutate: scanToken, isPending } = useScanToken();

  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleScan = useCallback(
    (token: string) => {
      if (!selectedEventId || isPending) return;
      scanToken(
        { qrToken: token, eventId: selectedEventId },
        {
          onSuccess: (result) => {
            setLastResult(result);
            setHistory((prev) => [result, ...prev.slice(0, 19)]);
          },
          onError: () => {
            const err: CheckInResult = { result: 'invalid', message: 'Scan failed. Try again.' };
            setLastResult(err);
          },
        },
      );
    },
    [selectedEventId, isPending, scanToken],
  );

  const publishedEvents = events?.filter((e) => e.status === 'published') ?? [];

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Check-in Scanner</h1>

      {isOffline && (
        <div
          style={{
            background: '#fee2e2',
            border: '1px solid #ef4444',
            padding: '0.75rem',
            borderRadius: 6,
            marginBottom: '1rem',
          }}
        >
          ⚠️ You are offline. Check-in scanning requires an internet connection.
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <label>Select Event *</label>
        <br />
        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          style={{ padding: '0.5rem', minWidth: 250 }}
        >
          <option value="">— Choose an event —</option>
          {publishedEvents.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.title}
            </option>
          ))}
        </select>
      </div>

      {selectedEventId ? (
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '0 0 auto' }}>
            <QrScanner onScan={handleScan} disabled={isPending || isOffline} />
          </div>
          <div style={{ flex: 1, minWidth: 280 }}>
            {isPending && <p>Validating…</p>}
            <CheckInResultCard result={lastResult} />

            {history.length > 0 && (
              <div style={{ marginTop: '2rem' }}>
                <h3>Scan History (last 20)</h3>
                <ul style={{ padding: 0, listStyle: 'none' }}>
                  {history.map((r, i) => (
                    <li
                      key={i}
                      style={{
                        padding: '0.4rem 0',
                        borderBottom: '1px solid #e5e7eb',
                        color: r.result === 'valid' ? '#16a34a' : '#dc2626',
                      }}
                    >
                      {r.result.replace('_', ' ')}
                      {r.attendee && ` — ${r.attendee.name}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : (
        <p>Please select an event to begin scanning.</p>
      )}
    </div>
  );
}
