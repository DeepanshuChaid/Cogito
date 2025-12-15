import { asyncHandler } from "../middlewares/asyncHandler.js";
import prisma from "../prisma.js";
import blogRoutes from "../routes/blog.routes.js";

export const saveBlogController = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const blogId = req.params.id;

  const blog = await prisma.blog.findUnique({ where: { id: blogId } });

  if (!blog) throw new Error("Blog not found");

  const alreadySaved = await prisma.savedblogs.findUnique({
    where: { userId_blogId: { userId, blogId } },
  });
  
  if (alreadySaved) throw new Error("Blog already saved");

  // Save and update score
  const savedBlog = await prisma.$transaction(async (tx) => {
    const saved = await tx.savedblogs.create({
      data: {
        user: { connect: { id: userId } },
        blog: { connect: { id: blogId } },
      },
    });

    await tx.blog.update({
      where: { id: blogId },
      data: {
        engagementScore: { increment: 8 }, // Saves are very valuable
      },
    });

    return saved;
  });

  return res.status(201).json({
    message: "Blog saved successfully",
    data: savedBlog,
  });
});


//  *************************** //
//  GET SAVED BLOGS CONTROLLER
//  *************************** //
export const getSavedBlogsController = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  const savedBlogs = await prisma.savedblogs.findMany({
    where: { userId },
    include: { blog: {
      include: {
        blogReaction: {
          select: {type: true},
          _count: {select: {comments: true}}
        }
      }  
    } },
  })

  if (!savedBlogs) throw new Error("No saved blogs found")

  return res.status(200).json({
    message: "Saved blogs fetched successfully",
    data: savedBlogs
  })
})

//  *************************** //
//  DELETE SAVED BLOG CONTROLLER
//  *************************** //
export const deleteSavedBlogController = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const blogId = req.params.id;

  const blog = await prisma.blog.findUnique({ where: { id: blogId } })
  if (!blog) throw new Error("Blog not found")

  // Delete and update score
  const savedBlog = await prisma.$transaction(async (tx) => {
    const deleted = await tx.savedblogs.delete({
      where: {
        userId_blogId: {
          userId,
          blogId,
        },
      },
    });

    await tx.blog.update({
      where: { id: blogId },
      data: {
        engagementScore: { decrement: 8 }, // Remove save weight
      },
    });

    return deleted;
  });
  
  if (!savedBlog) throw new Error("Blog not found in saved blogs")

  return res.status(200).json({
    message: "Blog removed from saved blogs successfully",
    data: savedBlog
  })
})



// GET OTHER USER BLOGS CONTROLLER
export const getOtherUserBlogsController = asyncHandler(async (req, res) => {
  const userId = req.params.id
  const name = req.params.name

  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 10

  const skip = (page - 1) * limit

  const blogs = await prisma.blog.findMany({
    where: { name },
    skip,
    take: limit,
    _count: {select: {comments: true}},
  })

  
})



