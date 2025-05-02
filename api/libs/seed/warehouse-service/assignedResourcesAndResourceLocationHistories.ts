import type {
  AssignedResource,
  PrismaClient,
  Resource,
  ResourceLocation,
  ResourceLocationHistory,
} from "@prisma/client";

type Props = {
  prisma: PrismaClient;
  resources: Resource[];
  locations: ResourceLocation[];
};

type Result = {
  assignedResources: AssignedResource[];
  locationHistories: ResourceLocationHistory[];
};

const createAssignedResourcesAndResourceLocationHistories = async ({
  prisma,
  resources,
  locations,
}: Props): Promise<Result> => {
  const assignedResources: AssignedResource[] = [];
  const locationHistories: ResourceLocationHistory[] = [];

  for (let i = 0; i < resources.length; i++) {
    const resource = resources[i];
    const location = locations[i % locations.length];

    const alreadyAssigned = await prisma.assignedResource.findUnique({
      where: { resourceId: resource.id },
    });

    if (!alreadyAssigned) {
      const assigned = await prisma.assignedResource.create({
        data: {
          resourceId: resource.id,
          locationId: location.id,
        },
      });

      const history = await prisma.resourceLocationHistory.create({
        data: {
          resourceId: resource.id,
          toLocationId: location.id,
        },
      });

      assignedResources.push(assigned);
      locationHistories.push(history);
    }
  }

  console.log(`Created (${assignedResources.length}) assignedResources`);
  console.log(
    `Created (${locationHistories.length}) resourceLocationHistories`,
  );

  return {
    assignedResources,
    locationHistories,
  };
};

export default createAssignedResourcesAndResourceLocationHistories;
