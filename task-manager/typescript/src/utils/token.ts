import * as jwt from 'jsonwebtoken';

export function createAccessToken(email: string) {
  return jwt.sign({ sub: email }, process.env.JWT_SECRET!, {
    expiresIn: `${process.env.ACCESS_TOKEN_EXPIRE_MINUTES}m`,
  });
}
export function createRefreshToken(email: string) {
  return jwt.sign({ sub: email }, process.env.JWT_SECRET!, {
    expiresIn: `${process.env.REFRESH_TOKEN_EXPIRE_DAYS}d`,
  });
}
