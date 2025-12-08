import { asyncHandler } from "../middlewares/asyncHandler.js";
import prisma from "../prisma.js";
import { invalidateCache, invalidateRecommendedBlogsCache } from "../utils/redis.utils.js";
export const createCommentController = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const blogId = req.params.blogId;
    const { comment, parentId } = req.body;
    const blog = await prisma.blog.findUnique({
        where: {
            id: blogId
        }
    });
    const newComment = await prisma.comments.create({
        data: {
            comment,
            user: { connect: { id: userId } },
            blog: { connect: { id: blogId } },
            ...(parentId && { parent: { connect: { id: parentId } } })
        }
    });
    if (!newComment)
        throw new Error("Error creating comment");
    await invalidateCache([
        `blog:${blogId}`,
        `user_blogs:${userId}`,
        'recommended_blogs:all',
    ]);
    await invalidateRecommendedBlogsCache(blog.category);
    return res.status(201).json({
        message: "Comment created successfully",
        data: newComment
    });
});
// *************************** //
// GET ALL COMMENTS OF BLOGS CONTROLLER
// *************************** //
export const getAllCommentsInBlogController = asyncHandler(async (req, res) => {
    const blogId = req.params.blogId;
    const comments = await prisma.comments.findMany({
        where: {
            blogId
        },
        include: {
            replies: true
        }
    });
    if (!comments)
        throw new Error("Error getting comments");
    return res.status(200).json({
        message: "Comments fetched successfully",
        data: comments
    });
});
