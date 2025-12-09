import { asyncHandler } from "../middlewares/asyncHandler.js";
import prisma from "../prisma.js";
import {
  invalidateCache,
  invalidateRecommendedBlogsCache,
  getCachedData,
  setCachedData,
} from "../utils/redis.utils.js";

export const createCommentController = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const blogId = req.params.blogId;

  const { comment, parentId } = req.body;

  const blog = await prisma.blog.findUnique({
    where: {
      id: blogId,
    },
  });

  const newComment = await prisma.comments.create({
    data: {
      comment,
      user: { connect: { id: userId } },
      blog: { connect: { id: blogId } },
      ...(parentId && { parent: { connect: { id: parentId } } }),
    },
  });

  if (!newComment) throw new Error("Error creating comment");

  return res.status(201).json({
    message: "Comment created successfully",
    data: newComment,
  });
});


// *************************** //
// DELETE COMMENTS IN A BLOGS CONTROLLER
// *************************** //
export const deleteCommentController = asyncHandler(async (req, res) => {
  const blogId = req.params.blogId;
  const commentId = req.params.id;
  const userId = req.user?.id

  const blog = await prisma.blog.findUnique({where: {id: blogId}})

  const role = blog.authorId === userId ? "author" : "user"

  const comment = await prisma.comments.findUnique({where: {id: commentId}})

  if (!comment) throw new Error("Comment not found")

  if (comment.userId !== userId && role !== "author") {
    throw new Error("You are not authorized to delete this comment")
  }

  if (role === "author") {
    await prisma.comments.delete({where: {id: commentId}})

    return res.status(200).json({
      message: "Comment deleted successfully"
      role,
      data: comment
    })
  }

  await prisma.comments.delete({where: {id: commentId}})

   // Invalidate cache for the blog and its comments
   
  
  return res.status(200).json({
    message: "Comment deleted successfully"
    role,
    data: comment
  })
  
})