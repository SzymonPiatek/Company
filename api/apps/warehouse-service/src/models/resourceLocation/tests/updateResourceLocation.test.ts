import request from 'supertest';
import prisma from '../../../prismaClient';
import app from '../../../app';
import { v4 as uuid } from 'uuid';

const baseUrl = '/api/warehouse/resourceLocations';

describe('PATCH /resourceLocations/:id', () => {
  let locationAId: string;
  let locationBId: string;

  beforeEach(async () => {
    locationAId = uuid();
    locationBId = uuid();

    await prisma.resourceLocation.createMany({
      data: [
        { id: locationAId, name: 'Main A' },
        { id: locationBId, name: 'Main B' },
      ],
    });
  });

  afterEach(async () => {
    await prisma.assignedResource.deleteMany({
      where: { locationId: { in: [locationAId, locationBId] } },
    });
    await prisma.resourceLocationHistory.deleteMany({
      where: {
        OR: [
          { fromLocationId: { in: [locationAId, locationBId] } },
          { toLocationId: { in: [locationAId, locationBId] } },
        ],
      },
    });
    await prisma.resourceLocation.deleteMany({
      where: { id: { in: [locationAId, locationBId] } },
    });
  });

  it('should update the location name and return 200', async () => {
    const res = await request(app).patch(`${baseUrl}/${locationAId}`).send({ name: 'Updated A' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated A');
  });

  it('should return 409 if name is already taken', async () => {
    const res = await request(app).patch(`${baseUrl}/${locationAId}`).send({ name: 'Main B' });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Resource location with this name already exists.');
  });

  it('should return 404 if resource location not found', async () => {
    const res = await request(app).patch(`${baseUrl}/non-existent-id`).send({ name: 'Whatever' });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Resource location not found');
  });

  it('should return 500 on internal error', async () => {
    const spy = jest
      .spyOn(prisma.resourceLocation, 'update')
      .mockRejectedValueOnce(new Error('Simulated fail'));

    const res = await request(app)
      .patch(`${baseUrl}/${locationAId}`)
      .send({ description: 'Whatever' });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal Server Error');

    spy.mockRestore();
  });
});
