import type { Permission, PrismaClient, Role, RolePermission } from '@prisma/client';

type CreatePermissionsProps = {
  prisma: PrismaClient;
  permissions?: {
    name: string;
    description?: string;
    action: string;
    subject: string;
    roles: string[];
  }[];
  roles?: { name: string }[];
};

const rolesData = [
  {
    name: 'ADMIN',
  },
  {
    name: 'USER',
  },
];

const permissionsData = [
  // USERS
  {
    name: 'Can create user',
    action: 'CREATE',
    subject: 'USER',
    roles: ['ADMIN'],
  },
  {
    name: 'Can view all users',
    action: 'VIEW',
    subject: 'USER',
    roles: ['ADMIN'],
  },
  {
    name: 'Can update user',
    action: 'UPDATE',
    subject: 'USER',
    roles: ['ADMIN', 'USER'],
  },
  // RESOURCES
  {
    name: 'Can create resource',
    action: 'CREATE',
    subject: 'RESOURCE',
    roles: ['ADMIN'],
  },
  {
    name: 'Can view all resources',
    action: 'VIEW',
    subject: 'RESOURCE',
    roles: ['ADMIN', 'USER'],
  },
  {
    name: 'Can update resource',
    action: 'UPDATE',
    subject: 'RESOURCE',
    roles: ['ADMIN'],
  },
  // RESOURCE TYPES
  {
    name: 'Can create resource type',
    action: 'CREATE',
    subject: 'RESOURCE_TYPE',
    roles: ['ADMIN'],
  },
  {
    name: 'Can view all resource types',
    action: 'VIEW',
    subject: 'RESOURCE_TYPE',
    roles: ['ADMIN', 'USER'],
  },
  {
    name: 'Can update resource type',
    action: 'UPDATE',
    subject: 'RESOURCE_TYPE',
    roles: ['ADMIN'],
  },
];

const createPermissionsRolesRolePermissions = async ({
  prisma,
  permissions = permissionsData,
  roles = rolesData,
}: CreatePermissionsProps) => {
  const createdPermissions: Permission[] = [];
  const createdRoles: Role[] = [];
  const createdRolePermissions: RolePermission[] = [];

  for (const role of roles) {
    const created = await prisma.role.upsert({
      where: { name: role.name.toUpperCase() },
      update: {},
      create: { name: role.name.toUpperCase() },
    });

    createdRoles.push(created);
  }

  console.log(`Created (${createdRoles.length}) roles`);

  for (const item of permissions) {
    const created = await prisma.permission.upsert({
      where: { name: item.name },
      update: {},
      create: {
        name: item.name,
        action: item.action.toUpperCase(),
        subject: item.subject.toUpperCase(),
      },
    });

    createdPermissions.push(created);

    for (const roleName of item.roles) {
      const role = createdRoles.find((r) => r.name === roleName);
      if (!role) {
        console.warn(`⚠️ Role "${roleName}" not found for permission "${item.name}"`);
        continue;
      }

      const createdRP = await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: created.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: created.id,
        },
      });

      createdRolePermissions.push(createdRP);
    }
  }

  console.log(`Created (${createdPermissions.length}) permissions`);
  console.log(`Created (${createdRolePermissions.length}) rolePermissions`);

  return {
    roles: createdRoles,
    rolePermissions: createdRolePermissions,
    permissions: createdPermissions,
  };
};

export default createPermissionsRolesRolePermissions;
