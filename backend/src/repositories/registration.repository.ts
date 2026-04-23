import prisma from '../lib/prisma';
import { Registration } from '@prisma/client';

export const RegistrationRepository = {
  async create(data: {
    userId: string;
    ticketTypeId: string;
    qrToken: string;
  }): Promise<Registration> {
    return prisma.registration.create({ data });
  },

  async findByUserId(userId: string) {
    return prisma.registration.findMany({
      where: { userId },
      include: {
        ticketType: {
          include: { event: true },
        },
      },
      orderBy: { registeredAt: 'desc' },
    });
  },

  async findByQrToken(qrToken: string) {
    return prisma.registration.findUnique({
      where: { qrToken },
      include: {
        user: { select: { name: true, email: true } },
        ticketType: { include: { event: true } },
      },
    });
  },

  async findDuplicate(userId: string, ticketTypeId: string): Promise<Registration | null> {
    return prisma.registration.findUnique({
      where: { userId_ticketTypeId: { userId, ticketTypeId } },
    });
  },

  async markAsUsed(id: string): Promise<Registration> {
    return prisma.registration.update({ where: { id }, data: { status: 'used' } });
  },
};
