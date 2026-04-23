import { Router } from 'express';
import { body } from 'express-validator';
import { AdminEventsController } from '../../controllers/admin/events.controller';
import { validate } from '../../middleware/validate.middleware';
import { verifyAccessTokenMiddleware, requireRole } from '../../middleware/auth.middleware';

const router = Router();

router.use(verifyAccessTokenMiddleware);

const eventValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('startDatetime').isISO8601().withMessage('Valid startDatetime is required'),
  body('endDatetime').isISO8601().withMessage('Valid endDatetime is required'),
  body('ticketTypes').isArray({ min: 1 }).withMessage('At least one ticket type is required'),
  body('ticketTypes.*.name').trim().notEmpty().withMessage('Ticket type name is required'),
  body('ticketTypes.*.price').isFloat({ min: 0 }).withMessage('Price must be >= 0'),
  body('ticketTypes.*.maxCapacity').isInt({ min: 1 }).withMessage('Max capacity must be >= 1'),
];

router.get('/', requireRole('organizer'), AdminEventsController.list);

router.post(
  '/',
  requireRole('organizer'),
  validate(eventValidation),
  AdminEventsController.create,
);

router.put(
  '/:eventId',
  requireRole('organizer'),
  AdminEventsController.update,
);

router.patch(
  '/:eventId/status',
  requireRole('organizer'),
  validate([body('status').isIn(['published', 'cancelled']).withMessage('Invalid status')]),
  AdminEventsController.changeStatus,
);

export default router;
