import jwt from "jsonwebtoken";
import { asyncHandler } from "./asyncHandler.js";
import { generateAccessToken } from "../utils/token.utils.js";
export const isAuthenticatedMiddleware = asyncHandler(async (req, res, next) => {
    const { accessToken, refreshToken } = req.cookies;
    // Ensure req.user exists
    if (!req.user)
        req.user = { id: "" };
    if (req.user.id)
        return next();
    try {
        // If access token exists
        if (accessToken) {
            const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
            req.user.id = decoded.userId;
            return next();
        }
        // Try refresh token
        if (refreshToken) {
            const decodedRefresh = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            const newAccessToken = generateAccessToken(decodedRefresh.userId);
            res.cookie("accessToken", newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
                sameSite: 'strict', // Critical: Prevents CSRF attacks
                maxAge: 15 * 60 * 1000
            });
            req.user.id = decodedRefresh.userId;
            return next();
        }
        throw new Error("UnAuthenticated, Please login to continue.");
    }
    catch (error) {
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        throw new Error("UnAuthenticated, Please login.");
    }
});
