import type { PrismaClient, ResourceLocation } from '@prisma/client';

type CreateResourceLocationsProps = {
  prisma: PrismaClient;
  locations?: { name: string; description?: string }[];
};

export const resourceLocations = [
  { name: 'Pokój 1', description: 'Pokój pracowniczy' },
  { name: 'Pokój 2', description: 'Pokój pracowniczy' },
  { name: 'Pokój 3', description: 'Pokój pracowniczy' },
  { name: 'Magazyn', description: 'Pomieszczenie magazynowe' },
];

const createResourceLocations = async ({
  prisma,
  locations = resourceLocations,
}: CreateResourceLocationsProps) => {
  const createdLocations: ResourceLocation[] = [];

  for (const location of locations) {
    const result = await prisma.resourceLocation.upsert({
      where: { name: location.name },
      update: {},
      create: {
        name: location.name,
        description: location.description,
      },
    });

    createdLocations.push(result);
  }

  console.log(`Created (${createdLocations.length}) resourceLocations`);

  return createdLocations;
};

export default createResourceLocations;
