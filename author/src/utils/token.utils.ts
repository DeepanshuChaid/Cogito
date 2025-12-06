import jwt, { SignOptions } from "jsonwebtoken";

export const generateAccessToken = (payload: string) => {
  return jwt.sign(
    { userId: payload },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as SignOptions["expiresIn"] }
  );
};

export const generateRefreshToken = (payload: string) => {
  return jwt.sign(
    { userId: payload },
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN as SignOptions["expiresIn"] }
  );
};
