import  { asyncHandler } from "../middlewares/asyncHandler.js";
import prisma from "../prisma.js";
import { getCachedData, setCachedData } from "../utils/redis.utils.js";
import BLOGCATEGORY from "../enum/blogCategory.enum.js";
import { redisClient } from "../server.js";
import { AppError } from "../middlewares/appError.js"


// *************************** //
// GET RECOMMENDED BLOGS CONTROLLER (IMPROVED)
// *************************** //
export const getRecommendedBlogsController = asyncHandler(async (req, res) => {
  const categories = req.body?.category;
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
  const skip = (page - 1) * limit;

  // Calculate cache key based on categories and page
  const cacheKey = categories 
    ? `recommended:${categories.sort().join(',')}:${page}:${limit}`
    : `recommended:all:${page}:${limit}`;

  // Check cache first (5 minute TTL for recommendations)
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return res.status(200).json({
      cached: true,
      message: "Recommended blogs fetched",
      data: JSON.parse(cached).data,
      pagination: JSON.parse(cached).pagination,
    });
  }

  const totalBlogs = await prisma.blog.count({
    where: categories ? { category: { hasSome: categories } } : {},
  });

  // Fetch more than needed for better sorting (3x)
  const blogs = await prisma.blog.findMany({
    where: categories ? { category: { hasSome: categories } } : {},
    include: {
      author: {
        select: {
          id: true,
          name: true,
          profilePicture: true,
        },
      },
      _count: { 
        select: { 
          comments: true, 
          savedBlogs: true,
          blogReaction: true,
        } 
      },
    },
    orderBy: [
      { engagementScore: 'desc'},
      { createdAt: 'desc' }
    ], // Pre-sort by base score
    take: limit, // Get 3x more for reordering after time decay
    skip
  });

  // Apply time decay and calculate final scores
  const blogsWithScore = blogs.map(blog => {
    const baseScore = blog.engagementScore || 0;

    // Time decay calculation
    const hoursAgo = (Date.now() - new Date(blog.createdAt).getTime()) / (1000 * 60 * 60);

    // Multiple decay strategies based on content age
    let timeMultiplier;

    if (hoursAgo < 24) {
      // Very fresh content (< 1 day) - strong boost
      timeMultiplier = 1 + (24 - hoursAgo) / 24 * 0.5; // Up to 1.5x
    } else if (hoursAgo < 168) {
      // Recent content (1-7 days) - moderate decay
      timeMultiplier = Math.exp(-0.015 * (hoursAgo - 24));
    } else {
      // Older content (> 7 days) - slower decay
      timeMultiplier = Math.exp(-0.005 * hoursAgo);
    }

    const finalScore = baseScore * timeMultiplier;

    return { 
      ...blog, 
      score: finalScore,
      timeMultiplier, // Include for debugging if needed
    };
  });

  // Sort by final score
  blogsWithScore.sort((a, b) => b.score - a.score);

  // Paginate AFTER sorting
  const paginatedBlogs = blogsWithScore.slice(skip, skip + limit);

  const pagination = {
    currentPage: page,
    totalPages: Math.ceil(totalBlogs / limit),
    totalBlogs,
    limit,
  };

  const response = {
    data: paginatedBlogs,
    pagination,
  };

  // Cache for 5 minutes
  await redisClient.set(cacheKey, JSON.stringify(response), { EX: 300 });

  // Also cache individual blogs for 5 hours
  for (const blog of paginatedBlogs) {
    await redisClient.set(`blog:${blog.id}`, JSON.stringify(blog), { EX: 18000 });
  }

  return res.status(200).json({
    cached: false,
    message: "Recommended blogs fetched",
    ...response,
  });
});




// *************************** //
// SEARCH BLOGS CONTROLLER (FIXED)
// *************************** //
export const searchBlogsController = asyncHandler(async (req, res) => {
  const query = req.query.search?.trim();
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;

  const skip = (page - 1) * limit

  if (!query || query.length < 2) {
    return res.status(400).json({ message: "Search query too short" });
  }

  const search = query.toLowerCase();

  // Match categories — safe because it's enum
  const matchingCategories = Object.values(BLOGCATEGORY).filter((cat) =>
    cat.toLowerCase().includes(search)
  );

  // OR conditions
  const ORconditions = [
    { title: { contains: search, mode: "insensitive" } },
    { description: { contains: search, mode: "insensitive" } },
    { blogContent: { contains: search, mode: "insensitive" } },
  ];

  if (matchingCategories.length > 0) {
    ORconditions.push({
      category: { hasSome: matchingCategories },
    });
  }

  // Fetch from DB
  const blogs = await prisma.blog.findMany({
    where: { OR: ORconditions },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          profilePicture: true,
        }  
      },
      _count: {
        select: { comments: true, savedBlogs: true },
      },
    },
    orderBy: [
      { engagementScore: 'desc'},
      { createdAt: 'desc' }
    ],
    skip,
    take: limit
  });

  return res.status(200).json({
    message: "Search results",
    query,
    totalResults: blogs.length,
    data: blogs,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(blogs.length / limit),
      limit,
    },
  });
});


