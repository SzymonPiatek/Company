import type { PrismaClient } from "@prisma/client";

type CleaningDataProps = {
  prisma: PrismaClient;
  models: string[];
};

const cleaningData = async ({ prisma, models }: CleaningDataProps) => {
  console.log("Cleaning database...");

  const deleteOperations = models.map((model) => {
    const modelFn = (prisma as any)[model];
    if (!modelFn || typeof modelFn.deleteMany !== "function") {
      throw new Error(
        `Model "${model}" is not valid or does not support deleteMany.`,
      );
    }
    return modelFn.deleteMany();
  });

  await prisma.$transaction(deleteOperations);

  console.log("...database cleaned");
};

export default cleaningData;
