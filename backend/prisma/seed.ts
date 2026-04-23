import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const BCRYPT_ROUNDS = 12;

  // Default organizer
  const organizerEmail = process.env.SEED_ORGANIZER_EMAIL || 'organizer@example.com';
  const organizerPassword = process.env.SEED_ORGANIZER_PASSWORD || 'Organizer@123';

  const existingOrganizer = await prisma.organizer.findUnique({
    where: { email: organizerEmail },
  });

  if (!existingOrganizer) {
    await prisma.organizer.create({
      data: {
        name: 'Default Organizer',
        email: organizerEmail,
        passwordHash: await bcrypt.hash(organizerPassword, BCRYPT_ROUNDS),
        role: 'organizer',
      },
    });
    console.log(`Created organizer: ${organizerEmail}`);
  } else {
    console.log(`Organizer already exists: ${organizerEmail}`);
  }

  // Default check-in operator
  const operatorEmail = process.env.SEED_OPERATOR_EMAIL || 'checkin@example.com';
  const operatorPassword = process.env.SEED_OPERATOR_PASSWORD || 'Operator@123';

  const existingOperator = await prisma.organizer.findUnique({
    where: { email: operatorEmail },
  });

  if (!existingOperator) {
    await prisma.organizer.create({
      data: {
        name: 'Default Check-in Operator',
        email: operatorEmail,
        passwordHash: await bcrypt.hash(operatorPassword, BCRYPT_ROUNDS),
        role: 'checkin_operator',
      },
    });
    console.log(`Created check-in operator: ${operatorEmail}`);
  } else {
    console.log(`Check-in operator already exists: ${operatorEmail}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
