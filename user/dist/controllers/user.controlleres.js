import { asyncHandler } from "../middlewares/asyncHandler.js";
import prisma from "../prisma.js";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken, } from "../utils/token.utils.js";
import { loginUserSchema, registerUserSchema, } from "../validation/user.validation.js";
// LOGIN USER CONTROLLER
export const loginUserController = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const parsed = loginUserSchema.parse({ email, password });
    let user = await prisma.user.findUnique({
        where: {
            email,
        },
    });
    if (!user)
        throw new Error("User not found");
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
        throw new Error("Invalid password");
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 15, // 15 minutes
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 30,
    });
    res.status(200).json({
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
                user: { connect: { id: createdUser.id } },
                provider: "EMAIL",
            },
        });
        return createdUser; // <-- IMPORTANT
    });
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 15,
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 30,
    });
    res.status(200).json({ message: "Account Successfully Registered.", user });
});
// GET USER DATA CONTROLLER
export const getUserDataController = asyncHandler(async (req, res) => {
    const userId = req.user;
    const user = await prisma.user.findFirst({
        where: {
            id: userId,
        },
        include: {
            accounts: true,
        },
    });
    if (!user)
        throw new Error("User not found OR Dev Sucks Absolute Fucking Garbage");
    res.status(200).json({
        message: "Successfully User Data Fetched",
        user
    });
});
