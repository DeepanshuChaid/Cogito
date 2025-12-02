import jwt from "jsonwebtoken";
import { asyncHandler } from "./asyncHandler.js";
import { generateAccessToken } from "../utils/token.utils.js";
export const isAuthenticatedMiddleware = asyncHandler(async (req, res, next) => {
    const { accessToken, refreshToken } = req.cookies;
    try {
        if (accessToken) {
            const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
            req.user = decoded.userId;
            return next();
        }
        // Access token missing or expired → try refresh token
        if (refreshToken) {
            const decodedRefresh = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            const newAccessToken = generateAccessToken(decodedRefresh.userId);
            res.cookie("accessToken", newAccessToken, { httpOnly: true });
            req.user = decodedRefresh.userId;
            return next();
        }
        throw new Error("Unauthorized. Please login.");
    }
    catch (err) {
        throw new Error("Unauthorized. Please login.");
    }
});
