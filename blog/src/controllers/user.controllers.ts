import { asyncHandler } from "../middlewares/asyncHandler.js";
import prisma from "../prisma.js";

export const saveBlogController = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const blogId = req.params.id;

  const blog = await prisma.blog.findUnique({ where: { id: blogId } });

  if (!blog) throw new Error("Blog not found");

  const savedBlog = await prisma.savedblogs.create({
    data: {
      user: { connect: { id: userId } },
      blog: { connect: { id: blogId } },
    },
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
    include: { blog: true },
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

  const savedBlog = await prisma.savedblogs.delete({
      where: {
        userId_blogId: {
          userId,
          blogId,
        },
      },
    });
  if (!savedBlog) throw new Error("Blog not found in saved blogs")

  return res.status(200).json({
    message: "Blog removed from saved blogs successfully",
    data: savedBlog
  })
})



