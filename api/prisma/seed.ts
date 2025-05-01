import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../libs/helpers/bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding data...");

  // USERS
  console.log("Creating users...");
  const hashedPassword = await hashPassword("TestPass123!");

  await Promise.all(
    Array.from({ length: 5 }, (_, i) =>
      prisma.user.upsert({
        where: { email: `user${i + 1}@example.com` },
        update: {},
        create: {
          email: `user${i + 1}@example.com`,
          firstName: `User${i + 1}`,
          lastName: `Last${i + 1}`,
          password: hashedPassword,
          isActive: true,
        },
      }),
    ),
  );

  // RESOURCE TYPES
  console.log(`Creating resource types...`);
  await Promise.all([
    prisma.resourceType.upsert({
      where: { code: "DESK" },
      update: {},
      create: { name: "Biurko", code: "DESK" },
    }),
    prisma.resourceType.upsert({
      where: { code: "CHAIR" },
      update: {},
      create: { name: "Fotel", code: "CHAIR" },
    }),
  ]);

  const deskTypeId = (await prisma.resourceType.findUnique({
    where: { code: "DESK" },
  }))!.id;
  const chairTypeId = (await prisma.resourceType.findUnique({
    where: { code: "CHAIR" },
  }))!.id;

  // RESOURCES
  console.log("Creating resources...");
  const desks = await Promise.all(
    Array.from({ length: 5 }, (_, i) =>
      prisma.resource.upsert({
        where: { code: `DESK-${i + 1}` },
        update: {},
        create: {
          name: `Biurko ${i + 1}`,
          code: `DESK-${i + 1}`,
          typeId: deskTypeId,
        },
      }),
    ),
  );

  const chairs = await Promise.all(
    Array.from({ length: 5 }, (_, i) =>
      prisma.resource.upsert({
        where: { code: `CHAIR-${i + 1}` },
        update: {},
        create: {
          name: `Fotel ${i + 1}`,
          code: `CHAIR-${i + 1}`,
          typeId: chairTypeId,
        },
      }),
    ),
  );

  // RESOURCE LOCATIONS
  console.log("Creating resource locations");
  await Promise.all([
    prisma.resourceLocation.upsert({
      where: { name: "Pokój 1" },
      update: {},
      create: { name: "Pokój 1" },
    }),
    prisma.resourceLocation.upsert({
      where: { name: "Pokój 2" },
      update: {},
      create: { name: "Pokój 2" },
    }),
  ]);

  const room1Id = (await prisma.resourceLocation.findUnique({
    where: { name: "Pokój 1" },
  }))!.id;
  const room2Id = (await prisma.resourceLocation.findUnique({
    where: { name: "Pokój 2" },
  }))!.id;

  // ASSIGNED RESOURCES & RESOURCE LOCATION HISTORIES
  const allResources = [...desks, ...chairs];

  for (let i = 0; i < allResources.length; i++) {
    const resource = allResources[i];
    const locationId = i < 5 ? room1Id : room2Id;

    const alreadyAssigned = await prisma.assignedResource.findUnique({
      where: { resourceId: resource.id },
    });

    if (!alreadyAssigned) {
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
    }
  }

  console.log("Seeding data completed!");
}

main()
  .catch((e) => {
    console.error("eed failed", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
