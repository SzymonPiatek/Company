jest.unmock('../paginateData');

import paginateData from '../paginateData';

describe('paginateData', () => {
  const mockModel = {
    count: jest.fn(),
    findMany: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return paginated data and meta info', async () => {
    const mockData = [
      { id: '1', name: 'Test' },
      { id: '2', name: 'Test2' },
    ];
    const total = 25;

    mockModel.count.mockResolvedValue(total);
    mockModel.findMany.mockResolvedValue(mockData);

    const result = await paginateData(
      mockModel,
      { where: { name: 'Test' } },
      { page: 2, limit: 2 },
    );

    expect(mockModel.count).toHaveBeenCalledWith({ where: { name: 'Test' } });
    expect(mockModel.findMany).toHaveBeenCalledWith({
      where: { name: 'Test' },
      skip: 2,
      take: 2,
    });

    expect(result).toEqual({
      data: mockData,
      meta: {
        total,
        page: 2,
        limit: 2,
        totalPages: 13,
      },
    });
  });

  it('should use default pagination if none provided', async () => {
    mockModel.count.mockResolvedValue(1);
    mockModel.findMany.mockResolvedValue([{ id: '1', name: 'OnlyItem' }]);

    const result = await paginateData(mockModel, {}, {}); // no page or limit

    expect(mockModel.count).toHaveBeenCalledWith({ where: undefined });
    expect(mockModel.findMany).toHaveBeenCalledWith({ skip: 0, take: 10 });

    expect(result.meta).toMatchObject({
      page: 1,
      limit: 10,
      totalPages: 1,
    });
  });
});
