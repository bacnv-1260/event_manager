import { Router } from 'express';
import { EventsController } from '../controllers/events.controller';

const router = Router();

router.get('/', EventsController.list);
router.get('/:eventId', EventsController.getById);

export default router;
