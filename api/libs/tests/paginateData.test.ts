import paginateData from '../helpers/paginateData';

describe('paginateData', () => {
  const mockModel = {
    count: jest.fn(),
    findMany: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should use default page and limit when pagination params are undefined', async () => {
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
