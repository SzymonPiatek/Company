import request from "supertest";
import prisma from "../../../prismaClient";
import app from "../../../app";
import { v4 as uuid } from "uuid";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const baseUrl = "/api/warehouse/resourceLocations";

describe("GET /resourceLocations/:id", () => {
  let locationId: string;
  let resourceId: string;

  beforeEach(async () => {
    locationId = uuid();
    resourceId = uuid();

    await prisma.resourceLocation.create({
      data: {
        id: locationId,
        name: `Loc-${locationId}`,
      },
    });

    await prisma.assignedResource.create({
      data: {
        resourceId,
        locationId,
      },
    });

    mockedAxios.get.mockResolvedValue({
      data: {
        id: resourceId,
        name: "Sample Resource",
      },
    });
  });

  afterEach(async () => {
    await prisma.assignedResource.deleteMany();
    await prisma.resourceLocation.deleteMany();
    jest.clearAllMocks();
  });

  it("should return 200 and resource location with enriched assignedResources", async () => {
    const res = await request(app).get(`${baseUrl}/${locationId}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", locationId);
    expect(res.body.assignedResources).toBeInstanceOf(Array);
    expect(res.body.assignedResources[0]).toHaveProperty("resource");
    expect(res.body.assignedResources[0].resource).toMatchObject({
      id: resourceId,
      name: "Sample Resource",
    });
  });

  it("should return 404 if resource location not found", async () => {
    const res = await request(app).get(`${baseUrl}/non-existent-id`);
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Resource location not found");
  });

  it("should return 200 and null resource if resource fetch fails", async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error("Not found"));

    const res = await request(app).get(`${baseUrl}/${locationId}`);
    expect(res.status).toBe(200);
    expect(res.body.assignedResources[0]).toHaveProperty("resource", null);
  });

  it("should return 500 on internal error", async () => {
    const spy = jest
      .spyOn(prisma.resourceLocation, "findUnique")
      .mockRejectedValueOnce(new Error("DB Crash"));

    const res = await request(app).get(`${baseUrl}/${locationId}`);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Internal Server Error");

    spy.mockRestore();
  });
});
