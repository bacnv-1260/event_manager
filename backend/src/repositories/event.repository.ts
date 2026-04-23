import prisma from '../lib/prisma';
import { AdminEvent, EventStatus, Prisma } from '@prisma/client';

export const EventRepository = {
  async create(
    data: Prisma.EventCreateInput,
  ): Promise<AdminEvent> {
    return prisma.event.create({ data, include: { ticketTypes: true } });
  },

  async findById(id: string) {
    return prisma.event.findUnique({
      where: { id },
      include: { ticketTypes: true, organizer: { select: { id: true, name: true } } },
    });
  },

  async update(id: string, data: Prisma.EventUpdateInput) {
    return prisma.event.update({
      where: { id },
      data,
      include: { ticketTypes: true },
    });
  },

  async listByOrganizer(organizerId: string) {
    return prisma.event.findMany({
      where: { organizerId },
      include: {
        ticketTypes: true,
        _count: { select: { checkInLogs: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async listPublishedUpcoming(page: number, limit: number) {
    const now = new Date();
    const [data, total] = await Promise.all([
      prisma.event.findMany({
        where: { status: EventStatus.published, startDatetime: { gt: now } },
        include: { ticketTypes: true },
        orderBy: { startDatetime: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.event.count({
        where: { status: EventStatus.published, startDatetime: { gt: now } },
      }),
    ]);
    return { data, total };
  },

  async listAttendees(eventId: string, page: number, limit: number) {
    const [data, total] = await Promise.all([
      prisma.registration.findMany({
        where: { ticketType: { eventId } },
        include: {
          user: { select: { name: true, email: true } },
          ticketType: { select: { name: true } },
          checkInLogs: {
            where: { result: 'valid' },
            orderBy: { scannedAt: 'asc' },
            take: 1,
          },
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.registration.count({ where: { ticketType: { eventId } } }),
    ]);
    return { data, total };
  },
};
