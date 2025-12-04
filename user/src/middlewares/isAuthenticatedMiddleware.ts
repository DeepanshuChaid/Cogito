import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { asyncHandler } from "./asyncHandler.js";
import { generateAccessToken } from "../utils/token.utils.js";

declare module "express-serve-static-core" {
  interface Request {
    user?: { id: string };
  }
}

export const isAuthenticatedMiddleware = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { accessToken, refreshToken } = req.cookies;

    // Ensure req.user exists
    if (!req.user) req.user = { id: "" };

    if (req.user.id) return next();

    try {
      // If access token exists
      if (accessToken) {
        const decoded = jwt.verify(
          accessToken,
          process.env.ACCESS_TOKEN_SECRET!
        ) as JwtPayload & { userId: string };

        req.user.id = decoded.userId;
        return next();
      }

      // Try refresh token
      if (refreshToken) {
        const decodedRefresh = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET!
        ) as JwtPayload & { userId: string };

        const newAccessToken = generateAccessToken(decodedRefresh.userId);

        res.cookie("accessToken", newAccessToken, { httpOnly: true });

        req.user.id = decodedRefresh.userId;
        return next();
      }

      throw new Error("Unauthorized. Please login.");
    } catch (error) {
      throw new Error("Unauthorized. Please login.");
    }
  }
);
