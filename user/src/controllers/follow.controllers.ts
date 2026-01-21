import { asyncHandler } from "../middlewares/asyncHandler.js";
import prisma from "../prisma.js";
import { redisClient } from "../server.js";

export const followUserController = asyncHandler(async (req, res) => {
  const followerId = req.user?.id;        // logged-in user
  const targetName = req.params.name;     // profile being visited

  const cacheKey = `other_user_data:${targetName}`;

  if (!followerId) throw new AppError("Unauthorized");

  // 1. Fetch target user (minimal select for speed)
  const targetUser = await prisma.user.findUnique({
    where: { name: targetName },
    select: { id: true, name: true },
  });

  if (!targetUser) throw new AppError("User not found");

  // 2. Prevent self-follow
  if (targetUser.id === followerId) {
    throw new AppError("You cannot follow yourself");
  }

  // 3. Check if already following
  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId: targetUser.id,
      },
    },
  });

  // 4. TOGGLE LOGIC
  if (existingFollow) {
    // UNFOLLOW
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId: targetUser.id,
        },
      },
    });

    await redisClient.del(cacheKey);

    return res.status(200).json({
      success: true,
      message: "UNFOLLOWED",
      following: false,
      user: targetUser.name,
    });
  }

  // FOLLOW
  await prisma.follow.create({
    data: {
      followerId,
      followingId: targetUser.id,
    },
  });

  await prisma.notification.create({
    data: {
      type: "FOLLOW",
      issuerId: followerId,
      receiverId: targetUser.id,
    },
  })

  // Invalidate cache for the target user's profile Data
  await redisClient.del(`user_data:${targetUser.id}`)

  await redisClient.del(cacheKey);

  return res.status(201).json({
    success: true,
    message: "FOLLOWED",
    following: true,
    user: targetUser.name,
  });
});
