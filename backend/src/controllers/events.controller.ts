import { Request, Response, NextFunction } from 'express';
import { EventRepository } from '../repositories/event.repository';
import { EventService } from '../services/event.service';

function formatEvent(event: {
  id: string;
  title: string;
  description: string | null;
  location: string;
  status: string;
  startDatetime: Date;
  endDatetime: Date;
  ticketTypes: Array<{
    id: string;
    name: string;
    price: unknown;
    maxCapacity: number;
    registeredCount: number;
  }>;
}) {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    location: event.location,
    status: event.status,
    startDatetime: event.startDatetime,
    endDatetime: event.endDatetime,
    ticketTypes: event.ticketTypes.map((tt) => ({
      id: tt.id,
      name: tt.name,
      price: Number(tt.price),
      maxCapacity: tt.maxCapacity,
      availableCapacity: tt.maxCapacity - tt.registeredCount,
      isSoldOut: tt.registeredCount >= tt.maxCapacity,
      status: tt.registeredCount >= tt.maxCapacity ? 'sold_out' : 'available',
    })),
  };
}

export const EventsController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Math.max(1, parseInt(req.query['page'] as string) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query['limit'] as string) || 20));

      const { data, total } = await EventRepository.listPublishedUpcoming(page, limit);
      res.status(200).json({
        data: data.map(formatEvent),
        pagination: { page, limit, total },
      });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const event = await EventService.getPublishedEvent(req.params['eventId']);
      res.status(200).json(formatEvent(event));
    } catch (err) {
      next(err);
    }
  },
};
