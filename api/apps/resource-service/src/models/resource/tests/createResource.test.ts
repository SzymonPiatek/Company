import request from "supertest";
import prisma from "../../../prismaClient";
import app from "../../../app";

const baseUrl = "/api/resource/resources";

describe("POST /api/resource", () => {
  const uniqueSuffix = Date.now();
  const typeId = `type-${uniqueSuffix}`;
  const typeName = `Test Type ${uniqueSuffix}`;

  beforeAll(async () => {
    await prisma.resourceType.create({
      data: {
        id: typeId,
        code: "RES",
        name: typeName,
      },
    });
  });

  afterAll(async () => {
    await prisma.resource.deleteMany({ where: { typeId } });

    try {
      await prisma.resourceType.delete({ where: { id: typeId } });
    } catch (err) {
      console.log(err);
    }
  });

  it("should create a new resource and return 201", async () => {
    const res = await request(app).post(baseUrl).send({
      name: "New Resource",
      description: "Test description",
      isActive: true,
      typeId,
    });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      name: "New Resource",
      description: "Test description",
      isActive: true,
      typeId,
    });
    expect(res.body.code).toMatch(/^RES-\d{6}$/);
  });

  it("should return 404 when resourceType not found", async () => {
    const res = await request(app).post(baseUrl).send({
      name: "Invalid Resource",
      typeId: "nonexistent-type-id",
    });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Resource type not found" });
  });

  it("should return 500 on internal error", async () => {
    const spy = jest
      .spyOn(prisma.resourceType, "findUnique")
      .mockRejectedValueOnce(new Error("DB error"));

    const res = await request(app).post(baseUrl).send({
      name: "Should Fail",
      typeId,
    });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error", "Internal Server Error");

    spy.mockRestore();
  });
});
