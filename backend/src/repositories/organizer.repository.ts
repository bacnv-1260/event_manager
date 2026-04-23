import prisma from '../lib/prisma';
import { Organizer } from '@prisma/client';

export const OrganizerRepository = {
  async findByEmail(email: string): Promise<Organizer | null> {
    return prisma.organizer.findUnique({ where: { email } });
  },

  async findById(id: string): Promise<Organizer | null> {
    return prisma.organizer.findUnique({ where: { id } });
  },
};
