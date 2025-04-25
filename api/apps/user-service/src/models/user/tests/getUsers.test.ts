import request from "supertest";
import app from "../../../app";
import prisma from "../../../prismaClient";

const baseUrl = "/api/user/users";

describe("GET /users", () => {
  const testUsers = [
    {
      email: "john.doe@example.com",
      firstName: "John",
      lastName: "Doe",
      password: "Test1234!",
      isActive: true,
    },
    {
      email: "jane.smith@example.com",
      firstName: "Jane",
      lastName: "Smith",
      password: "Test1234!",
      isActive: true,
    },
    {
      email: "inactive.user@example.com",
      firstName: "Inactive",
      lastName: "User",
      password: "Test1234!",
      isActive: false,
    },
  ];

  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          in: testUsers.map((u) => u.email),
        },
      },
    });

    await prisma.user.createMany({
      data: testUsers,
      skipDuplicates: true,
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          in: testUsers.map((u) => u.email),
        },
      },
    });
  });

  it("should return paginated list of users", async () => {
    const res = await request(app).get(`${baseUrl}?page=1&limit=2`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(2);
    expect(res.body.meta).toHaveProperty("total");
    expect(res.body.meta).toHaveProperty("page", 1);
    expect(res.body.meta).toHaveProperty("limit", 2);

    res.body.data.forEach((user: any) => {
      expect(user.password).toBeUndefined();
    });
  });

  it("should filter users by firstName", async () => {
    const res = await request(app).get(`${baseUrl}?firstName=Jane`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].firstName).toBe("Jane");
  });

  it("should search users by query string", async () => {
    const res = await request(app).get(`${baseUrl}?search=smith`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].lastName.toLowerCase()).toContain("smith");
  });

  it("should filter by isActive", async () => {
    const res = await request(app).get(`${baseUrl}?isActive=false`);

    expect(res.status).toBe(200);
    expect(res.body.data.every((user: any) => user.isActive === false)).toBe(
      true,
    );
  });

  it("should return 500 on server error", async () => {
    const spy = jest
      .spyOn(prisma.user, "findMany")
      .mockRejectedValueOnce(new Error("DB Error"));

    const res = await request(app).get(`${baseUrl}?firstName=FailTest`);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error", "Internal Server Error");
    expect(res.body).toHaveProperty("details");

    spy.mockRestore();
  });
});
