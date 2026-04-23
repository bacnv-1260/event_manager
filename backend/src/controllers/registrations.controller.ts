import { Request, Response, NextFunction } from 'express';
import { RegistrationService } from '../services/registration.service';

export const RegistrationsController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.sub;
      const { ticketTypeId } = req.body;
      const registration = await RegistrationService.register(userId, ticketTypeId);
      res.status(201).json({ data: registration });
    } catch (err) {
      next(err);
    }
  },

  async listMine(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.sub;
      const data = await RegistrationService.listByUser(userId);
      res.status(200).json({ data });
    } catch (err) {
      next(err);
    }
  },
};
