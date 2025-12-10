import { asyncHandler } from "../middlewares/asyncHandler.js"
import prisma from "../prisma.js"
import { invalidateCache } from "../utils/redis.utils.js"
import { invalidateRecommendedBlogsCache } from "./blog.controllers.js"

// *************************** //
// LIKE BLOG CONTROLLER (IMPROVED)
// *************************** //
export const likeBlogController = asyncHandler(
  async (req, res) => {
    const blogId = req.params.id
    const userId = req.user?.id

    const blog = await prisma.blog.findUnique({
      where: { id: blogId }
    })

    if (!blog) throw new Error("Blog not found")

    const isLiked = await prisma.blogreaction.findFirst({
      where: { blogId, userId, type: "LIKE" }
    })

    const isDisliked = await prisma.blogreaction.findFirst({
      where: { blogId, userId, type: "DISLIKE" }
    })

    if (isLiked) {
      await prisma.blogreaction.delete({
        where: { id: isLiked.id }
      })

      // INVALIDATE CACHE WHEN UNLIKING
      await invalidateCache([
        `blog:${blogId}`,
        'recommended_blogs:*',
        ...blog.category.map(cat => `category:${cat}:*`) // Invalidate all category caches
      ]);

      return res.status(200).json({
        message: "Blog unliked successfully"
      })
    }

    if (isDisliked) {
      await prisma.blogreaction.delete({
        where: { id: isDisliked.id }
      })
    }

    await prisma.blogreaction.create({
      data: { blogId, userId, type: "LIKE" }
    })

    await invalidateCache([
      `blog:${blogId}`,
      'recommended_blogs:*',
      ...blog.category.map(cat => `category:${cat}:*`) // Invalidate all category caches
    ]);

    return res.status(200).json({
      message: "Blog liked successfully"
    })
  }
)

// *************************** //
// DISLIKE BLOG CONTROLLER (IMPROVED)
// *************************** //
export const dislikeBlogController = asyncHandler(
  async (req, res) => {
    const blogId = req.params.id
    const userId = req.user?.id

    const blog = await prisma.blog.findUnique({
      where: { id: blogId }
    })

    if (!blog) throw new Error("Blog not found")

    const isLiked = await prisma.blogreaction.findFirst({
      where: { blogId, userId, type: "LIKE" }
    })

    const isDisliked = await prisma.blogreaction.findFirst({
      where: { blogId, userId, type: "DISLIKE" }
    })

    if (isDisliked) {
      await prisma.blogreaction.delete({
        where: { id: isDisliked.id }
      })

      // INVALIDATE CACHE WHEN REMOVING DISLIKE
      await invalidateCache([
        `blog:${blogId}`,
        'recommended_blogs:*',
        ...blog.category.map(cat => `category:${cat}:*`) // Invalidate all category caches
      ]);

      return res.status(200).json({
        message: "Blog dislike removed successfully"
      })
    }

    if (isLiked) {
      await prisma.blogreaction.delete({
        where: { id: isLiked.id }
      })
    }

    await prisma.blogreaction.create({
      data: { blogId, userId, type: "DISLIKE" }
    })

    await invalidateCache([
      `blog:${blogId}`,
      'recommended_blogs:*',
      ...blog.category.map(cat => `category:${cat}:*`) // Invalidate all category caches
    ]);

    return res.status(200).json({
      message: "Blog disliked successfully"
    })
  }
)


