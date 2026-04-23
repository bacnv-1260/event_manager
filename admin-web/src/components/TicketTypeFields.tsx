import React from 'react';
import { useFieldArray } from 'react-hook-form';
import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form';

export interface TicketTypeField {
  name: string;
  price: number;
  maxCapacity: number;
}

export interface EventFormValues {
  title: string;
  description: string;
  location: string;
  startDatetime: string;
  endDatetime: string;
  ticketTypes: TicketTypeField[];
}

interface TicketTypeFieldsProps {
  control: Control<EventFormValues>;
  register: UseFormRegister<EventFormValues>;
  errors: FieldErrors<EventFormValues>;
}

export function TicketTypeFields({ control, register, errors }: TicketTypeFieldsProps) {
  const { fields, append, remove } = useFieldArray({ control, name: 'ticketTypes' });

  return (
    <div>
      <h3>Ticket Types</h3>
      {fields.map((field, index) => (
        <div
          key={field.id}
          style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '0.5rem' }}
        >
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ flex: 2 }}>
              <label>Name</label>
              <input
                {...register(`ticketTypes.${index}.name`, { required: 'Name is required' })}
                placeholder="e.g. General, VIP"
                style={{ width: '100%' }}
              />
              {errors.ticketTypes?.[index]?.name && (
                <span style={{ color: 'red', fontSize: '0.8em' }}>
                  {errors.ticketTypes[index]?.name?.message}
                </span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <label>Price (USD)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                {...register(`ticketTypes.${index}.price`, {
                  required: 'Price required',
                  min: { value: 0, message: 'Price ≥ 0' },
                  valueAsNumber: true,
                })}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>Capacity</label>
              <input
                type="number"
                min="1"
                {...register(`ticketTypes.${index}.maxCapacity`, {
                  required: 'Capacity required',
                  min: { value: 1, message: 'Min 1' },
                  valueAsNumber: true,
                })}
                style={{ width: '100%' }}
              />
            </div>
            <button
              type="button"
              onClick={() => remove(index)}
              style={{ alignSelf: 'flex-end' }}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => append({ name: '', price: 0, maxCapacity: 100 })}
      >
        + Add Ticket Type
      </button>
    </div>
  );
}
