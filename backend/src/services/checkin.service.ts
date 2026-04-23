import prisma from '../lib/prisma';
import { verifyQrToken } from '../utils/qr-token.util';
import { CheckInRepository } from '../repositories/checkin.repository';
import { RegistrationRepository } from '../repositories/registration.repository';
import { AppError } from '../middleware/error.middleware';

export const CheckInService = {
  async scan(qrToken: string, eventId: string, operatorId: string) {
    const decoded = verifyQrToken(qrToken);

    if (!decoded) {
      // Log invalid scan
      await CheckInRepository.createLog({
        registrationId: null,
        rawToken: qrToken,
        operatorId,
        eventId,
        result: 'invalid',
      });
      return { result: 'invalid' };
    }

    // Verify the token belongs to this event
    if (decoded.eventId !== eventId) {
      await CheckInRepository.createLog({
        registrationId: null,
        rawToken: qrToken,
        operatorId,
        eventId,
        result: 'invalid',
      });
      return { result: 'invalid' };
    }

    const registration = await RegistrationRepository.findByQrToken(qrToken);

    if (!registration) {
      await CheckInRepository.createLog({
        registrationId: null,
        rawToken: qrToken,
        operatorId,
        eventId,
        result: 'invalid',
      });
      return { result: 'invalid' };
    }

    if (registration.status === 'used') {
      // Log already_used and return first scan time
      await CheckInRepository.createLog({
        registrationId: registration.id,
        rawToken: qrToken,
        operatorId,
        eventId,
        result: 'already_used',
      });

      const firstLog = await prisma.checkInLog.findFirst({
        where: { registrationId: registration.id, result: 'valid' },
        orderBy: { scannedAt: 'asc' },
      });

      return { result: 'already_used', firstScannedAt: firstLog?.scannedAt ?? null };
    }

    // Atomically mark as used and log
    return prisma.$transaction(async (tx) => {
      await tx.registration.update({
        where: { id: registration.id },
        data: { status: 'used' },
      });

      await tx.checkInLog.create({
        data: {
          registrationId: registration.id,
          rawToken: qrToken,
          operatorId,
          eventId,
          result: 'valid',
        },
      });

      return {
        result: 'valid',
        attendee: {
          name: registration.user.name,
          ticketTypeName: registration.ticketType.name,
          registrationId: registration.id,
        },
      };
    });
  },

  async manualCheckIn(registrationId: string, operatorId: string, eventId: string) {
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        user: { select: { name: true } },
        ticketType: { select: { name: true, eventId: true } },
      },
    });

    if (!registration) {
      throw new AppError(404, 'REGISTRATION_NOT_FOUND', 'Registration not found');
    }

    if (registration.ticketType.eventId !== eventId) {
      throw new AppError(403, 'FORBIDDEN', 'Registration does not belong to this event');
    }

    if (registration.status === 'used') {
      throw new AppError(409, 'ALREADY_CHECKED_IN', 'Attendee has already been checked in');
    }

    return prisma.$transaction(async (tx) => {
      await tx.registration.update({
        where: { id: registrationId },
        data: { status: 'used' },
      });

      await tx.checkInLog.create({
        data: {
          registrationId,
          rawToken: 'MANUAL',
          operatorId,
          eventId,
          result: 'valid',
        },
      });

      return { success: true, attendeeName: registration.user.name };
    });
  },
};
