import { asyncHandler } from "../middlewares/asyncHandler.js";
import prisma from "../prisma.js";
import {
  invalidateCache,
  getCachedData,
  setCachedData,
  deleteCommentCaches,
} from "../utils/redis.utils.js";
import { redisClient } from "../server.js";

// *************************** //
// CREATE COMMENTS CONTROLLER
// *************************** //
export const createCommentController = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const blogId = req.params.blogId;

  const { comment, parentId } = req.body;

  const blog = await prisma.blog.findUnique({
    where: {
      id: blogId,
    },
  });

  if (!blog) throw new Error("Blog not found");

  // Create comment and update score in transaction
  const newComment = await prisma.$transaction(async (tx) => {
    const response = await tx.comments.create({
      data: {
        comment,
        user: { connect: { id: userId } },
        blog: { connect: { id: blogId } },
        ...(parentId && { parent: { connect: { id: parentId } } }),
      },
    });

    // Update engagement score
    await tx.blog.update({
      where: { id: blogId },
      data: {
        engagementScore: { increment: 6 }, // Comments are valuable
      }
    })

      await tx.notification.create({
        data: {
          type: parentId ? "REPLY" : "COMMENT",
          issuerId: userId,
          receiverId: blog.authorId,
          commentId: response.id,
          commentText: comment,
          blogId: blogId,
        }
      })
    

    return response;
  });

  if (!newComment) throw new Error("Error creating comment");

  await invalidateCache([`blog:${blogId}`, `user_blogs:${userId}`]);

  await deleteCommentCaches(blogId)

  return res.status(201).json({
    message: "Comment created successfully",
    data: newComment,
  });
});

// *************************** //
// DELETE COMMENTS CONTROLLER
// *************************** //
export const deleteCommentController = asyncHandler(async (req, res) => {
  const blogId = req.params.blogId;
  const commentId = req.params.id;
  const userId = req.user?.id;

  const blog = await prisma.blog.findUnique({ where: { id: blogId } });
  if (!blog) throw new Error("Blog not found");

  const role = blog.authorId === userId ? "author" : "user";

  const comment = await prisma.comments.findUnique({
    where: { id: commentId },
  });

  if (!comment) throw new Error("Comment not found");

  if (comment.userId !== userId && role !== "author") {
    throw new Error("You are not authorized to delete this comment");
  }

  await prisma.$transaction([
    prisma.comments.delete({ where: { id: commentId } }),
    prisma.blog.update({
      where: { id: blogId },
      data: { engagementScore: { decrement: 6 } },
    }),
  ]);

  // Invalidate cache for the blog and its comments
  await invalidateCache([`blog:${blogId}`, `user_blogs:${userId}`]);

  await deleteCommentCaches(blogId)

  return res.status(200).json({
    message: "Comment deleted successfully",
    role,
    data: comment,
  });
});

// *************************** //
// UPDATE COMMENT CONTROLLER
// *************************** //
export const updateCommentController = asyncHandler(async (req, res) => {
  const blogId = req.params.blogId;
  const commentId = req.params.id;
  const userId = req.user?.id;
  const { comment } = req.body;

  const blog = await prisma.blog.findUnique({ where: { id: blogId } });
  if (!blog) throw new Error("Blog not found");

  const existingComment = await prisma.comments.findUnique({
    where: { id: commentId },
  });
  if (!existingComment) throw new Error("Comment not found");

  const role = blog.authorId === userId ? "author" : "user";

  if (existingComment.userId !== userId && role !== "author") {
    throw new Error("You are not authorized to update this comment");
  }

  const updatedComment = await prisma.comments.update({
    where: { id: commentId },
    data: { comment, isEdited: true },
  });

  await invalidateCache([
    `blog:${blogId}`,
    `user_blogs:${userId}`,
  ]);

  await deleteCommentCaches(blogId)

  return res.status(200).json({
    message: "Comment updated successfully",
    data: updatedComment,
  });
});

//  *************************** //
//  GET COMMENTS CONTROLLER
//  *************************** //
export const getCommentsController = asyncHandler(async (req, res) => {
  const blogId = req.params.blogId;
  const userId = req.user?.id;

  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

  const cacheKey = `comments:${blogId}:${page}`;

  const cachedData = await getCachedData(
    res,
    cacheKey,
    "Comments fetched successfully",
  );
  if (cachedData) return;

  const skip = (page - 1) * limit;

  const blog = await prisma.blog.findFirst({
    where: { id: blogId },
    select: { id: true },
  });

  if (!blog) throw new Error("Blog not found");

  const comments = await prisma.comments.findMany({
    where: { blogId },
    include: {
      user: true,
      replies: true,
    },
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  if (!comments) throw new Error("No comments found");

  comments.forEach((e) => {
    e.userId === userId ? e.role = "author" : e.role = "user";
  })

  await setCachedData(cacheKey, comments);

  return res.status(200).json({
    message: "Comments fetched successfully",
    data: comments,
  });
});


