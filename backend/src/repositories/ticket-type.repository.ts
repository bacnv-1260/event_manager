import prisma from '../lib/prisma';
import { TicketType, Prisma } from '@prisma/client';

export interface TicketTypeInput {
  name: string;
  price: number;
  maxCapacity: number;
}

export const TicketTypeRepository = {
  async createMany(
    eventId: string,
    ticketTypes: TicketTypeInput[],
  ): Promise<TicketType[]> {
    const created = await Promise.all(
      ticketTypes.map((tt) =>
        prisma.ticketType.create({
          data: { eventId, name: tt.name, price: tt.price, maxCapacity: tt.maxCapacity },
        }),
      ),
    );
    return created;
  },

  async findByEventId(eventId: string): Promise<TicketType[]> {
    return prisma.ticketType.findMany({ where: { eventId } });
  },

  async deleteByEventId(eventId: string): Promise<void> {
    await prisma.ticketType.deleteMany({ where: { eventId } });
  },

  async findById(id: string): Promise<TicketType | null> {
    return prisma.ticketType.findUnique({ where: { id } });
  },

  async updateById(id: string, data: Prisma.TicketTypeUpdateInput): Promise<TicketType> {
    return prisma.ticketType.update({ where: { id }, data });
  },
};
