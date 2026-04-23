import { Router } from 'express';
import { body } from 'express-validator';
import { CheckInController } from '../../controllers/admin/checkin.controller';
import { validate } from '../../middleware/validate.middleware';
import { verifyAccessTokenMiddleware, requireRole } from '../../middleware/auth.middleware';

const router = Router();

router.use(verifyAccessTokenMiddleware);
router.use(requireRole('organizer', 'checkin_operator'));

router.post(
  '/scan',
  validate([
    body('qrToken').notEmpty().withMessage('qrToken is required'),
    body('eventId').isUUID().withMessage('Valid eventId is required'),
  ]),
  CheckInController.scan,
);

router.patch(
  '/registrations/:id/checkin',
  validate([body('eventId').isUUID().withMessage('Valid eventId is required')]),
  CheckInController.manualCheckIn,
);

export default router;
