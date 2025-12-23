import { asyncHandler } from "../middlewares/asyncHandler.js";
import prisma from "../prisma.js";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken, } from "../utils/token.utils.js";
import { loginUserSchema, registerUserSchema, } from "../validation/user.validation.js";
import { setCookies } from "../utils/cookie.utils.js";
import HTTPSTATUS from "../configs/http.config.js";
import getBuffer from "../utils/dataUri.utils.js";
import { v2 as cloudinary } from "cloudinary";
import { redisClient } from "../server.js";
import { AppError } from "../middlewares/appError.js";
// LOGIN USER CONTROLLER
export const loginUserController = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const parsed = loginUserSchema.safeParse({ email, password });
    if (!parsed.success) {
        throw new AppError(parsed.error.issues[0].message, 400);
    }
    const user = await prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        throw new AppError("User not found", 404);
    }
    if (!user.password) {
        throw new AppError("User has no password", 400);
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new AppError("Invalid password", 401);
    }
    const cacheKey = `user_data:${user.id}`;
    await redisClient.set(cacheKey, JSON.stringify(user), { EX: 3600 });
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    setCookies(res, accessToken, refreshToken);
    res.status(HTTPSTATUS.OK).json({
        message: "Login successful",
        user,
    });
});
// REGISTER USER CONTROLLER
export const registerUserController = asyncHandler(async (req, res) => {
    const parsed = registerUserSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new AppError(parsed.error.issues[0].message, 400);
    }
    const { name, email, password } = parsed.data;
    const hashedPassword = await bcrypt.hash(password, 10);
    let createdUser;
    try {
        createdUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                accounts: {
                    create: {
                        provider: "EMAIL",
                    },
                },
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });
    }
    catch (err) {
        // DB-level unique constraint handling (NO RACE CONDITION)
        if (err.code === "P2002") {
            const field = err.meta?.target?.[0];
            throw new AppError(field === "email"
                ? "User with this email already exists"
                : "User with this name already exists", 400);
        }
        throw err;
    }
    // Cache only SAFE data
    const cacheKey = `user_data:${createdUser.id}`;
    await redisClient.set(cacheKey, JSON.stringify(createdUser), { EX: 3600 });
    const accessToken = generateAccessToken(createdUser.id);
    const refreshToken = generateRefreshToken(createdUser.id);
    setCookies(res, accessToken, refreshToken);
    res.status(HTTPSTATUS.CREATED).json({
        message: "Account successfully registered",
        user: createdUser,
    });
});
// GET USER DATA CONTROLLER
export const getUserDataController = asyncHandler(async (req, res) => {
    if (!req.user?.id) {
        throw new AppError("Unauthorized", 401);
    }
    const cacheKey = `user_data:${req.user.id}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        return res.status(200).json({
            message: "Successfully User Data Fetched",
            CACHED: true,
            user: JSON.parse(cachedData),
        });
    }
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
    });
    if (!user) {
        throw new AppError("User not found", 404);
    }
    await redisClient.set(cacheKey, JSON.stringify(user), { EX: 3600 });
    res.status(HTTPSTATUS.OK).json({
        message: "Successfully User Data Fetched",
        user,
    });
});
// UPDATE USER DATA CONTROLLER
export const updateUserDataController = asyncHandler(async (req, res) => {
    if (!req.user?.id) {
        throw new AppError("Unauthorized", 401);
    }
    const { name, instagram, facebook, bio } = req.body;
    const user = await prisma.user.update({
        where: { id: req.user.id },
        data: { name, instagram, facebook, bio },
    });
    const cacheKey = `user_data:${req.user.id}`;
    await redisClient.del(cacheKey);
    await redisClient.set(cacheKey, JSON.stringify(user), { EX: 3600 });
    res.status(HTTPSTATUS.OK).json({
        message: "Successfully User Data Updated",
        user,
    });
});
// UPDATE USER PROFILE PICTURE CONTROLLER
export const updateProfilePictureController = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const file = req.file;
    if (!file)
        return res
            .status(HTTPSTATUS.BAD_REQUEST)
            .json({ message: "No file uploaded" });
    const fileBuffer = getBuffer(file);
    if (!fileBuffer || !fileBuffer.content) {
        return res
            .status(HTTPSTATUS.BAD_REQUEST)
            .json({ message: "Failed to Generate Buffer" });
    }
    const cloud = await cloudinary.uploader.upload(fileBuffer.content, {
        folder: "blogs",
    });
    const user = await prisma.user.update({
        where: { id: userId },
        data: { profilePicture: cloud.secure_url },
    });
    const cacheKey = `user_data:${userId}`;
    await redisClient.del(cacheKey);
    // REDIS :- CACHE USER DATA
    await redisClient.set(cacheKey, JSON.stringify(user), { EX: 3600 });
    res.json({
        message: "Profile Picture Updated Successfully",
        user,
    });
});
//  LOGOUT CONTROLLER
export const logoutUserController = asyncHandler(async (req, res) => {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    if (req.session) {
        req.logout((err) => {
            if (err) {
                throw new AppError("Error logging out", 500);
            }
        });
    }
    res.status(200).json({ message: "Logged out successfully" });
});
// GET PROFILE USER DATA
export const getProfileUserDataController = asyncHandler(async (req, res) => {
    const name = req.params.name;
    const userId = req.user?.id;
    if (!userId) {
        throw new AppError("Unauthorized", 401);
    }
    const cacheKey = `other_user_data:${name}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        return res.status(200).json({
            message: "Successfully User Data Fetched",
            CACHED: true,
            user: JSON.parse(cachedData),
        });
    }
    const user = await prisma.user.findUnique({
        where: { name },
        select: {
            id: true,
            name: true,
            profilePicture: true,
            bio: true,
            instagram: true,
            facebook: true,
            _count: {
                select: {
                    followers: true,
                    following: true,
                },
            },
        },
    });
    if (!user) {
        throw new AppError("User not found", 404);
    }
    const isFollowing = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId: userId,
                followingId: user.id,
            },
        },
    });
    const responseUser = {
        ...user,
        isFollowing: !!isFollowing,
    };
    await redisClient.set(cacheKey, JSON.stringify(responseUser), { EX: 300 });
    res.status(200).json({
        message: "Successfully User Data Fetched",
        user: responseUser,
    });
});
