import request from 'supertest';
import prisma from '../../../prismaClient';
import app from '../../../app';
import { v4 as uuid } from 'uuid';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const baseUrl = '/api/warehouse/assignedResources';

describe('POST /assignedResources', () => {
  let locationId: string;
  let resourceId: string;

  beforeEach(async () => {
    locationId = uuid();
    resourceId = uuid();

    await prisma.$transaction([
      prisma.resourceLocationHistory.deleteMany(),
      prisma.assignedResource.deleteMany(),
      prisma.resourceLocation.deleteMany(),
    ]);

    await prisma.resourceLocation.create({
      data: { id: locationId, name: `Location-${locationId}` },
    });
  });

  afterEach(async () => {
    await prisma.$transaction([
      prisma.resourceLocationHistory.deleteMany(),
      prisma.assignedResource.deleteMany(),
      prisma.resourceLocation.deleteMany(),
    ]);
  });

  it('returns 201 and created assigned resource on success', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { id: resourceId } });

    const res = await request(app).post(baseUrl).send({
      resourceId,
      locationId,
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.resourceId).toBe(resourceId);
    expect(res.body.locationId).toBe(locationId);
  });

  it('returns 400 if body is incomplete', async () => {
    const res = await request(app).post(baseUrl).send({});
    expect(res.status).toBe(400);
  });

  it('returns 404 if resource not found', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: null });

    const res = await request(app).post(baseUrl).send({
      resourceId,
      locationId,
    });

    expect(res.status).toBe(404);
  });

  it('returns 404 if axios throws error', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Axios error'));

    const res = await request(app).post(baseUrl).send({
      resourceId,
      locationId,
    });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Resource not found');
  });

  it('returns 500 on internal error', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { id: resourceId } });

    const spy = jest
      .spyOn(prisma, '$transaction')
      .mockRejectedValueOnce(new Error('Simulated failure'));

    const res = await request(app).post(baseUrl).send({
      resourceId,
      locationId,
    });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal Server Error');

    spy.mockRestore();
  });
});
