"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import Image from "next/image"    
import API from "@/lib/API";
import { toast } from "@/hooks/use-toast";
import {Avatar, AvatarImage, AvatarFallback} from "../../../components/ui/avatar"


export default function FollowingPage() {
  const { data, error, isPending } = useQuery({
    queryKey: ["RecommendedBlogs"],
    queryFn: async () => {
      const res = await API.get("/blog/recommended");
      return res.data;
    },
    staleTime: 1000 * 60, // 1 minute (more realistic)
  });

  // ✅ handle toast as a side-effect
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Something went wrong while fetching recommended blogs",
        variant: "destructive",
      });
    }
  }, [error]);

  if (isPending) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full text-sm text-zinc-400">
        Failed to load blogs
      </div>
    );
  }

  return (
    <div
      className="
        flex flex-col
        h-full min-h-0
        bg-[#1F1F1F]
      gap-[1px]
        border border-[rgba(255,255,255,0.1)]
        rounded-xl
        overflow-y-auto
        overflow-x-hidden
      "
    >
      {data?.data?.map((blog: any) => (
        <div
          key={blog.id}
          className="flex flex-row justify-between items-center p-6 gap-[121px] bg-[#0D0D0D]"
        >
          <div className="flex flex-col items-start gap-2">
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 rounded-full flex-shrink-0 overflow-hidden ">
                <AvatarImage src={blog.author.profilePicture || ""} />
                <AvatarFallback className="rounded-full border border-white-50/10 bg-black-grey-800 text-white-100">
                  {blog.author.name || "D"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          {blog.title}
        </div>
      ))}
    </div>
  );
}