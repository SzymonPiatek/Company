import request from "supertest";
import app from "../../../app";
import prisma from "../../../prismaClient";

const baseUrl = "/api/resource/resources";

describe("GET /api/resource/resources", () => {
  const typeId = `type-${Date.now()}`;
  const resourceBaseName = "TestResource";

  beforeAll(async () => {
    await prisma.resourceType.create({
      data: {
        id: typeId,
        code: "TEST",
        name: "Test Type",
      },
    });

    await prisma.resource.createMany({
      data: [
        {
          name: `${resourceBaseName}-1`,
          code: "TEST-000001",
          isActive: true,
          typeId,
        },
        {
          name: `${resourceBaseName}-2`,
          code: "TEST-000002",
          isActive: false,
          typeId,
        },
      ],
    });
  });

  afterAll(async () => {
    await prisma.resource.deleteMany({ where: { typeId } });
    await prisma.resourceType.delete({ where: { id: typeId } });
  });

  it("should return all resources with default pagination", async () => {
    const res = await request(app).get(baseUrl);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });

  it("should filter resources by name", async () => {
    const res = await request(app)
      .get(baseUrl)
      .query({ name: `${resourceBaseName}-1` });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe(`${resourceBaseName}-1`);
  });

  it("should return 500 on internal error", async () => {
    const spy = jest
      .spyOn(prisma.resource, "findMany")
      .mockRejectedValueOnce(new Error("DB FAIL"));

    const res = await request(app).get(baseUrl);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Internal Server Error");

    spy.mockRestore();
  });
});
