import jwt from "jsonwebtoken";
import { v7 as uuidv7 } from 'uuid'

export interface AccessTokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface RefreshTokenPayload {
  userId: string;
  family: string;
  tokenId: string;
}

export function generateAccessToken(payload: AccessTokenPayload) {
  return jwt.sign(
    payload,
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: "15m" } as jwt.SignOptions
  )
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(
    token,
    process.env.JWT_ACCESS_SECRET!,
  ) as AccessTokenPayload
}

export function generateRefreshToken(userId: string, family: string) {
  const tokenId = uuidv7();
  ;

  const token = jwt.sign(
    { userId, family, tokenId } as RefreshTokenPayload,
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: "7d" } as jwt.SignOptions
  );
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7)

  return { token, tokenId, family, expiresAt }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET!,
  ) as RefreshTokenPayload
}