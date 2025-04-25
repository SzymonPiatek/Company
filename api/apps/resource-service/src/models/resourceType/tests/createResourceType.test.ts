import request from 'supertest';
import app from '../../../app';
import prisma from '../../../prismaClient';

const baseUrl = '/api/resource/resourceTypes';

describe('POST /api/resource/resourceTypes', () => {
  const unique = Date.now();
  const name = `TypeName ${unique}`;
  const code = `CODE-${unique}`;

  afterEach(async () => {
    await prisma.resourceType.deleteMany({
      where: {
        OR: [{ name }, { code }],
      },
    });
  });

  it('should create a new resource type and return 201', async () => {
    const res = await request(app).post(baseUrl).send({ name, code });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name, code });
  });

  it('should return 404 if name already exists', async () => {
    await request(app).post(baseUrl).send({ name, code });

    const res = await request(app)
      .post(baseUrl)
      .send({
        name,
        code: `CODE-${Date.now()}`,
      });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Resource name already exists');
  });

  it('should return 404 if code already exists', async () => {
    await request(app).post(baseUrl).send({ name, code });

    const res = await request(app)
      .post(baseUrl)
      .send({
        name: `Another Name ${Date.now()}`,
        code,
      });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Resource code already exists');
  });

  it('should return 500 on internal error', async () => {
    const spy = jest.spyOn(prisma.resourceType, 'findUnique').mockRejectedValueOnce(new Error('DB fail'));

    const res = await request(app).post(baseUrl).send({
      name: 'Fail',
      code: 'FAIL-CODE',
    });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal Server Error');

    spy.mockRestore();
  });
});
