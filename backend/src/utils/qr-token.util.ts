import crypto from 'crypto';

if (!process.env.QR_HMAC_SECRET) {
  throw new Error('QR_HMAC_SECRET environment variable is required');
}

const QR_SECRET = process.env.QR_HMAC_SECRET;

/**
 * Generate a QR token in the format:
 * base64url(eventId:registrationId).base64url(hmac-sha256)
 */
export function generateQrToken(eventId: string, registrationId: string): string {
  const payload = Buffer.from(`${eventId}:${registrationId}`).toString('base64url');
  const signature = crypto
    .createHmac('sha256', QR_SECRET)
    .update(payload)
    .digest('base64url');
  return `${payload}.${signature}`;
}

/**
 * Verify a QR token and return the decoded eventId and registrationId.
 * Returns null if the token is invalid or tampered.
 */
export function verifyQrToken(
  token: string,
): { eventId: string; registrationId: string } | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payload, signature] = parts;

  const expectedSignature = crypto
    .createHmac('sha256', QR_SECRET)
    .update(payload)
    .digest('base64url');

  // Constant-time comparison to prevent timing attacks
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null;
  }

  try {
    const decoded = Buffer.from(payload, 'base64url').toString('utf8');
    const colonIndex = decoded.indexOf(':');
    if (colonIndex === -1) return null;
    const eventId = decoded.substring(0, colonIndex);
    const registrationId = decoded.substring(colonIndex + 1);
    if (!eventId || !registrationId) return null;
    return { eventId, registrationId };
  } catch {
    return null;
  }
}
