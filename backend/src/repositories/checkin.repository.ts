import prisma from '../lib/prisma';
import { CheckInResult } from '@prisma/client';

export const CheckInRepository = {
  async createLog(data: {
    registrationId: string | null;
    rawToken: string;
    operatorId: string;
    eventId: string;
    result: CheckInResult;
  }) {
    return prisma.checkInLog.create({ data });
  },

  async markRegistrationUsed(registrationId: string) {
    return prisma.registration.update({
      where: { id: registrationId },
      data: { status: 'used' },
    });
  },
};
