"use client";

import { Button } from "@/components/ui/button";
import BlogAPI from "@/lib/BlogAPI";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth.provider";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import API from "@/lib/API";

export default function Home() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, error, isPending } = useQuery({
    queryKey: ["RecommendedBlogs"],
    queryFn: async () => {
      const res = await API.get("/blog/recommended");
      return res.data;
    },
    staleTime: 100,
  });

  if (isPending) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (error) {
    toast({
      title: "Error",
      description: "Something went wrong while fetching recommended blogs",
      variant: "destructive",
    });
  }

  return (
      <div className="flex flex-col items-center p-0 gap-[3px] w-full h-full bg-[#1F1F1F] border border-[rgba(255,255,255,0.1)] rounded-xl">
        {data?.data?.map((blog: any, index) => {
          return (
              <div key={index} className="flex flex-row items-center py-5 px-4 gap-3 bg-[#131313] w-full">
                {blog.title}
              </div>)
          })}
        
        <div class="flex flex-row items-center py-5 px-4 gap-3 bg-[#131313] w-full">
          vfvf
        </div>
    </div>
  )
}
