import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { verifyAccessTokenMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post(
  '/register',
  validate([
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
  ]),
  AuthController.register,
);

router.post(
  '/login',
  validate([
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  AuthController.login,
);

router.post(
  '/refresh',
  validate([body('refreshToken').notEmpty().withMessage('Refresh token is required')]),
  AuthController.refresh,
);

router.post('/logout', verifyAccessTokenMiddleware, AuthController.logout);

export default router;
