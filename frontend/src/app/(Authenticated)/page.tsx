"use client";

import { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import { useAuth } from "@/context/auth.provider";
import { toast } from "@/hooks/use-toast";

// Replace this with your actual Microservice URL (e.g., http://localhost:5000)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function Home() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/blog/recommended`, {
          method: "GET",
          headers: {
            // CRITICAL: Tells the server you want JSON, not a Next.js page
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
          // CRITICAL: Sends cookies/session tokens to your microservice
          credentials: "include", 
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        const message = JSON.stringify(err)
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []); // Runs once on mount

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Recommended Blogs</h1>
      <pre className="bg-black-100 p-4 rounded-lg overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
