import { hashPassword } from '../../helpers/bcrypt';
import type { PrismaClient, Role, User, UserRole } from '@prisma/client';

type CreateUsersProps = {
  prisma: PrismaClient;
  roles: Role[];
  length: number;
  password: string;
};

const userData = async ({
  firstName,
  lastName,
  password,
}: {
  firstName: string;
  lastName: string;
  password: string;
}) => {
  return {
    email: `${firstName}.${lastName}@example.com`.toLowerCase(),
    firstName,
    lastName,
    password,
    isActive: true,
  };
};

const createUsers = async ({ prisma, roles, length, password }: CreateUsersProps) => {
  const hashedPassword = await hashPassword(password);
  const createdUsers: User[] = [];
  const createdUserRoles: UserRole[] = [];

  const adminUserData = await userData({
    firstName: 'Admin',
    lastName: 'User',
    password: hashedPassword,
  });

  const admin = await prisma.user.upsert({
    where: { email: adminUserData.email },
    update: {},
    create: {
      ...adminUserData,
      password: hashedPassword,
    },
  });

  createdUsers.push(admin);

  const adminRole = roles.find((r) => r.name === 'ADMIN');
  if (adminRole) {
    const userRole = await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: admin.id,
          roleId: adminRole.id,
        },
      },
      update: {},
      create: {
        userId: admin.id,
        roleId: adminRole.id,
      },
    });

    createdUserRoles.push(userRole);
  }

  const userRole = roles.find((r) => r.name === 'USER');
  for (let i = 1; i <= length; i++) {
    const newUserData = await userData({
      firstName: 'Test',
      lastName: `User ${i}`,
      password: hashedPassword,
    });
    const user = await prisma.user.upsert({
      where: { email: newUserData.email },
      update: {},
      create: newUserData,
    });

    createdUsers.push(user);

    if (userRole) {
      const newUserRole = await prisma.userRole.upsert({
        where: {
          userId_roleId: {
            userId: user.id,
            roleId: userRole.id,
          },
        },
        update: {},
        create: {
          userId: user.id,
          roleId: userRole.id,
        },
      });

      createdUserRoles.push(newUserRole);
    }
  }

  console.log(`Created (${createdUsers.length}) users`);
  console.log(`Created (${createdUserRoles.length}) userRoles`);

  return createdUsers;
};

export default createUsers;
