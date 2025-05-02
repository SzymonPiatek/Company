import request from 'supertest';
import prisma from '../../../prismaClient';
import app from '../../../app';
import { v4 as uuid } from 'uuid';

const baseUrl = (id: string) => `/api/warehouse/assignedResources/${id}`;

describe('PATCH /assignedResources/:id', () => {
  let locationAId: string;
  let locationBId: string;
  let assignedId: string;
  let resourceId: string;

  beforeEach(async () => {
    await prisma.resourceLocationHistory.deleteMany();
    await prisma.assignedResource.deleteMany();
    await prisma.resourceLocation.deleteMany();

    locationAId = uuid();
    locationBId = uuid();
    resourceId = uuid();

    await prisma.resourceLocation.createMany({
      data: [
        { id: locationAId, name: `LocA-${locationAId}` },
        { id: locationBId, name: `LocB-${locationBId}` },
      ],
    });

    const assigned = await prisma.assignedResource.create({
      data: { resourceId, locationId: locationAId },
    });

    assignedId = assigned.id;
  });

  it('updates locationId and returns updated object', async () => {
    const res = await request(app).patch(baseUrl(assignedId)).send({ locationId: locationBId });

    expect(res.status).toBe(200);
    expect(res.body.locationId).toBe(locationBId);
  });

  it('returns 400 if locationId missing', async () => {
    const res = await request(app).patch(baseUrl(assignedId)).send({});

    expect(res.status).toBe(400);
  });

  it('returns 404 if resource not found', async () => {
    const res = await request(app)
      .patch(baseUrl('nonexistent-id'))
      .send({ locationId: locationBId });

    expect(res.status).toBe(404);
  });

  it('returns 500 on internal error', async () => {
    const spy = jest.spyOn(prisma, '$transaction').mockRejectedValueOnce(new Error('fail'));
    const res = await request(app).patch(baseUrl(assignedId)).send({ locationId: locationBId });

    expect(res.status).toBe(500);

    spy.mockRestore();
  });
});
