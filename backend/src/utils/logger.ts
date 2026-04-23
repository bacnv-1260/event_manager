import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Redact sensitive PII fields from log metadata
function redactPII(obj: Record<string, unknown>): Record<string, unknown> {
  const sensitiveFields = ['email', 'passwordHash', 'password', 'qrToken', 'refreshToken'];
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (sensitiveFields.includes(key)) {
      result[key] = '[REDACTED]';
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = redactPII(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}

const logFormat = printf(({ level, message, timestamp: ts, ...meta }) => {
  const redacted = redactPII(meta as Record<string, unknown>);
  const metaStr = Object.keys(redacted).length ? ` ${JSON.stringify(redacted)}` : '';
  return `${ts} [${level}]: ${message}${metaStr}`;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(errors({ stack: true }), timestamp(), logFormat),
  transports: [
    new winston.transports.Console({
      format:
        process.env.NODE_ENV === 'development'
          ? combine(colorize(), timestamp(), logFormat)
          : combine(timestamp(), logFormat),
    }),
  ],
});

export default logger;
