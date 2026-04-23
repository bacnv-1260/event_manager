import React, { useState } from 'react';
import { type AdminEvent, useChangeEventStatus } from '../hooks/useAdminEvents';
import { ConfirmDialog } from './ConfirmDialog';

interface EventStatusControlProps {
  event: AdminEvent;
}

export function EventStatusControl({ event }: EventStatusControlProps) {
  const { mutate: changeStatus, isPending } = useChangeEventStatus();
  const [confirmAction, setConfirmAction] = useState<'published' | 'cancelled' | null>(null);

  function handleConfirm() {
    if (!confirmAction) return;
    changeStatus({ id: event.id, status: confirmAction });
    setConfirmAction(null);
  }

  return (
    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
      {event.status === 'draft' && (
        <button
          onClick={() => setConfirmAction('published')}
          disabled={isPending}
          style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '0.3rem 0.75rem' }}
        >
          Publish
        </button>
      )}
      {(event.status === 'draft' || event.status === 'published') && (
        <button
          onClick={() => setConfirmAction('cancelled')}
          disabled={isPending}
          style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.3rem 0.75rem' }}
        >
          Cancel Event
        </button>
      )}

      {confirmAction && (
        <ConfirmDialog
          open={!!confirmAction}
          title={confirmAction === 'published' ? 'Publish Event' : 'Cancel Event'}
          message={`Are you sure you want to ${confirmAction === 'published' ? 'publish' : 'cancel'} this event?`}
          confirmLabel={confirmAction === 'published' ? 'Publish' : 'Cancel Event'}
          cancelLabel="Go back"
          danger={confirmAction === 'cancelled'}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}
