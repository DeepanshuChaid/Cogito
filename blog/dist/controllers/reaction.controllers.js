import { asyncHandler } from "../middlewares/asyncHandler.js";
import prisma from "../prisma.js";
import { invalidateCache } from "../utils/redis.utils.js";
// *************************** //
// LIKE BLOG CONTROLLER 
// *************************** //
export const likeBlogController = asyncHandler(async (req, res) => {
    const blogId = req.params.id;
    const userId = req.user?.id;
    const blog = await prisma.blog.findUnique({
        where: { id: blogId },
    });
    if (!blog)
        throw new Error("Blog not found");
    const reactions = await prisma.blogreaction.findMany({
        where: { blogId, userId },
    });
    const isLiked = reactions.find(r => r.type === "LIKE");
    const isDisliked = reactions.find(r => r.type === "DISLIKE");
    if (isLiked) {
        // Unlike: remove reaction and decrease score
        await prisma.$transaction([
            prisma.blogreaction.delete({
                where: { id: isLiked.id },
            }),
            prisma.blog.update({
                where: { id: blogId },
                data: {
                    engagementScore: { decrement: 4 }, // Remove like weight
                },
            }),
        ]);
        await invalidateCache([`blog:${blogId}`, `user_blogs:${req.user?.id}`]);
        return res.status(200).json({
            message: "Blog unliked successfully",
        });
    }
    if (isDisliked) {
        // Switch from dislike to like
        await prisma.$transaction([
            prisma.blogreaction.delete({
                where: { id: isDisliked.id },
            }),
            prisma.blogreaction.create({
                data: { blogId, userId, type: "LIKE" },
            }),
            prisma.blog.update({
                where: { id: blogId },
                data: {
                    engagementScore: { increment: 5 }, // Add like weight + remove dislike penalty (4 + 1)
                },
            }),
        ]);
    }
    else {
        // New like
        await prisma.$transaction([
            prisma.blogreaction.create({
                data: { blogId, userId, type: "LIKE" },
            }),
            prisma.blog.update({
                where: { id: blogId },
                data: {
                    engagementScore: { increment: 4 }, // Like weight
                },
            }),
        ]);
    }
    await invalidateCache([`blog:${blogId}`, `user_blogs:${req.user?.id}`]);
    return res.status(200).json({
        message: "Blog liked successfully",
    });
});
// *************************** //
// DISLIKE BLOG CONTROLLER
// *************************** //
export const dislikeBlogController = asyncHandler(async (req, res) => {
    const blogId = req.params.id;
    const userId = req.user?.id;
    const blog = await prisma.blog.findUnique({
        where: { id: blogId },
    });
    if (!blog)
        throw new Error("Blog not found");
    const reactions = await prisma.blogreaction.findMany({
        where: { blogId, userId },
    });
    const isLiked = reactions.find(r => r.type === "LIKE");
    const isDisliked = reactions.find(r => r.type === "DISLIKE");
    if (isDisliked) {
        // Remove dislike
        await prisma.$transaction([
            prisma.blogreaction.delete({
                where: { id: isDisliked.id },
            }),
            prisma.blog.update({
                where: { id: blogId },
                data: {
                    engagementScore: { increment: 1 }, // Remove small penalty
                },
            }),
        ]);
        await invalidateCache([`blog:${blogId}`, `user_blogs:${req.user?.id}`]);
        return res.status(200).json({
            message: "Blog dislike removed successfully",
        });
    }
    if (isLiked) {
        // Switch from like to dislike
        await prisma.$transaction([
            prisma.blogreaction.delete({
                where: { id: isLiked.id },
            }),
            prisma.blogreaction.create({
                data: { blogId, userId, type: "DISLIKE" },
            }),
            prisma.blog.update({
                where: { id: blogId },
                data: {
                    engagementScore: { decrement: 5 }, // Remove like + add dislike penalty (4 + 1)
                },
            }),
        ]);
    }
    else {
        // New dislike (small penalty)
        await prisma.$transaction([
            prisma.blogreaction.create({
                data: { blogId, userId, type: "DISLIKE" },
            }),
            prisma.blog.update({
                where: { id: blogId },
                data: {
                    engagementScore: { decrement: 1 }, // Small penalty
                },
            }),
        ]);
    }
    await invalidateCache([`blog:${blogId}`, `user_blogs:${req.user?.id}`]);
    return res.status(200).json({
        message: "Blog disliked successfully",
    });
});
