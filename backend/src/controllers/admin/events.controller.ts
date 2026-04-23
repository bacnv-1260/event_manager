import { Request, Response, NextFunction } from 'express';
import { EventService } from '../../services/event.service';
import { EventRepository } from '../../repositories/event.repository';

export const AdminEventsController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const organizerId = req.user!.sub;
      const event = await EventService.createEvent(organizerId, req.body);
      res.status(201).json({ event });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { eventId } = req.params;
      const organizerId = req.user!.sub;
      const event = await EventService.updateEvent(eventId, organizerId, req.body);
      res.status(200).json({ event });
    } catch (err) {
      next(err);
    }
  },

  async changeStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { eventId } = req.params;
      const organizerId = req.user!.sub;
      const { status } = req.body;
      const event = await EventService.changeStatus(eventId, organizerId, status);
      res.status(200).json({ event });
    } catch (err) {
      next(err);
    }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const organizerId = req.user!.sub;
      const events = await EventRepository.listByOrganizer(organizerId);

      const data = events.map((e) => ({
        id: e.id,
        title: e.title,
        status: e.status,
        startDatetime: e.startDatetime,
        endDatetime: e.endDatetime,
        location: e.location,
        ticketTypes: e.ticketTypes,
      }));

      res.status(200).json({ data });
    } catch (err) {
      next(err);
    }
  },
};
