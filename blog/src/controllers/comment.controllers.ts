import { asyncHandler } from "../middlewares/asyncHandler.js";
import prisma from "../prisma.js";

export const createCommentController = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const blogId = req.params.blogId;

  const { comment, parentId } = req.body

  const newComment = await prisma.comment.create({
    data: {
      comment,
      user: { connect: { id: userId } },
      blog: { connect: { id: blogId } },
      ...(parentId && { parent: { connect: { id: parentId } } })
    }
  })

  if (!newComment) throw new Error("Error creating comment")

  return res.status(201).json({
    message: "Comment created successfully",
    data: newComment
  })
})