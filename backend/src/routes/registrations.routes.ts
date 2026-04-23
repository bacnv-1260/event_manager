import { Router } from 'express';
import { body } from 'express-validator';
import { RegistrationsController } from '../controllers/registrations.controller';
import { validate } from '../middleware/validate.middleware';
import { verifyAccessTokenMiddleware, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(verifyAccessTokenMiddleware);

router.post(
  '/',
  requireRole('attendee'),
  validate([body('ticketTypeId').notEmpty().isUUID().withMessage('Valid ticketTypeId is required')]),
  RegistrationsController.register,
);

router.get('/me', requireRole('attendee'), RegistrationsController.listMine);

export default router;
