import { Request, Response, NextFunction } from 'express';
import { CheckInService } from '../../services/checkin.service';

export const CheckInController = {
  async scan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const operatorId = req.user!.sub;
      const { qrToken, eventId } = req.body;
      const result = await CheckInService.scan(qrToken, eventId, operatorId);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  async manualCheckIn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const operatorId = req.user!.sub;
      const { id: registrationId } = req.params;
      const { eventId } = req.body;
      const result = await CheckInService.manualCheckIn(registrationId, operatorId, eventId);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },
};
