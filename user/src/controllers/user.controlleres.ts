import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import prisma from "../prisma.js";
import bcrypt from "bcrypt";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/token.utils.js";
import {
  loginUserSchema,
  registerUserSchema,
} from "../validation/user.validation.js";
import { setCookies } from "../utils/cookie.utils.js";
import HTTPSTATUS from "../configs/http.config.js";

// LOGIN
export const loginUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const parsed = loginUserSchema.parse({ email, password });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("User not found");

    if (!user.password) throw new Error("User has no password");

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error("Invalid password");

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    setCookies(res, accessToken, refreshToken)

    res.status(200).json({
      message: "Login successful",
      user,
    });
  }
);

// REGISTER
export const registerUserController = asyncHandler(
  async (req: Request, res: Response) => {
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

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    setCookies(res, accessToken, refreshToken)

    res.status(200).json({
      message: "Account Successfully Registered.",
      user,
    });
  }
);

// GET USER DATA
export const getUserDataController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user?.id) throw new Error("No user in request.");

    const user = await prisma.user.findFirst({
      where: { id: req.user.id },
      include: { accounts: true },
    });

    if (!user) throw new Error("User not found");

    res.status(200).json({
      message: "Successfully User Data Fetched",
      user,
    });
  }
);

// UPDATE USER DATA
export const updateUserDataController = asyncHandler(
  async (req: Request, res: Response) => {
    const {name, instagram, facebook, bio, profilePicture} = req.body;
    const userId = req.user?.id
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, instagram, facebook, bio, profilePicture },
    })

    if (!user) throw new Error("User not found");

    res.status(HTTPSTATUS.OK).json({
      message: "Successfully User Data Updated",
      user,
    })
  }
)

// LOGOUT USER
