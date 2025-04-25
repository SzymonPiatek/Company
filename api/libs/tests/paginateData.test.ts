import paginateData from "@libs/helpers/paginateData";

describe("paginateData", () => {
  const mockModel = {
    count: jest.fn(),
    findMany: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle missing sortBy and sortOrder (no orderBy)", async () => {
    mockModel.count.mockResolvedValue(10);
    mockModel.findMany.mockResolvedValue([{ id: 1 }]);

    const result = await paginateData(mockModel, {}, {});

    expect(mockModel.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
    });

    expect(result.meta.totalPages).toBe(1);
  });

  it("should ignore sortBy if sortOrder is missing", async () => {
    mockModel.count.mockResolvedValue(20);
    mockModel.findMany.mockResolvedValue([{ id: 1 }]);

    const result = await paginateData(mockModel, {}, { sortBy: "name" });

    expect(mockModel.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
    });

    expect(result.meta.total).toBe(20);
  });

  it("should apply ascending sortOrder", async () => {
    mockModel.count.mockResolvedValue(30);
    mockModel.findMany.mockResolvedValue([{ id: 1 }]);

    await paginateData(
      mockModel,
      {},
      { sortBy: "createdAt", sortOrder: "asc" },
    );

    expect(mockModel.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      orderBy: { createdAt: "asc" },
    });
  });

  it("should apply descending sortOrder", async () => {
    mockModel.count.mockResolvedValue(30);
    mockModel.findMany.mockResolvedValue([{ id: 1 }]);

    await paginateData(
      mockModel,
      {},
      { sortBy: "createdAt", sortOrder: "desc" },
    );

    expect(mockModel.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      orderBy: { createdAt: "desc" },
    });
  });

  it("should use default page and limit when pagination params are undefined", async () => {
    mockModel.count.mockResolvedValue(15);
    mockModel.findMany.mockResolvedValue([{ id: 1 }]);

    const result = await paginateData(mockModel, {}, {});

    expect(mockModel.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
    });

    expect(result.meta.page).toBe(1);
    expect(result.meta.limit).toBe(10);
  });
});
