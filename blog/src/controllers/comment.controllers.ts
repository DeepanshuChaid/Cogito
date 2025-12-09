import { asyncHandler } from "../middlewares/asyncHandler.js";
import prisma from "../prisma.js";
import {
  invalidateCache,
  invalidateRecommendedBlogsCache,
  getCachedData,
  setCachedData,
} from "../utils/redis.utils.js";

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

  const newComment = await prisma.comments.create({
    data: {
      comment,
      user: { connect: { id: userId } },
      blog: { connect: { id: blogId } },
      ...(parentId && { parent: { connect: { id: parentId } } }),
    },
  });

  if (!newComment) throw new Error("Error creating comment");

  await invalidateCache([
    `blog:${blogId}`,
    `user_blogs:${userId}`,
    "recommended_blogs:all",
  ]);

  await invalidateRecommendedBlogsCache(blog.category);

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

  await prisma.comments.delete({ where: { id: commentId } });

  // Invalidate cache for the blog and its comments
  await invalidateCache([
    `blog:${blogId}`,
    `user_blogs:${userId}`,
    "recommended_blogs:all",
  ]);

  await invalidateRecommendedBlogsCache(blog.category);

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
    "recommended_blogs:all",
  ]);

  await invalidateRecommendedBlogsCache(blog.category);

  return res.status(200).json({
    message: "Comment updated successfully",
    data: updatedComment,
  });
});
