import prisma from "../../../prismaClient";
import request from "supertest";
import app from "../../../app";

const baseUrl = "/api/resource/resources";

describe("GET /api/resource/resources/:id", () => {
  let testResourceId: string;
  const unique = Date.now();
  const typeId = `type-${unique}`;
  const typeName = `Test Type ${unique}`;
  const typeCode = `CODE-${unique}`;

  beforeAll(async () => {
    await prisma.resourceType.create({
      data: {
        id: typeId,
        code: typeCode,
        name: typeName,
      },
    });

    const resource = await prisma.resource.create({
      data: {
        name: "Test Resource",
        code: `RES-${String(unique).slice(-6)}`,
        isActive: true,
        typeId,
      },
    });

    testResourceId = resource.id;
  });

  afterAll(async () => {
    await prisma.resource.deleteMany({ where: { typeId } });
    try {
      await prisma.resourceType.delete({ where: { id: typeId } });
    } catch (err) {}
  });

  it("should return 200 and the resource data if found", async () => {
    const res = await request(app).get(`${baseUrl}/${testResourceId}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: testResourceId,
      name: "Test Resource",
      code: expect.stringMatching(/^RES-\d+$/),
      typeId,
    });
    expect(res.body.type).toBeDefined();
    expect(res.body.type.code).toBe(typeCode);
  });

  it("should return 404 if resource not found", async () => {
    const res = await request(app).get(`${baseUrl}/non-existent-id`);
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Resource not found" });
  });

  it("should return 500 on internal server error", async () => {
    const spy = jest
      .spyOn(prisma.resource, "findUnique")
      .mockRejectedValueOnce(new Error("DB fail"));

    const res = await request(app).get(`${baseUrl}/something`);
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Internal Server Error");

    spy.mockRestore();
  });
});
