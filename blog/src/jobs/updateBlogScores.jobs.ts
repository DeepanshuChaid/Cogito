// jobs/updateBlogScores.js
import prisma from "../prisma.js";

export async function updateBlogScoresJob() {
  console.log("🔄 Starting blog score update...");
  const startTime = Date.now();

  const blogsWithStats = await prisma.$queryRaw`
    SELECT 
      b.id,
      b.views,
      b.shares,
      COUNT(CASE WHEN br.type = 'LIKE' THEN 1 END)::int as likes,
      COUNT(CASE WHEN br.type = 'DISLIKE' THEN 1 END)::int as dislikes,
      COUNT(DISTINCT c.id)::int as comments
    FROM "Blog" b
    LEFT JOIN "BlogReaction" br ON br."blogId" = b.id
    LEFT JOIN "Comment" c ON c."blogId" = b.id
    GROUP BY b.id, b.views, b.shares
  `;

  const updates = blogsWithStats.map((blog) => {
    const score = 
      blog.likes * 4 + 
      blog.comments * 6 + 
      (blog.shares || 0) * 10 + 
      (blog.views || 0) * 0.15 - 
      blog.dislikes * 3;

    return prisma.blog.update({
      where: { id: blog.id },
      data: { 
        engagementScore: score,
        lastScoreUpdate: new Date()
      }
    });
  });

  await Promise.all(updates);

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`✅ Updated ${blogsWithStats.length} blogs in ${duration}s`);
}

