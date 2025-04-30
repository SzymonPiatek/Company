import request from "supertest";
import prisma from "../../../prismaClient";
import app from "../../../app";
import { v4 as uuid } from "uuid";
import axios from "axios";

const baseUrl = "/api/warehouse/assignedResources";
const resourceId = `resource-${Date.now()}`;
let locationId: string;

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

beforeAll(async () => {
  locationId = uuid();
  await prisma.resourceLocation.create({
    data: {
      id: locationId,
      name: `Location-${Date.now()}`,
    },
  });
});

afterAll(async () => {
  await prisma.assignedResource.deleteMany({ where: { resourceId } });
  await prisma.resourceLocation.delete({ where: { id: locationId } });
});

describe("POST /assignedResources", () => {
  it("should return 400 if body is incomplete", async () => {
    const res = await request(app).post(baseUrl).send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("ResourceId and locationId are required");
  });

  it("should return 404 if resource not found", async () => {
    const res = await request(app).post(baseUrl).send({
      resourceId: "nonexistent-resource",
      locationId,
    });
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Resource not found");
  });

  it("should return 500 on internal error", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { id: resourceId } });

    const spy = jest
      .spyOn(prisma.assignedResource, "create")
      .mockRejectedValueOnce(new Error("Simulated failure"));

    const res = await request(app).post(baseUrl).send({
      resourceId,
      locationId,
    });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Internal Server Error");

    spy.mockRestore();
  });
});
