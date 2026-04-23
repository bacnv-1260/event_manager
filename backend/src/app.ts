import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes';
import eventsRoutes from './routes/events.routes';
import registrationsRoutes from './routes/registrations.routes';
import adminEventsRoutes from './routes/admin/events.routes';
import adminCheckInRoutes from './routes/admin/checkin.routes';
import adminAttendeesRoutes from './routes/admin/attendees.routes';
import { errorMiddleware } from './middleware/error.middleware';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Public routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/events', eventsRoutes);

// Authenticated routes
app.use('/api/v1/registrations', registrationsRoutes);

// Admin routes
app.use('/api/v1/admin/events', adminEventsRoutes);
app.use('/api/v1/admin/checkin', adminCheckInRoutes);
app.use('/api/v1/admin/events/:eventId/attendees', adminAttendeesRoutes);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Global error handler (must be last)
app.use(errorMiddleware);

export default app;
