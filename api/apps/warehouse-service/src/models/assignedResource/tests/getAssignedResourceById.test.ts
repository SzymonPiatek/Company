import request from "supertest";
import prisma from "../../../prismaClient";
import app from "../../../app";
import { v4 as uuid } from "uuid";

describe("GET /assignedResources/:id", () => {
  let assignedId: string;
  let locationId: string;

  beforeEach(async () => {
    await prisma.assignedResource.deleteMany();
    await prisma.resourceLocation.deleteMany();

    locationId = uuid();
    const resourceId = uuid();

    await prisma.resourceLocation.create({
      data: { id: locationId, name: `Loc-${locationId}` },
    });

    const assigned = await prisma.assignedResource.create({
      data: { resourceId, locationId },
    });

    assignedId = assigned.id;
  });

  it("returns 200 and assigned resource", async () => {
    const res = await request(app).get(
      `/api/warehouse/assignedResources/${assignedId}`,
    );
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", assignedId);
    expect(res.body.location).toHaveProperty("id", locationId);
  });

  it("returns 404 if not found", async () => {
    const res = await request(app).get(
      `/api/warehouse/assignedResources/nonexistent-id`,
    );
    expect(res.status).toBe(404);
  });
});
