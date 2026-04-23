import prisma from '../lib/prisma';
import { EventRepository } from '../repositories/event.repository';
import { TicketTypeRepository, TicketTypeInput } from '../repositories/ticket-type.repository';
import { AppError } from '../middleware/error.middleware';
import { EventStatus } from '@prisma/client';

export interface CreateEventInput {
  title: string;
  description?: string;
  location: string;
  startDatetime: string;
  endDatetime: string;
  ticketTypes: TicketTypeInput[];
}

const VALID_TRANSITIONS: Record<EventStatus, EventStatus[]> = {
  draft: ['published', 'cancelled'],
  published: ['cancelled'],
  cancelled: [],
};

export const EventService = {
  async createEvent(organizerId: string, input: CreateEventInput) {
    const startDt = new Date(input.startDatetime);
    const endDt = new Date(input.endDatetime);
    if (endDt <= startDt) {
      throw new AppError(400, 'VALIDATION_ERROR', 'endDatetime must be after startDatetime');
    }

    return prisma.$transaction(async (tx) => {
      const event = await tx.event.create({
        data: {
          organizerId,
          title: input.title,
          description: input.description,
          location: input.location,
          startDatetime: startDt,
          endDatetime: endDt,
        },
      });

      const ticketTypes = await Promise.all(
        input.ticketTypes.map((tt) =>
          tx.ticketType.create({
            data: {
              eventId: event.id,
              name: tt.name,
              price: tt.price,
              maxCapacity: tt.maxCapacity,
            },
          }),
        ),
      );

      return { ...event, ticketTypes };
    });
  },

  async updateEvent(
    eventId: string,
    organizerId: string,
    input: Partial<CreateEventInput>,
  ) {
    const event = await EventRepository.findById(eventId);
    if (!event) throw new AppError(404, 'EVENT_NOT_FOUND', 'Event not found');
    if (event.organizerId !== organizerId) {
      throw new AppError(403, 'FORBIDDEN', 'You do not own this event');
    }

    const now = new Date();
    if (event.startDatetime <= now) {
      throw new AppError(422, 'EVENT_ALREADY_STARTED', 'Cannot edit an event that has already started');
    }

    const updateData: Record<string, unknown> = {};
    if (input.title !== undefined) updateData['title'] = input.title;
    if (input.description !== undefined) updateData['description'] = input.description;
    if (input.location !== undefined) updateData['location'] = input.location;
    if (input.startDatetime !== undefined) updateData['startDatetime'] = new Date(input.startDatetime);
    if (input.endDatetime !== undefined) updateData['endDatetime'] = new Date(input.endDatetime);

    return prisma.$transaction(async (tx) => {
      const updated = await tx.event.update({ where: { id: eventId }, data: updateData });

      if (input.ticketTypes) {
        await tx.ticketType.deleteMany({ where: { eventId } });
        const ticketTypes = await Promise.all(
          input.ticketTypes.map((tt) =>
            tx.ticketType.create({
              data: { eventId, name: tt.name, price: tt.price, maxCapacity: tt.maxCapacity },
            }),
          ),
        );
        return { ...updated, ticketTypes };
      }

      const ticketTypes = await tx.ticketType.findMany({ where: { eventId } });
      return { ...updated, ticketTypes };
    });
  },

  async changeStatus(eventId: string, organizerId: string, newStatus: EventStatus) {
    const event = await EventRepository.findById(eventId);
    if (!event) throw new AppError(404, 'EVENT_NOT_FOUND', 'Event not found');
    if (event.organizerId !== organizerId) {
      throw new AppError(403, 'FORBIDDEN', 'You do not own this event');
    }

    const allowed = VALID_TRANSITIONS[event.status];
    if (!allowed.includes(newStatus)) {
      throw new AppError(
        422,
        'INVALID_STATUS_TRANSITION',
        `Cannot transition from ${event.status} to ${newStatus}`,
      );
    }

    return EventRepository.update(eventId, { status: newStatus });
  },

  async getPublishedEvent(eventId: string) {
    const event = await EventRepository.findById(eventId);
    if (!event || event.status !== 'published') {
      throw new AppError(404, 'EVENT_NOT_FOUND', 'Event not found');
    }
    return event;
  },
};
