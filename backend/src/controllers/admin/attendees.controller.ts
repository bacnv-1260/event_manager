import { Request, Response, NextFunction } from 'express';
import { EventRepository } from '../../repositories/event.repository';

export const AttendeesController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { eventId } = req.params;
      const page = Math.max(1, parseInt(req.query['page'] as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query['limit'] as string) || 50));

      const { data, total } = await EventRepository.listAttendees(eventId, page, limit);

      const formatted = data.map((r) => ({
        registrationId: r.id,
        name: r.user.name,
        email: r.user.email,
        ticketTypeName: r.ticketType.name,
        status: r.status,
        checkedInAt: r.checkInLogs[0]?.scannedAt ?? null,
      }));

      res.status(200).json({ data: formatted, pagination: { page, limit, total } });
    } catch (err) {
      next(err);
    }
  },
};
