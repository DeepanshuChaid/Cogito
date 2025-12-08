import { redisClient } from "../server.js";
export const getCachedData = async (res, key, message) => {
    const cachedData = await redisClient.get(key);
    if (cachedData) {
        console.log("USER BLOGS: Serving from cache");
        return res.status(200).json({
            message: message,
            CACHED: true,
            data: JSON.parse(cachedData)
        });
    }
};
export const setCachedData = async (key, data) => {
    await redisClient.set(key, JSON.stringify(data), { EX: 1000 });
    console.log("Serving from database");
};
export const invalidateCache = async (keys) => {
    for (const key of keys) {
        const idkManMaybeKeys = await redisClient.keys(key);
        if (idkManMaybeKeys.length > 0) {
            await redisClient.del(idkManMaybeKeys);
        }
    }
};
// *************************** //
// HELPER: INVALIDATE RECOMMENDED BLOGS CACHE
// *************************** //
// Call this whenever a blog is created, updated, deleted, or reactions change
export const invalidateRecommendedBlogsCache = async (blogCategories) => {
    const keys = ['recommended_blogs:all'];
    // If we know the specific categories, invalidate all of them
    if (blogCategories && blogCategories.length > 0) {
        blogCategories.forEach(cat => {
            keys.push(`recommended_blogs:${cat}`);
        });
    }
    else {
        // If categories unknown, nuke all category caches
        for (const cat of Object.values(BLOGCATEGORY)) {
            keys.push(`recommended_blogs:${cat}`);
        }
    }
    await Promise.all(keys.map(key => redisClient.del(key)));
};
