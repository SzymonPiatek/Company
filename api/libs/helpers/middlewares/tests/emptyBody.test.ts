jest.unmock('../emptyBody.middleware');

import emptyBodyMiddleware from '../emptyBody.middleware';

describe('emptyBodyMiddleware', () => {
  const mockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call next if request body is a valid object', () => {
    const req = { body: { key: 'value' } } as any;
    const res = mockResponse();

    emptyBodyMiddleware(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 400 if body is missing', () => {
    const req = {} as any;
    const res = mockResponse();

    emptyBodyMiddleware(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid request body' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 400 if body is not an object', () => {
    const req = { body: 'not-an-object' } as any;
    const res = mockResponse();

    emptyBodyMiddleware(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid request body' });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
