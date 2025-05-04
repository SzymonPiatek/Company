import type { PrismaClient, Resource } from '@prisma/client';
import { resourceTypesData } from './resourceType';

type CreateResourcesProps = {
  prisma: PrismaClient;
  types?: { name: string; code: string }[];
  lengthPerType?: number;
};

const createResources = async ({
  prisma,
  lengthPerType = 5,
  types = resourceTypesData,
}: CreateResourcesProps): Promise<Resource[]> => {
  const extendedResourceTypes = await Promise.all(
    types.map(async (type) => {
      const resourceType = await prisma.resourceType.findUnique({
        where: { code: type.code },
      });

      return {
        ...type,
        typeId: resourceType?.id ?? null,
        baseCode: resourceType?.code ?? null,
      };
    }),
  );

  const filteredTypes = extendedResourceTypes.filter(
    (t): t is { name: string; code: string; baseCode: string; typeId: string } =>
      typeof t.typeId === 'string' && typeof t.baseCode === 'string',
  );

  const allResources: Resource[] = [];

  for (const type of filteredTypes) {
    const existingCount = await prisma.resource.count({
      where: { typeId: type.typeId },
    });

    const resources = await Promise.all(
      Array.from({ length: lengthPerType }, async (_, i) => {
        const paddedCount = String(existingCount + i + 1).padStart(6, '0');
        const code = `${type.baseCode}-${paddedCount}`;

        return prisma.resource.upsert({
          where: { code },
          update: {},
          create: {
            name: `${type.name} ${i + 1}`,
            code,
            typeId: type.typeId,
          },
        });
      }),
    );

    allResources.push(...resources);
  }

  console.log(`Created (${allResources.length}) resources`);
  return allResources;
};

export default createResources;
