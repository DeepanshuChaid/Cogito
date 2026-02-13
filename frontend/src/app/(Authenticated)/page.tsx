"use client";

import { Button } from "@/components/ui/button";
import BlogAPI from "@/lib/BlogAPI";
import { useEffect, useState } from "react";
import Link from "next/link";
import UserAvatar from "@/components/ui/custom/Avatar";
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
    <div className="h-full w-full flex flex-row items-center gap-[3px] p-0 w-[841px] h-[740px] bg-[#1F1F1F] border border-white/10 rounded-xl overflow-x-hidden">
      <div className="flex w-full flex-col items-start gap-[1px] rounded-xl text-white">
        <div className="flex flex-row justify-between w-full items-center p-6 gap-[121px] bg-[#0D0D0D]">
          <div className="flex w-full flex-col gap-2">
            {/* proFile Pic and name */}
            <div className="flex align-center gap-3 items-center">
              <UserAvatar src={user?.profilePicture} name={user?.name} />
              <p className="text-14 font-medium text-white-200">{user?.name}</p>
            </div>

            <div className="flex flex-col justify-center items-start gap-5">
              <div className="flex flex-col items-start gap-1">
                {/* Head & Description */}
                <div className="flex flex-col items-start gap-1">
                  <h1 className="text-24 font-semibold text-white-100">
                    The Future of AI
                  </h1>
                  <h6 className="text-14 text-white-100">
                    So basically your dad is gonna get cucked by a fkin sex toy
                    ai robot ohh sorry my bad you DONT FKIN HAVE A DADA HAHAHAH
                    YOU FKIN LOOSERR!
                  </h6>
                </div>

                {/* Upload Date */}
                <p className="text-12 text-white-200">9/11/2001</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
