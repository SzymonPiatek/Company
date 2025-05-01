import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../libs/helpers/bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding data...');

  // USERS
  console.log('Creating users...');
  const hashedPassword = await hashPassword('TestPass123!');

  await prisma.user.createMany({
    data: Array.from({ length: 5 }, (_, i) => ({
      email: `user${i + 1}@example.com`,
      firstName: `User${i + 1}`,
      lastName: `Last${i + 1}`,
      password: hashedPassword,
      isActive: true,
    })),
  });

  // RESOURCE TYPES
  console.log(`Creating resource types...`);
  await prisma.resourceType.createMany({
    data: [
      { name: 'Biurko', code: 'DESK' },
      { name: 'Fotel', code: 'CHAIR' },
    ],
    skipDuplicates: true,
  });

  const deskTypeId = (await prisma.resourceType.findUnique({ where: { code: 'DESK' } }))!.id;
  const chairTypeId = (await prisma.resourceType.findUnique({ where: { code: 'CHAIR' } }))!.id;

  // RESOURCES
  console.log('Creating resources...');
  const desks = await Promise.all(
    Array.from({ length: 5 }, async (_, i) =>
      prisma.resource.create({
        data: {
          name: `Biurko ${i + 1}`,
          code: `DESK-${i + 1}`,
          typeId: deskTypeId,
        },
      }),
    ),
  );

  const chairs = await Promise.all(
    Array.from({ length: 5 }, async (_, i) =>
      prisma.resource.create({
        data: {
          name: `Fotel ${i + 1}`,
          code: `CHAIR-${i + 1}`,
          typeId: chairTypeId,
        },
      }),
    ),
  );

  // RESOURCE LOCATIONS
  console.log('Creating resource locations');
  await prisma.resourceLocation.createMany({
    data: [{ name: 'Pokój 1' }, { name: 'Pokój 2' }],
    skipDuplicates: true,
  });

  const room1Id = (await prisma.resourceLocation.findUnique({ where: { name: 'Pokój 1' } }))!.id;
  const room2Id = (await prisma.resourceLocation.findUnique({ where: { name: 'Pokój 2' } }))!.id;

  // ASSIGNED RESOURCES & RESOURCE LOCATION HISTORIES
  const allResources = [...desks, ...chairs];

  await Promise.all(
    allResources.map(async (resource, idx) => {
      const locationId = idx < 5 ? room1Id : room2Id;

      await prisma.assignedResource.create({
        data: {
          resourceId: resource.id,
          locationId,
        },
      });

      await prisma.resourceLocationHistory.create({
        data: {
          resourceId: resource.id,
          toLocationId: locationId,
        },
      });
    }),
  );

  console.log('Seeding data completed!');
}

main()
  .catch((e) => {
    console.error('eed failed', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
