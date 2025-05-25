import { sign, type Secret, type SignOptions } from 'jsonwebtoken';

type GenerateTokenProps = {
  payload: object;
  secret: Secret;
  exp: SignOptions['expiresIn'];
};

type GenerateAccessOrRefreshTokenProps = {
  userId: string;
};

const generateToken = ({ payload, secret, exp }: GenerateTokenProps): string => {
  return sign(payload, secret, { expiresIn: exp });
};

export const generateAccessToken = ({ userId }: GenerateAccessOrRefreshTokenProps) => {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  const exp = process.env.ACCESS_TOKEN_EXP;

  if (!secret || !exp) throw new Error('Missing ACCESS_TOKEN_SECRET or EXP');

  return generateToken({
    payload: { userId },
    secret,
    exp: exp as SignOptions['expiresIn'],
  });
};

export const generateRefreshToken = ({ userId }: GenerateAccessOrRefreshTokenProps) => {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  const exp = process.env.REFRESH_TOKEN_EXP;

  if (!secret || !exp) throw new Error('Missing REFRESH_TOKEN_SECRET or EXP');

  return generateToken({
    payload: { userId },
    secret,
    exp: exp as SignOptions['expiresIn'],
  });
};
