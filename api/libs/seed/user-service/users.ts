import { hashPassword } from "../../helpers/bcrypt";
import type { PrismaClient } from "@prisma/client";

type CreateUsersProps = {
  prisma: PrismaClient;
  length: number;
  password: string;
};

const createUsers = async ({ prisma, length, password }: CreateUsersProps) => {
  const hashedPassword = await hashPassword(password);

  const users = await Promise.all(
    Array.from({ length }, (_, i) =>
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

  console.log(`Created (${users.length}) users`);

  return users;
};

export default createUsers;
