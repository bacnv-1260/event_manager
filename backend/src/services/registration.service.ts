import crypto from 'crypto';
import prisma from '../lib/prisma';
import { RegistrationRepository } from '../repositories/registration.repository';
import { generateQrToken } from '../utils/qr-token.util';
import { AppError } from '../middleware/error.middleware';

export const RegistrationService = {
  async register(userId: string, ticketTypeId: string) {
    // Check for duplicate registration (before locking)
    const duplicate = await RegistrationRepository.findDuplicate(userId, ticketTypeId);
    if (duplicate) {
      throw new AppError(409, 'ALREADY_REGISTERED', 'You are already registered for this ticket type');
    }

    return prisma.$transaction(async (tx) => {
      // Lock and check capacity atomically
      const ticketType = await tx.ticketType.findUnique({
        where: { id: ticketTypeId },
        include: { event: true },
      });

      if (!ticketType) {
        throw new AppError(404, 'TICKET_TYPE_NOT_FOUND', 'Ticket type not found');
      }

      if (ticketType.event.status !== 'published') {
        throw new AppError(404, 'EVENT_NOT_FOUND', 'Event is not available for registration');
      }

      if (ticketType.registeredCount >= ticketType.maxCapacity) {
        throw new AppError(422, 'TICKET_SOLD_OUT', 'No tickets remaining for this ticket type');
      }

      // Increment count atomically
      await tx.ticketType.update({
        where: { id: ticketTypeId },
        data: { registeredCount: { increment: 1 } },
      });

      // Create registration first to get the real DB-generated ID
      const placeholder = crypto.randomUUID();
      const registration = await tx.registration.create({
        data: { userId, ticketTypeId, qrToken: placeholder },
      });

      // Now generate QR token with the real registration ID
      const qrToken = generateQrToken(ticketType.eventId, registration.id);
      await tx.registration.update({
        where: { id: registration.id },
        data: { qrToken },
      });

      return {
        ...registration,
        qrToken,
        eventId: ticketType.eventId,
        eventTitle: ticketType.event.title,
        eventStartDatetime: ticketType.event.startDatetime,
      };
    });
  },

  async listByUser(userId: string) {
    const registrations = await RegistrationRepository.findByUserId(userId);
    return registrations.map((r) => ({
      id: r.id,
      ticketTypeId: r.ticketTypeId,
      ticketTypeName: r.ticketType.name,
      eventId: r.ticketType.eventId,
      eventTitle: r.ticketType.event.title,
      eventStartDatetime: r.ticketType.event.startDatetime,
      eventLocation: r.ticketType.event.location,
      qrToken: r.qrToken,
      status: r.status,
      registeredAt: r.registeredAt,
    }));
  },
};
