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
// LOGIN USER CONTROLLER
export const loginUserController = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const parsed = loginUserSchema.parse({ email, password });
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            accounts: true,
        },
    });
    if (!user?.password)
        throw new Error("User has no password");
    if (!user)
        throw new Error("User not found");
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
        throw new Error("Invalid password");
    // REDIS :- CACHE USER DATA
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
    const { name, email, password } = req.body;
    registerUserSchema.parse({ name, email, password });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.$transaction(async (tx) => {
        const createdUser = await tx.user.create({
            data: { name, email, password: hashedPassword },
        });
        await tx.account.create({
            data: {
                provider: "EMAIL",
                userId: createdUser.id,
            },
        });
        return createdUser;
    });
    // REDIS :- CACHE USER DATA
    const cacheKey = `user_data:${user.id}`;
    await redisClient.set(cacheKey, JSON.stringify(user), { EX: 3600 });
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    setCookies(res, accessToken, refreshToken);
    res.status(HTTPSTATUS.CREATED).json({
        message: "Account Successfully Registered.",
        user,
    });
});
// GET USER DATA CONTROLLER
export const getUserDataController = asyncHandler(async (req, res) => {
    if (!req.user?.id)
        throw new Error("No user in request.");
    // REDIS :- CACHE USER DATA
    const cacheKey = `user_data:${req.user.id}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        console.log("USER DATA: Serving from cache");
        return res.status(200).json({
            message: "Successfully User Data Fetched",
            user: JSON.parse(cachedData),
        });
    }
    const user = await prisma.user.findFirst({
        where: { id: req.user.id },
        include: { accounts: true },
    });
    if (!user)
        throw new Error("User not found");
    // REDIS :- CACHE USER DATA
    await redisClient.set(cacheKey, JSON.stringify(user), { EX: 3600 });
    res.status(HTTPSTATUS.OK).json({
        message: "Successfully User Data Fetched",
        user,
    });
});
// UPDATE USER DATA CONTROLLER
export const updateUserDataController = asyncHandler(async (req, res) => {
    const { name, instagram, facebook, bio } = req.body;
    const userId = req.user?.id;
    const user = await prisma.user.update({
        where: { id: userId },
        data: { name, instagram, facebook, bio },
    });
    if (!user)
        throw new Error("User not found");
    const cacheKey = `user_data:${userId}`;
    await redisClient.del(cacheKey);
    // REDIS :- CACHE USER DATA
    await redisClient.set(cacheKey, JSON.stringify(user), { EX: 3600 });
    res.status(HTTPSTATUS.OK).json({
        message: "Successfully User Data Updated",
        user,
    });
});
// LOGOUT USER CONTROLLER
export const logoutUserController = asyncHandler(async (req, res) => {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    if (req.session) {
        req.logout((err) => {
            if (err)
                throw new Error("Error logging out");
        });
    }
    res.status(200).json({ message: "Logged out successfully" });
});
// UPDATE PROFILE PICTURE CONTROLLER
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
// GET OTHER USER DATA CONTROLLER
export const getOtherUserDataController = asyncHandler(async (req, res) => {
    const name = req.params.name;
    const cacheKey = `other_user_data:${name}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        console.log("OTHER USER DATA: Serving from cache");
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
                    following: true
                },
            }
        },
    });
    if (!user)
        throw new Error("User not found");
    await redisClient.set(cacheKey, JSON.stringify(user), { EX: 60 });
    return res.status(200).json({
        message: "Successfully User Data Fetched",
        user,
    });
});
