import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';

type GenerateTokenProps = {
  userId: string;
  secret: Secret;
  exp: SignOptions['expiresIn'];
};

type GenerateAccessOrRefreshTokenProps = {
  userId: string;
};

const accessTokenSecret: Secret = process.env.ACCESS_TOKEN_SECRET!;
const refreshTokenSecret: Secret = process.env.REFRESH_TOKEN_SECRET!;

const accessTokenExp = process.env.ACCESS_TOKEN_EXP! as SignOptions['expiresIn'];
const refreshTokenExp = process.env.REFRESH_TOKEN_EXP! as SignOptions['expiresIn'];

const generateToken = ({ userId, secret, exp }: GenerateTokenProps): string => {
  return jwt.sign({ sub: userId }, secret, { expiresIn: exp });
};

export const generateAccessToken = ({ userId }: GenerateAccessOrRefreshTokenProps) => {
  return generateToken({
    userId,
    secret: accessTokenSecret,
    exp: accessTokenExp,
  });
};

export const generateRefreshToken = ({ userId }: GenerateAccessOrRefreshTokenProps) => {
  return generateToken({
    userId,
    secret: refreshTokenSecret,
    exp: refreshTokenExp,
  });
};
