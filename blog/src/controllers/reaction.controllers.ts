
import { asyncHandler } from "../middlewares/asyncHandler.js";
import prisma from "../prisma.js";
import { invalidateCache } from "../utils/redis.utils.js";

// *************************** //
// LIKE BLOG CONTROLLER
// *************************** //
export const likeBlogController = asyncHandler(async (req, res) => {
  const blogId = req.params.id;
  const userId = req.user.id;

  const existingReaction = await prisma.blogreaction.findUnique({
    where: { userId_blogId: { userId, blogId } },
  });

  let likesDelta = 0;
  let dislikesDelta = 0;
  let engagementDelta = 0;

  if (!existingReaction) {
    // ➕ New LIKE
    await prisma.blogreaction.create({
      data: { userId, blogId, type: "LIKE" },
    });

    likesDelta = 1;
    engagementDelta = 4;
  }

  else if (existingReaction.type === "LIKE") {
    // ❌ Unlike
    await prisma.blogreaction.delete({
      where: { id: existingReaction.id },
    });

    likesDelta = -1;
    engagementDelta = -4;
  }

  else {
    // 🔁 DISLIKE → LIKE
    await prisma.blogreaction.update({
      where: { id: existingReaction.id },
      data: { type: "LIKE" },
    });

    likesDelta = 1;
    dislikesDelta = -1;
    engagementDelta = 5;
  }

  await prisma.blog.update({
    where: { id: blogId },
    data: {
      likesCount: { increment: likesDelta },
      dislikesCount: { increment: dislikesDelta },
      engagementScore: { increment: engagementDelta },
    },
  });

  await invalidateCache([`blog:${blogId}`, `user_blogs:${userId}`]);

  res.status(200).json({ message: "Like processed" });
});

// *************************** //
// DISLIKE BLOG CONTROLLER
// *************************** //
export const dislikeBlogController = asyncHandler(async (req, res) => {
  const blogId = req.params.id;
  const userId = req.user.id;

  const existingReaction = await prisma.blogreaction.findUnique({
    where: { userId_blogId: { userId, blogId } },
  });

  let likesDelta = 0;
  let dislikesDelta = 0;
  let engagementDelta = 0;

  if (!existingReaction) {
    // ➕ New DISLIKE
    await prisma.blogreaction.create({
      data: { userId, blogId, type: "DISLIKE" },
    });

    dislikesDelta = 1;
    engagementDelta = -1;
  }

  else if (existingReaction.type === "DISLIKE") {
    // ❌ Remove dislike
    await prisma.blogreaction.delete({
      where: { id: existingReaction.id },
    });

    dislikesDelta = -1;
    engagementDelta = 1;
  }

  else {
    // 🔁 LIKE → DISLIKE
    await prisma.blogreaction.update({
      where: { id: existingReaction.id },
      data: { type: "DISLIKE" },
    });

    likesDelta = -1;
    dislikesDelta = 1;
    engagementDelta = -5;
  }

  await prisma.blog.update({
    where: { id: blogId },
    data: {
      likesCount: { increment: likesDelta },
      dislikesCount: { increment: dislikesDelta },
      engagementScore: { increment: engagementDelta },
    },
  });

  await invalidateCache([`blog:${blogId}`, `user_blogs:${userId}`]);

  res.status(200).json({ message: "Dislike processed" });
});
