import type { PrismaClient, Resource } from "@prisma/client";
import { resourceTypesData } from "./resourceType";

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
      };
    }),
  );

  const filteredResourceTypes = extendedResourceTypes.filter(
    (t): t is { name: string; code: string; typeId: string } =>
      typeof t.typeId === "string" && t.typeId.length > 0,
  );

  const allResources: Resource[] = [];

  for (const type of filteredResourceTypes) {
    const resources = await Promise.all(
      Array.from({ length: lengthPerType }, (_, i) =>
        prisma.resource.upsert({
          where: { code: `${type.code}-${i + 1}` },
          update: {},
          create: {
            name: `${type.name} ${i + 1}`,
            code: `${type.code}-${i + 1}`,
            typeId: type.typeId,
          },
        }),
      ),
    );

    allResources.push(...resources);
  }

  console.log(`Created (${allResources.length}) resources`);

  return allResources;
};

export default createResources;
