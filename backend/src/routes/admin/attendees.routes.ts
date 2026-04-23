import { Router } from 'express';
import { AttendeesController } from '../../controllers/admin/attendees.controller';
import { verifyAccessTokenMiddleware, requireRole } from '../../middleware/auth.middleware';

const router = Router({ mergeParams: true });

router.use(verifyAccessTokenMiddleware);
router.use(requireRole('organizer', 'checkin_operator'));

router.get('/', AttendeesController.list);

export default router;
