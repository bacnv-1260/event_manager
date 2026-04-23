import React from 'react';
import { useForm } from 'react-hook-form';
import { TicketTypeFields } from './TicketTypeFields';
import type { EventFormValues } from './TicketTypeFields';

interface EventFormProps {
  defaultValues?: Partial<EventFormValues>;
  onSubmit: (values: EventFormValues) => void | Promise<void>;
  isLoading?: boolean;
}

export function EventForm({ defaultValues, onSubmit, isLoading }: EventFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormValues>({
    defaultValues: defaultValues ?? {
      title: '',
      description: '',
      location: '',
      startDatetime: '',
      endDatetime: '',
      ticketTypes: [{ name: '', price: 0, maxCapacity: 100 }],
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div style={{ marginBottom: '1rem' }}>
        <label>Title *</label>
        <input
          {...register('title', { required: 'Title is required' })}
          style={{ width: '100%' }}
        />
        {errors.title && <span style={{ color: 'red' }}>{errors.title.message}</span>}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Description</label>
        <textarea {...register('description')} rows={3} style={{ width: '100%' }} />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Location *</label>
        <input
          {...register('location', { required: 'Location is required' })}
          style={{ width: '100%' }}
        />
        {errors.location && <span style={{ color: 'red' }}>{errors.location.message}</span>}
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ flex: 1 }}>
          <label>Start Date/Time *</label>
          <input
            type="datetime-local"
            {...register('startDatetime', { required: 'Start time is required' })}
            style={{ width: '100%' }}
          />
          {errors.startDatetime && (
            <span style={{ color: 'red' }}>{errors.startDatetime.message}</span>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <label>End Date/Time *</label>
          <input
            type="datetime-local"
            {...register('endDatetime', { required: 'End time is required' })}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <TicketTypeFields control={control} register={register} errors={errors} />

      <div style={{ marginTop: '1.5rem' }}>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving…' : 'Save Event'}
        </button>
      </div>
    </form>
  );
}
