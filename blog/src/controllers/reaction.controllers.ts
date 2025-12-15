import { asyncHandler } from "../middlewares/asyncHandler.js";
import prisma from "../prisma.js";
import { invalidateCache } from "../utils/redis.utils.js";

// *************************** //
// LIKE BLOG CONTROLLER
// *************************** //
export const likeBlogController = asyncHandler(async (req, res) => {
  const blogId = req.params.id;
  const userId = req.user?.id;

  const blog = await prisma.blog.findUnique({ where: { id: blogId } });
  if (!blog) throw new Error("Blog not found");

  // Upsert reaction
  const reaction = await prisma.blogreaction.upsert({
    where: { userId_blogId: { userId, blogId } },
    create: { userId, blogId, type: "LIKE" },
    update: { type: "LIKE" },
  });

  // Determine deltas
  let likesDelta = 0;
  let dislikesDelta = 0;
  let engagementDelta = 0;

  if (reaction.type === "LIKE") {
    // Already liked → unlike
    likesDelta = -1;
    engagementDelta = -4;
    await prisma.blogreaction.delete({ where: { id: reaction.id } });
  } else if (reaction.type === "DISLIKE") {
    // Switching from dislike → like
    likesDelta = 1;
    dislikesDelta = -1;
    engagementDelta = 5;
  } else {
    // New like
    likesDelta = 1;
    engagementDelta = 4;
  }

  // Update blog counters in **one query**
  await prisma.blog.update({
    where: { id: blogId },
    data: {
      likesCount: { increment: likesDelta },
      dislikesCount: { increment: dislikesDelta },
      engagementScore: { increment: engagementDelta },
    },
  });

  await invalidateCache([`blog:${blogId}`, `user_blogs:${userId}`]);

  res.status(200).json({ message: "Blog like processed successfully" });
});

// *************************** //
// DISLIKE BLOG CONTROLLER
// *************************** //
export const dislikeBlogController = asyncHandler(async (req, res) => {
  const blogId = req.params.id;
  const userId = req.user?.id;

  const blog = await prisma.blog.findUnique({ where: { id: blogId } });
  if (!blog) throw new Error("Blog not found");

  const reaction = await prisma.blogreaction.upsert({
    where: { userId_blogId: { userId, blogId } },
    create: { userId, blogId, type: "DISLIKE" },
    update: { type: "DISLIKE" },
  });

  // Determine deltas
  let likesDelta = 0;
  let dislikesDelta = 0;
  let engagementDelta = 0;

  if (reaction.type === "DISLIKE") {
    // Already disliked → remove
    dislikesDelta = -1;
    engagementDelta = 1;
    await prisma.blogreaction.delete({ where: { id: reaction.id } });
  } else if (reaction.type === "LIKE") {
    // Switching from like → dislike
    likesDelta = -1;
    dislikesDelta = 1;
    engagementDelta = -5;
  } else {
    // New dislike
    dislikesDelta = 1;
    engagementDelta = -1;
  }

  // Update blog counters
  await prisma.blog.update({
    where: { id: blogId },
    data: {
      likesCount: { increment: likesDelta },
      dislikesCount: { increment: dislikesDelta },
      engagementScore: { increment: engagementDelta },
    },
  });

  await invalidateCache([`blog:${blogId}`, `user_blogs:${userId}`]);

  res.status(200).json({ message: "Blog dislike processed successfully" });
});

