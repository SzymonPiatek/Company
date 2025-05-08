import type { Request, Response, NextFunction } from 'express';

jest.mock(
  '../helpers/middlewares/auth.middleware',
  () => (_req: Request, _res: Response, next: NextFunction) => next(),
);
jest.mock(
  '../helpers/middlewares/emptyBody.middleware',
  () => (_req: Request, _res: Response, next: NextFunction) => next(),
);
jest.mock('axios');
jest.mock('../helpers/parsePaginationQuery', () => jest.fn());
jest.mock('../helpers/buildOrderBy', () => jest.fn());
jest.mock('../helpers/buildQueryConditions', () => jest.fn());
jest.mock('../helpers/paginateData', () => jest.fn());
jest.mock('../helpers/bcrypt', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
}));
jest.mock('../helpers/jwt', () => ({
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
}));
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));
