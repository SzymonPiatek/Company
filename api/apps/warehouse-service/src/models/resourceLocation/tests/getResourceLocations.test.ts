import request from 'supertest';
import prisma from '../../../prismaClient';
import app from '../../../app';
import { v4 as uuid } from 'uuid';
import { ResourceLocation } from '@prisma/client';

const baseUrl = '/api/warehouse/resourceLocations';

describe('GET /resourceLocations', () => {
  const nameA = `Loc-A-${uuid()}`;
  const nameB = `Loc-B-${uuid()}`;

  beforeEach(async () => {
    await prisma.resourceLocation.createMany({
      data: [
        { name: nameA, description: 'First location' },
        { name: nameB, description: 'Second location' },
      ],
    });
  });

  afterEach(async () => {
    await prisma.resourceLocation.deleteMany({
      where: {
        name: { in: [nameA, nameB] },
      },
    });
  });

  it('returns list of resource locations', async () => {
    const res = await request(app).get(baseUrl);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('filters by name', async () => {
    const res = await request(app).get(`${baseUrl}?name=${nameA}`);
    expect(res.status).toBe(200);
    expect(res.body.data[0].name).toBe(nameA);
  });

  it('filters by description', async () => {
    const res = await request(app).get(`${baseUrl}?description=Second location`);
    expect(res.status).toBe(200);
    expect(res.body.data[0].description).toBe('Second location');
  });

  it('supports full-text search', async () => {
    const res = await request(app).get(`${baseUrl}?search=${nameB.split('-')[1]}`);
    expect(res.status).toBe(200);
    expect(res.body.data.find((r: ResourceLocation) => r.name === nameB)).toBeTruthy();
  });

  it('returns 500 on server error', async () => {
    const spy = jest
      .spyOn(prisma.resourceLocation, 'findMany')
      .mockRejectedValueOnce(new Error('DB FAIL'));
    const res = await request(app).get(baseUrl);
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal Server Error');
    spy.mockRestore();
  });
});
