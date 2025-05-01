import request from "supertest";
import app from "../../../app";
import prisma from "../../../prismaClient";

const baseUrl = "/api/resource/resourceTypes";

describe("PATCH /api/resource/resourceTypes/:id", () => {
  const unique = Date.now();
  const typeName = `Type ${unique}`;
  const typeCode = `CODE-${unique}`;
  const duplicateName = `${typeName}-duplicate`;
  const duplicateCode = `${typeCode}-DUPLICATE`;
  let typeId: string;

  beforeAll(async () => {
    const createdType = await prisma.resourceType.create({
      data: {
        name: typeName,
        code: typeCode,
        resources: {
          create: [
            { name: "Res1", code: `${typeCode}-000001`, isActive: true },
            { name: "Res2", code: `${typeCode}-000002`, isActive: false },
          ],
        },
      },
    });

    typeId = createdType.id;

    await prisma.resourceType.create({
      data: {
        name: duplicateName,
        code: duplicateCode,
      },
    });
  });

  afterAll(async () => {
    await prisma.resource.deleteMany({ where: { typeId } });
    await prisma.resourceType.deleteMany({
      where: { name: { contains: typeName } },
    });
  });

  it("should update a resource type and return 200", async () => {
    const updatedName = `Updated ${typeName}`;
    const updatedCode = `UPDATED-${unique}`;

    const res = await request(app).patch(`${baseUrl}/${typeId}`).send({
      name: updatedName,
      code: updatedCode,
    });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: typeId,
      name: updatedName,
      code: updatedCode,
    });

    const updatedResources = await prisma.resource.findMany({
      where: { typeId },
    });
    for (const res of updatedResources) {
      expect(res.code.startsWith(updatedCode)).toBe(true);
    }
  });

  it("should return 404 if resource type not found", async () => {
    const res = await request(app).patch(`${baseUrl}/non-existent-id`).send({
      name: "Whatever",
      code: "WHATEVER-CODE",
    });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "ResourceType not found" });
  });

  it("should return 409 if name is already taken", async () => {
    const res = await request(app)
      .patch(`${baseUrl}/${typeId}`)
      .send({
        name: duplicateName,
        code: `NEW-CODE-${unique}`,
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe("Resource name already exists");
  });

  it("should return 409 if code is already taken", async () => {
    const res = await request(app)
      .patch(`${baseUrl}/${typeId}`)
      .send({
        name: `Another Name ${unique}`,
        code: duplicateCode,
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe("Resource code already exists");
  });

  it("should return 500 on internal error", async () => {
    const originalError = console.error;
    console.error = jest.fn();

    const spy = jest
      .spyOn(prisma.resourceType, "findUnique")
      .mockRejectedValueOnce(new Error("DB FAIL"));

    const res = await request(app).patch(`${baseUrl}/${typeId}`).send({
      name: "Should Fail",
      code: "FAIL-CODE",
    });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Internal Server Error");

    spy.mockRestore();
    console.error = originalError;
  });

  it("should update name only if code did not change", async () => {
    const sameCode = `SAME-${unique}`;
    const newName = `New Name ${unique}`;

    const type = await prisma.resourceType.create({
      data: {
        name: `Orig Name ${unique}`,
        code: sameCode,
      },
    });

    const res = await request(app).patch(`${baseUrl}/${type.id}`).send({
      name: newName,
      code: sameCode,
    });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: type.id,
      name: newName,
      code: sameCode,
    });

    const resources = await prisma.resource.findMany({
      where: { typeId: type.id },
    });
    expect(resources.length).toBe(0);

    await prisma.resourceType.delete({ where: { id: type.id } });
  });

  it("should assign default numeric part if resource code is malformed", async () => {
    const weirdCode = `STRANGE${unique}`;
    const correctedCodePrefix = `FIXED-${unique}`;
    const resType = await prisma.resourceType.create({
      data: {
        name: `Malformed ${unique}`,
        code: weirdCode,
        resources: {
          create: [{ name: "StrangeRes", code: "BADCODE", isActive: true }],
        },
      },
    });

    const res = await request(app)
      .patch(`${baseUrl}/${resType.id}`)
      .send({
        name: `Updated Malformed ${unique}`,
        code: correctedCodePrefix,
      });

    expect(res.status).toBe(200);

    const updatedResource = await prisma.resource.findFirst({
      where: { typeId: resType.id },
    });

    expect(updatedResource?.code).toBe(`${correctedCodePrefix}-000001`);

    await prisma.resource.deleteMany({ where: { typeId: resType.id } });
    await prisma.resourceType.delete({ where: { id: resType.id } });
  });
});
