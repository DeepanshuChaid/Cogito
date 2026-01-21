import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { asyncHandler } from "./asyncHandler.js";
import { generateAccessToken } from "../utils/token.utils.js";
import { AppError } from "./appError.js";

declare module "express-serve-static-core" {
  interface Request {
    user?: { id: string };
  }
}

export const isAuthenticatedMiddleware = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { accessToken, refreshToken } = req.cookies;

    // Already authenticated (set by previous middleware)
    if (req.user?.id) return next();

    try {
      /* ---------------- ACCESS TOKEN ---------------- */
      if (accessToken) {
        const decoded = jwt.verify(
          accessToken,
          process.env.ACCESS_TOKEN_SECRET!
        ) as JwtPayload & { userId: string };

        req.user = { id: decoded.userId };
        return next();
      }

      /* ---------------- REFRESH TOKEN ---------------- */
      if (refreshToken) {
        const decodedRefresh = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET!
        ) as JwtPayload & { userId: string };

        const newAccessToken = generateAccessToken(decodedRefresh.userId);

        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "none", // REQUIRED for cross-site cookies
          maxAge: 15 * 60 * 1000,
        });

        req.user = { id: decodedRefresh.userId };
        return next();
      }

      throw new AppError("Unauthenticated. Please login.", 401);
    } catch (err) {
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      // Pass error to errorHandler (DO NOT rethrow generic Error)
      throw new AppError("Unauthenticated. Please login.", 401);
    }
  }
);