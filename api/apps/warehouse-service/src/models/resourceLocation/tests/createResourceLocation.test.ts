import request from 'supertest';
import app from '../../../app';
import prisma from '../../../prismaClient';
import { v4 as uuid } from 'uuid';

const baseUrl = '/api/warehouse/resourceLocations';

describe('POST /resourceLocations', () => {
  let locationName: string;

  beforeEach(() => {
    locationName = `Loc-${uuid()}`;
  });

  afterEach(async () => {
    await prisma.$transaction([
      prisma.resourceType.deleteMany({
        where: {
          name: {
            startsWith: 'Loc-',
          },
        },
      }),
    ]);
  });

  it('should create a new resource location and return 201', async () => {
    const res = await request(app).post(baseUrl).send({
      name: locationName,
      description: 'Test description',
    });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      name: locationName,
      description: 'Test description',
    });
  });

  it('should return 409 if location name already exists', async () => {
    await prisma.resourceLocation.create({
      data: { name: locationName },
    });

    const res = await request(app).post(baseUrl).send({ name: locationName });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Resource location with this name already exists.');
  });

  it('should return 500 on internal error', async () => {
    const spy = jest
      .spyOn(prisma.resourceLocation, 'findUnique')
      .mockRejectedValueOnce(new Error('Simulated crash'));

    const res = await request(app).post(baseUrl).send({ name: locationName });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal Server Error');

    spy.mockRestore();
  });
});
