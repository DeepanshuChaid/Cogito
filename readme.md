import { asyncHandler } from "../middlewares/asyncHandler.js";
import prisma from "../prisma.js";

export const followToggleController = asyncHandler(async (req, res) => {
  const followerId = req.user?.id;        // logged-in user
  const targetName = req.params.name;     // profile being visited

  if (!followerId) throw new Error("Unauthorized");

  // 1. Fetch target user (minimal select for speed)
  const targetUser = await prisma.user.findUnique({
    where: { name: targetName },
    select: { id: true, name: true },
  });

  if (!targetUser) throw new Error("User not found");

  // 2. Prevent self-follow
  if (targetUser.id === followerId) {
    throw new Error("You cannot follow yourself");
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

    return res.status(200).json({
      success: true,
      action: "UNFOLLOWED",
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

  return res.status(201).json({
    success: true,
    action: "FOLLOWED",
    following: true,
    user: targetUser.name,
  });
});