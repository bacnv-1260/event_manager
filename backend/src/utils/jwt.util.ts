import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const ACCESS_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface JwtPayload {
  sub: string;
  role: string;
  type: 'access' | 'refresh';
  jti?: string;
}

export function signAccessToken(userId: string, role: string): string {
  return jwt.sign(
    { sub: userId, role, type: 'access' } as JwtPayload,
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES_IN } as jwt.SignOptions,
  );
}

export function signRefreshToken(userId: string, role: string): string {
  return jwt.sign(
    { sub: userId, role, type: 'refresh', jti: uuidv4() } as JwtPayload,
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES_IN } as jwt.SignOptions,
  );
}

export function verifyAccessToken(token: string): JwtPayload {
  const payload = jwt.verify(token, ACCESS_SECRET) as JwtPayload;
  if (payload.type !== 'access') {
    throw new Error('Invalid token type');
  }
  return payload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  const payload = jwt.verify(token, REFRESH_SECRET) as JwtPayload;
  if (payload.type !== 'refresh') {
    throw new Error('Invalid token type');
  }
  return payload;
}
