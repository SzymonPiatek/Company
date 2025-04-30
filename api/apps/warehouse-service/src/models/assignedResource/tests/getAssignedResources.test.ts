import request from "supertest";
import prisma from "../../../prismaClient";
import app from "../../../app";
import { v4 as uuid } from "uuid";

const baseUrl = "/api/warehouse/assignedResources";

describe("GET /assignedResources", () => {
  let locationId: string;
  let resourceId: string;

  beforeEach(async () => {
    await prisma.resourceLocationHistory.deleteMany();
    await prisma.assignedResource.deleteMany();
    await prisma.resourceLocation.deleteMany();

    locationId = uuid();
    resourceId = uuid();

    await prisma.$transaction([
      prisma.resourceLocation.create({
        data: { id: locationId, name: `Location-${locationId}` },
      }),
      prisma.assignedResource.create({
        data: { resourceId, locationId },
      }),
    ]);
  });

  it("returns list of assigned resources with location", async () => {
    const res = await request(app).get(baseUrl);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0]).toHaveProperty("location");
  });

  it("filters by resourceId", async () => {
    const res = await request(app).get(`${baseUrl}?resourceId=${resourceId}`);
    expect(res.status).toBe(200);
    expect(res.body.data[0].resourceId).toBe(resourceId);
  });

  it("filters by locationId", async () => {
    const res = await request(app).get(`${baseUrl}?locationId=${locationId}`);
    expect(res.status).toBe(200);
    expect(res.body.data[0].locationId).toBe(locationId);
  });

  it("returns empty array for unmatched filters", async () => {
    const res = await request(app).get(`${baseUrl}?resourceId=nonexistent`);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it("returns 500 on internal error", async () => {
    const spy = jest
      .spyOn(prisma.assignedResource, "findMany")
      .mockRejectedValueOnce(new Error("Boom"));

    const res = await request(app).get(baseUrl);
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Internal Server Error");

    spy.mockRestore();
  });
});
