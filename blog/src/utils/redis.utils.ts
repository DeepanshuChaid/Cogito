import { Response } from "express"
import { redisClient } from "../server.js"

export const getCachedData = async (res: Response, key: string, message: string) => {
  const cachedData = await redisClient.get(key)

  if (cachedData) {
    console.log("USER BLOGS: Serving from cache")
    return res.status(200).json({
      message: message,
      CACHED: true,
      data: JSON.parse(cachedData)
    })
  }
}

export const setCachedData = async (key: string, data: any) => {
  await redisClient.set(key, JSON.stringify(data), {EX: 1000})
  console.log("Serving from database")
}

export const invalidateCache = async (keys: string[]) => {
  for (const key of keys) {
    const idkManMaybeKeys = await redisClient.keys(key)
    if (idkManMaybeKeys.length > 0) {
      await redisClient.del(idkManMaybeKeys)
    }
  }
}


// *************************** //
// Call this whenever a blog is created, updated, deleted, or reactions change
export const invalidateRecommendedBlogsCache = async (categories: string[] | string) => {
  if (!categories) return;

  const cats = Array.isArray(categories) ? categories : [categories];

  // pattern: recommended_blogs:cat1,cat2:*
  for (const cat of cats) {
    const keys = await redisClient.keys(`recommended_blogs:*${cat}*`);
    if (keys.length) await redisClient.del(keys);
  }

  // also remove "recommended_blogs:all:*"
  const allKeys = await redisClient.keys(`recommended_blogs:all:*`);
  if (allKeys.length) await redisClient.del(allKeys);
};
