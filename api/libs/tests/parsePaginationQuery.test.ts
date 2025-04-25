import parsePaginationQuery from "../helpers/parsePaginationQuery";
import type { Request } from "express";

describe("parsePaginationQuery", () => {
  const mockReq = (query: Record<string, string>): Partial<Request> => ({
    query,
  });

  it("should parse all query params correctly", () => {
    const req = mockReq({
      page: "2",
      limit: "20",
      sortBy: "name",
      sortOrder: "DESC",
    }) as Request;

    const result = parsePaginationQuery(req);

    expect(result).toEqual({
      page: 2,
      limit: 20,
      sortBy: "name",
      sortOrder: "desc",
    });
  });

  it("should fall back to defaults for missing page and limit", () => {
    const req = mockReq({
      sortBy: "createdAt",
      sortOrder: "asc",
    }) as Request;

    const result = parsePaginationQuery(req);

    expect(result).toEqual({
      page: 1,
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "asc",
    });
  });

  it("should default to page=1 and limit=10 when values are invalid", () => {
    const req = mockReq({
      page: "zero",
      limit: "-5",
    }) as Request;

    const result = parsePaginationQuery(req);

    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
  });

  it("should return undefined for invalid sortOrder", () => {
    const req = mockReq({
      sortOrder: "upwards",
    }) as Request;

    const result = parsePaginationQuery(req);

    expect(result.sortOrder).toBeUndefined();
  });

  it("should allow only one of sortBy or sortOrder", () => {
    const req = mockReq({ sortBy: "id" }) as Request;

    const result = parsePaginationQuery(req);

    expect(result).toEqual({
      page: 1,
      limit: 10,
      sortBy: "id",
      sortOrder: undefined,
    });
  });

  it("should handle completely empty query object", () => {
    const req = mockReq({}) as Request;

    const result = parsePaginationQuery(req);

    expect(result).toEqual({
      page: 1,
      limit: 10,
      sortBy: undefined,
      sortOrder: undefined,
    });
  });
});
