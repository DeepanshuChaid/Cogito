import { asyncHandler } from "../middlewares/asyncHandler.js";
import prisma from "../prisma.js";
export const followUserController = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const followName = req.params.name;
    if (!userId)
        return res.status(401).json({ message: "Unauthorized" });
    const followUser = await prisma.user.findUnique({
        where: { name: followName },
    });
    if (!followUser)
        throw new Error("User not found");
    if (followUser.id === userId)
        throw new Error("You can't follow yourself");
    const alreadyFollowing = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId: userId,
                followingId: followUser.id,
            },
        },
    });
    if (alreadyFollowing)
        throw new Error("You are already following this user");
    const follow = await prisma.follow.create({
        data: {
            followerId: userId,
            followingId: followUser.id,
        }
    });
    return res.status(201).json({
        message: "User followed successfully",
        data: follow,
    });
});
