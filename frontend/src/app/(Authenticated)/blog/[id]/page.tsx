import { notFound } from "next/navigation";

// app/blog/[id]/page.tsx
export default async function BlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Simulate API delay - this will trigger loading.tsx
  const blogData = await fetchBlogData(id);

   if (!blogData) {
     notFound()
   }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <h1>{blogData.title}</h1>
      <p>{blogData.content}</p>
    </div>
  );
}

async function fetchBlogData(id: string) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Actual API call
  const response = await fetch(`https://api.example.com/blog/${id}`);
  return response.json();
}
