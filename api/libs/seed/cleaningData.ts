import type { PrismaClient, Prisma } from '@prisma/client';

type DelegateWithDeleteMany = {
  [K in keyof PrismaClient]: PrismaClient[K] extends {
    deleteMany: () => Prisma.PrismaPromise<unknown>;
  }
    ? K
    : never;
}[keyof PrismaClient];

type CleaningDataProps = {
  prisma: PrismaClient;
  models: DelegateWithDeleteMany[];
};

const cleaningData = async ({ prisma, models }: CleaningDataProps): Promise<void> => {
  console.log('Cleaning database...');

  const deleteOperations = models.map((model) => {
    const delegate = prisma[model];
    if (typeof delegate !== 'object' || delegate === null || !('deleteMany' in delegate)) {
      throw new Error(`Model "${model}" is not valid or does not support deleteMany.`);
    }

    return (delegate as { deleteMany: () => Prisma.PrismaPromise<unknown> }).deleteMany();
  });

  await prisma.$transaction(deleteOperations);

  console.log('...database cleaned');
};

export default cleaningData;
