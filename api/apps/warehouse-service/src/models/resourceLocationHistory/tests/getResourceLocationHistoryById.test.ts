import request from "supertest";
import prisma from "../../../prismaClient";
import app from "../../../app";
import { v4 as uuid } from "uuid";

const baseUrl = "/api/warehouse/resourceLocationHistories";

describe("GET /resourceLocationHistories/:id", () => {
  let historyId: string;
  let fromLocationId: string;
  let toLocationId: string;
  let resourceId: string;

  beforeEach(async () => {
    await prisma.assignedResource.deleteMany();
    await prisma.resourceLocationHistory.deleteMany();
    await prisma.resourceLocation.deleteMany();

    fromLocationId = uuid();
    toLocationId = uuid();
    resourceId = uuid();

    await prisma.resourceLocation.createMany({
      data: [
        { id: fromLocationId, name: "From" },
        { id: toLocationId, name: "To" },
      ],
    });

    const history = await prisma.resourceLocationHistory.create({
      data: {
        resourceId,
        fromLocationId,
        toLocationId,
      },
    });

    historyId = history.id;
  });

  it("returns 200 and history record with relations", async () => {
    const res = await request(app).get(`${baseUrl}/${historyId}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", historyId);
    expect(res.body.fromLocation).toBeDefined();
    expect(res.body.toLocation).toBeDefined();
  });

  it("returns 404 if record not found", async () => {
    const res = await request(app).get(`${baseUrl}/nonexistent-id`);
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("History record not found");
  });

  it("returns 500 on internal error", async () => {
    const spy = jest
      .spyOn(prisma.resourceLocationHistory, "findUnique")
      .mockRejectedValueOnce(new Error("Boom"));

    const res = await request(app).get(`${baseUrl}/${historyId}`);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Internal Server Error");

    spy.mockRestore();
  });
});
