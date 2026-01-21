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

export default function Home() {

  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {data, error, isPending} = useQuery({
    queryKey: ["RecommendedBlogs"],
    queryFn: async () => {
      const res = await BlogAPI.get("/blog/recommended")
      return res.data
    },
    staleTime: 100
  })

  if ( isPending ) {
     return (
      <div className="flex justify-center items-center h-full w-full">
        <Loader className="animate-spin" />
      </div>
     )
  }

  if ( error ) {
    toast({
      title: "Error",
      description: "Something went wrong while fetching recommended blogs",
      variant: "destructive"
    })
  }
  
  return (
    <div>
      vgvghjvgh
    </div>
  )
}