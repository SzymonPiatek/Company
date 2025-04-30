import request from 'supertest';
import prisma from '../../../prismaClient';
import app from '../../../app';

const baseUrl = '/api/resource/resources';

describe('PATCH /api/resource/resources/:id', () => {
  const uniqueSuffix = Date.now();
  const typeId = `type-${uniqueSuffix}`;
  const typeName = `Type ${uniqueSuffix}`;
  let resourceId: string;

  beforeAll(async () => {
    await prisma.resourceType.create({
      data: {
        id: typeId,
        code: 'UPD',
        name: typeName,
      },
    });

    const resource = await prisma.resource.create({
      data: {
        name: 'Initial Resource',
        code: 'UPD-000001',
        description: 'Initial description',
        isActive: false,
        typeId,
      },
    });

    resourceId = resource.id;
  });

  afterAll(async () => {
    await prisma.resource.deleteMany({ where: { typeId } });
    await prisma.resourceType.delete({ where: { id: typeId } });
  });

  it('should update an existing resource and return 200', async () => {
    const res = await request(app).patch(`${baseUrl}/${resourceId}`).send({
      name: 'Updated Resource',
      description: 'Updated description',
      isActive: true,
      typeId,
    });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: resourceId,
      name: 'Updated Resource',
      description: 'Updated description',
      isActive: true,
      typeId,
    });
  });

  it('should return 404 if resource not found', async () => {
    const res = await request(app).patch(`${baseUrl}/nonexistent-id`).send({ name: 'Whatever', typeId });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Resource not found' });
  });

  it('should return 404 if resource type is not found', async () => {
    const res = await request(app).patch(`${baseUrl}/${resourceId}`).send({
      name: 'With wrong typeId',
      typeId: 'non-existent-type',
    });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Resource type not found' });
  });

  it('should return 500 on internal error', async () => {
    const spy = jest.spyOn(prisma.resource, 'findUnique').mockRejectedValueOnce(new Error('DB crash'));

    const res = await request(app).patch(`${baseUrl}/${resourceId}`).send({ name: 'Break it' });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal Server Error');

    spy.mockRestore();
  });
});
