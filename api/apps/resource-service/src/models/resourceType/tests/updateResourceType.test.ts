import request from 'supertest';
import app from '../../../app';
import prisma from '../../../prismaClient';
import { createTestUser, mockAccessToken } from '@libs/tests/setup';

const baseUrl = (id: string) => `/api/resource/resourceTypes/${id}`;
const testEmail = `getuser-${Date.now()}@example.com`;
const testPassword = 'Test1234!';

describe('PATCH /api/resource/resourceTypes/:id', () => {
  const unique = Date.now();
  const typeName = `Type ${unique}`;
  const typeCode = `CODE-${unique}`;
  const duplicateName = `${typeName}-duplicate`;
  const duplicateCode = `${typeCode}-DUPLICATE`;
  let typeId: string;
  let testUserId: string;
  let accessToken: string;

  const patchRequest = async ({ id, body }: { id: string; body: object }) => {
    return await request(app)
      .patch(baseUrl(id))
      .set('Authorization', `Bearer ${accessToken}`)
      .send(body);
  };

  beforeAll(async () => {
    const user = await createTestUser(prisma, {
      email: testEmail,
      password: testPassword,
    });

    testUserId = user.id;
    accessToken = mockAccessToken(testUserId);

    const createdType = await prisma.resourceType.create({
      data: {
        name: typeName,
        code: typeCode,
        resources: {
          create: [
            { name: 'Res1', code: `${typeCode}-000001`, isActive: true },
            { name: 'Res2', code: `${typeCode}-000002`, isActive: false },
          ],
        },
      },
    });

    typeId = createdType.id;

    await prisma.resourceType.create({
      data: {
        name: duplicateName,
        code: duplicateCode,
      },
    });
  });

  afterAll(async () => {
    await prisma.resource.deleteMany({ where: { typeId } });
    await prisma.resourceType.deleteMany({
      where: { name: { contains: typeName } },
    });
    await prisma.user.delete({ where: { id: testUserId } });
  });

  it('should update a resource type and return 200', async () => {
    const updatedName = `Updated ${typeName}`;
    const updatedCode = `UPDATED-${unique}`;

    const res = await patchRequest({ id: typeId, body: { name: updatedName, code: updatedCode } });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: typeId,
      name: updatedName,
      code: updatedCode,
    });

    const updatedResources = await prisma.resource.findMany({
      where: { typeId },
    });
    for (const res of updatedResources) {
      expect(res.code.startsWith(updatedCode)).toBe(true);
    }
  });

  it('should return 404 if resource type not found', async () => {
    const res = await patchRequest({
      id: 'non-existent-id',
      body: { name: 'Whatever', code: 'WHATEVER-CODE' },
    });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'ResourceType not found' });
  });

  it('should return 409 if name is already taken', async () => {
    const res = await patchRequest({
      id: typeId,
      body: { name: duplicateName, code: `NEW-CODE-${unique}` },
    });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Resource name already exists');
  });

  it('should return 409 if code is already taken', async () => {
    const res = await patchRequest({
      id: typeId,
      body: { name: `Another Name ${unique}`, code: duplicateCode },
    });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Resource code already exists');
  });

  it('should return 500 on internal error', async () => {
    const originalError = console.error;
    console.error = jest.fn();

    const spy = jest
      .spyOn(prisma.resourceType, 'findUnique')
      .mockRejectedValueOnce(new Error('DB FAIL'));

    const res = await patchRequest({
      id: typeId,
      body: { name: 'Should Fail', code: 'FAIL-CODE' },
    });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal Server Error');

    spy.mockRestore();
    console.error = originalError;
  });

  it('should update name only if code did not change', async () => {
    const sameCode = `SAME-${unique}`;
    const newName = `New Name ${unique}`;

    const type = await prisma.resourceType.create({
      data: {
        name: `Orig Name ${unique}`,
        code: sameCode,
      },
    });

    const res = await patchRequest({
      id: type.id,
      body: { name: newName, code: sameCode },
    });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: type.id,
      name: newName,
      code: sameCode,
    });

    const resources = await prisma.resource.findMany({
      where: { typeId: type.id },
    });
    expect(resources.length).toBe(0);

    await prisma.resourceType.delete({ where: { id: type.id } });
  });

  it('should assign default numeric part if resource code is malformed', async () => {
    const malformedCode = `MALFORMED-${unique}`;
    const correctedCodePrefix = `FIXED-${unique}`;

    const malformedType = await prisma.resourceType.create({
      data: {
        name: `Malformed Type ${unique}`,
        code: malformedCode,
        resources: {
          create: [
            {
              name: 'BadRes',
              code: 'INVALIDCODE',
              isActive: true,
            },
          ],
        },
      },
    });

    const res = await patchRequest({
      id: malformedType.id,
      body: {
        name: `Fixed Type ${unique}`,
        code: correctedCodePrefix,
      },
    });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: malformedType.id,
      name: `Fixed Type ${unique}`,
      code: correctedCodePrefix,
    });

    const updatedResource = await prisma.resource.findFirst({
      where: { typeId: malformedType.id },
    });

    expect(updatedResource).not.toBeNull();
    expect(updatedResource?.code).toBe(`${correctedCodePrefix}-000001`);

    await prisma.resource.deleteMany({ where: { typeId: malformedType.id } });
    await prisma.resourceType.delete({ where: { id: malformedType.id } });
  });
});
