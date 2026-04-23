import bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository';
import { OrganizerRepository } from '../repositories/organizer.repository';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.util';
import { AppError } from '../middleware/error.middleware';

const BCRYPT_ROUNDS = 12;

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const AuthService = {
  async register(input: RegisterInput) {
    const existing = await UserRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError(409, 'EMAIL_CONFLICT', 'Email already registered');
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    const user = await UserRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    const accessToken = signAccessToken(user.id, 'attendee');
    const refreshToken = signRefreshToken(user.id, 'attendee');

    return {
      user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
      accessToken,
      refreshToken,
    };
  },

  async login(email: string, password: string) {
    // Try user first
    const user = await UserRepository.findByEmail(email);
    if (user) {
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid credentials');

      const accessToken = signAccessToken(user.id, 'attendee');
      const refreshToken = signRefreshToken(user.id, 'attendee');

      return {
        accessToken,
        refreshToken,
        user: { id: user.id, name: user.name, role: 'attendee' },
      };
    }

    // Try organizer
    const organizer = await OrganizerRepository.findByEmail(email);
    if (organizer) {
      const valid = await bcrypt.compare(password, organizer.passwordHash);
      if (!valid) throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid credentials');

      const accessToken = signAccessToken(organizer.id, organizer.role);
      const refreshToken = signRefreshToken(organizer.id, organizer.role);

      return {
        accessToken,
        refreshToken,
        user: { id: organizer.id, name: organizer.name, role: organizer.role },
      };
    }

    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid credentials');
  },

  async refreshToken(token: string): Promise<{ accessToken: string }> {
    try {
      const payload = verifyRefreshToken(token);
      const newAccessToken = signAccessToken(payload.sub, payload.role);
      return { accessToken: newAccessToken };
    } catch {
      throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token is invalid or expired');
    }
  },

  async logout(_refreshToken: string): Promise<void> {
    // In a stateless JWT setup, logout is handled client-side by discarding the token.
    // For server-side invalidation, implement a token blocklist (redis/db) in a future iteration.
  },
};
