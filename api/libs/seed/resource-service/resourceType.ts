import type { PrismaClient, ResourceType } from "@prisma/client";

type CreateResourceTypesProps = {
  prisma: PrismaClient;
  types?: { name: string; code: string }[];
};

export const resourceTypesData = [
  { name: "Biurko", code: "DESK" },
  { name: "Fotel", code: "CHAIR" },
  { name: "Monitor", code: "MONITOR" },
  { name: "Telewizor", code: "TV" },
  { name: "Komputer", code: "PC" },
  { name: "Laptop", code: "LAPTOP" },
  { name: "Smartfon", code: "MOBILE" },
];

const createResourceTypes = async ({
  prisma,
  types = resourceTypesData,
}: CreateResourceTypesProps) => {
  const createdTypes: ResourceType[] = [];

  for (const type of types) {
    const resourceType = await prisma.resourceType.upsert({
      where: { code: type.code },
      update: {},
      create: { name: type.name, code: type.code },
    });

    createdTypes.push(resourceType);
  }

  console.log(`Created (${createdTypes.length}) resourceTypes`);

  return createdTypes;
};

export default createResourceTypes;
