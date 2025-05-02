import { PrismaClient } from '@prisma/client';
import createUsers from '../libs/seed/user-service/users';
import createResourceTypes from '../libs/seed/resource-service/resourceType';
import createResources from '../libs/seed/resource-service/resources';
import createResourceLocations from '../libs/seed/warehouse-service/resourceLocations';
import cleaningData from '../libs/seed/cleaningData';
import createAssignedResourcesAndResourceLocationHistories from '../libs/seed/warehouse-service/assignedResourcesAndResourceLocationHistories';

const prisma = new PrismaClient();

async function main() {
  // CLEANING DATABASE
  await cleaningData({
    prisma,
    models: [
      'resourceLocationHistory',
      'assignedResource',
      'resource',
      'resourceType',
      'resourceLocation',
      'user',
    ],
  });

  // START SEED
  console.log('Start seeding data...');

  // USERS
  await createUsers({ prisma, length: 5, password: 'TestPass123!' });

  // RESOURCE TYPES
  await createResourceTypes({ prisma });

  // RESOURCES
  const allResources = await createResources({ prisma, lengthPerType: 5 });

  // RESOURCE LOCATIONS
  const allLocations = await createResourceLocations({ prisma });

  // ASSIGNED RESOURCES & RESOURCE LOCATION HISTORIES
  await createAssignedResourcesAndResourceLocationHistories({
    prisma,
    resources: allResources,
    locations: allLocations,
  });

  console.log('...data seeded!');
}

main()
  .catch((e) => {
    console.error('eed failed', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
