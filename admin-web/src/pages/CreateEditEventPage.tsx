import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EventForm } from '../components/EventForm';
import type { EventFormValues } from '../components/TicketTypeFields';
import {
  useAdminEvents,
  useCreateEvent,
  useUpdateEvent,
} from '../hooks/useAdminEvents';

export default function CreateEditEventPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();

  const { data: events } = useAdminEvents();
  const event = events?.find((e) => e.id === id);

  const { mutateAsync: createEvent, isPending: isCreating } = useCreateEvent();
  const { mutateAsync: updateEvent, isPending: isUpdating } = useUpdateEvent();

  async function handleSubmit(values: EventFormValues) {
    const payload = {
      ...values,
      ticketTypes: values.ticketTypes.map((tt) => ({
        name: tt.name,
        price: tt.price,
        maxCapacity: tt.maxCapacity,
      })),
    };

    if (isEdit && id) {
      await updateEvent({ id, input: payload });
    } else {
      await createEvent(payload);
    }
    navigate('/events');
  }

  const defaultValues = event
    ? {
        title: event.title,
        description: event.description ?? '',
        location: event.location,
        startDatetime: event.startDatetime.slice(0, 16),
        endDatetime: event.endDatetime.slice(0, 16),
        ticketTypes: event.ticketTypes.map((tt) => ({
          name: tt.name,
          price: parseFloat(tt.price),
          maxCapacity: tt.maxCapacity,
        })),
      }
    : undefined;

  return (
    <div style={{ padding: '2rem', maxWidth: 700, margin: '0 auto' }}>
      <h1>{isEdit ? 'Edit Event' : 'Create Event'}</h1>
      <EventForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
}
