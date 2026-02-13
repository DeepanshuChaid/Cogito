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
    <div className="h-full w-full flex flex-row items-start gap-[3px] bg-[#1F1F1F] border border-white/10 rounded-xl overflow-x-hidden">
      <div className="flex w-full flex-col items-start gap-[1px] rounded-xl text-white">
        <div className="flex flex-row justify-between w-full items-center p-6 gap-[28px] bg-[#0D0D0D]">
          
          <div className="flex w-full flex-col gap-2">
            {/* proFile Pic and name */}
            <div className="flex align-center gap-3 items-center">
              <UserAvatar src={user?.profilePicture} name={user?.name} />
              <p className="text-14 font-medium text-white-200">{user?.name}</p>
            </div>

            <div className="flex flex-col justify-center items-start gap-5">
              {/* Blog Head & Description */}
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

              {/* INteractions */}
              <div className="flex flex-row flex-wrap justify-between items-end content-start p-0 gap-6 max-w-[256px]">
                {/* VIEWS */}
                <div className="flex flex-row justify-center items-center p-0 gap-2">
                  <svg width="18" height="13" viewBox="0 0 18 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.432 6.89631C17.5227 6.63972 17.5227 6.36028 17.432 6.10369M17.432 6.89631C16.7483 8.55308 15.5812 9.97091 14.0794 10.9689C12.5776 11.967 10.8093 12.5 9 12.5C7.19067 12.5 5.42236 11.967 3.92059 10.9689C2.41882 9.97091 1.25168 8.55308 0.568023 6.89631M17.432 6.89631V6.10369M17.432 6.10369C16.7483 4.44692 15.5812 3.02909 14.0794 2.03105C12.5776 1.03301 10.8093 0.5 9 0.5C7.19067 0.5 5.42236 1.03301 3.92059 2.03105C2.41882 3.02909 1.25168 4.44692 0.568023 6.10369M0.568023 6.10369C0.477326 6.36028 0.477326 6.63972 0.568023 6.89631M0.568023 6.10369V6.89631M10.2143 6.5C10.2143 7.16326 9.67063 7.70093 9 7.70093C8.32937 7.70093 7.78572 7.16326 7.78572 6.5C7.78572 5.83674 8.32937 5.29907 9 5.29907C9.67063 5.29907 10.2143 5.83674 10.2143 6.5Z" stroke="#CCCCCC" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <p className="text-12 text-white-300">12k</p>
                </div>

                {/* COMMENTS */}
                <div className="flex flex-row justify-center items-center p-0 gap-2">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.09981 6.49977H4.10581M6.49981 6.49977H6.50581M8.8998 6.49977H8.9058M1.09501 9.10495C1.18324 9.3275 1.20288 9.57135 1.15141 9.80515L0.512415 11.7791C0.491825 11.8792 0.497149 11.9829 0.52788 12.0804C0.558611 12.1779 0.613732 12.2659 0.688015 12.3361C0.762297 12.4063 0.85328 12.4563 0.952334 12.4815C1.05139 12.5067 1.15523 12.5061 1.25401 12.4799L3.30181 11.8811C3.52244 11.8374 3.75093 11.8565 3.96121 11.9363C5.24244 12.5347 6.69383 12.6612 8.0593 12.2938C9.42476 11.9263 10.6166 11.0883 11.4244 9.92777C12.2323 8.7672 12.6043 7.35861 12.4748 5.9505C12.3453 4.5424 11.7226 3.22528 10.7166 2.23152C9.71067 1.23776 8.38603 0.631238 6.97644 0.518954C5.56685 0.40667 4.16289 0.795843 3.01228 1.61781C1.86166 2.43978 1.03833 3.64172 0.68755 5.01156C0.336768 6.38141 0.481076 7.83113 1.09501 9.10495Z" stroke="#E6E6E6" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <p className="text-12 text-white-300">1k</p>
                </div>

                {/* LIKES */}
                <div className="flex flex-row justify-center items-center gap-2">
                  <svg width="15" height="13" viewBox="0 0 15 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0.5 4.39013C0.500014 3.60536 0.736315 2.83905 1.17769 2.19241C1.61907 1.54578 2.24476 1.04924 2.97212 0.768375C3.69948 0.487513 4.4943 0.435541 5.25159 0.619322C6.00889 0.803104 6.69304 1.21399 7.21368 1.79772C7.25035 1.83723 7.29468 1.86872 7.34393 1.89025C7.39318 1.91178 7.44629 1.92289 7.49998 1.92289C7.55366 1.92289 7.60678 1.91178 7.65602 1.89025C7.70527 1.86872 7.74961 1.83723 7.78628 1.79772C8.30528 1.2102 8.98959 0.795857 9.74811 0.609842C10.5066 0.423828 11.3034 0.474964 12.0324 0.756446C12.7613 1.03793 13.3879 1.5364 13.8287 2.18553C14.2695 2.83465 14.5037 3.60364 14.5 4.39013C14.5 6.0051 13.45 7.21103 12.4 8.26887L8.55557 12.0157C8.42514 12.1667 8.26433 12.2879 8.08381 12.3714C7.90329 12.4549 7.70721 12.4987 7.50858 12.5C7.30995 12.5012 7.11333 12.4599 6.93178 12.3787C6.75023 12.2976 6.5879 12.1784 6.45558 12.0291L2.59999 8.26887C1.55 7.21103 0.5 6.01215 0.5 4.39013Z" stroke="#D9D9D9" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <p className="text-12 text-white-300">2k</p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[320px] shrink-0">
            <div className="aspect-video rounded-lg overflow-hidden">
              <img
                src={user?.profilePicture}
                alt="Blog"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
          
        </div>

        <div className="flex flex-row justify-between w-full items-center p-6 gap-[28px] bg-[#0D0D0D]">

          <div className="flex w-full flex-col gap-2">
            {/* proFile Pic and name */}
            <div className="flex align-center gap-3 items-center">
              <UserAvatar src={user?.profilePicture} name={user?.name} />
              <p className="text-14 font-medium text-white-200">{user?.name}</p>
            </div>

            <div className="flex flex-col justify-center items-start gap-5">
              {/* Blog Head & Description */}
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

              {/* INteractions */}
              <div className="flex flex-row flex-wrap justify-between items-end content-start p-0 gap-6 max-w-[256px]">
                {/* VIEWS */}
                <div className="flex flex-row justify-center items-center p-0 gap-2">
                  <svg width="18" height="13" viewBox="0 0 18 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.432 6.89631C17.5227 6.63972 17.5227 6.36028 17.432 6.10369M17.432 6.89631C16.7483 8.55308 15.5812 9.97091 14.0794 10.9689C12.5776 11.967 10.8093 12.5 9 12.5C7.19067 12.5 5.42236 11.967 3.92059 10.9689C2.41882 9.97091 1.25168 8.55308 0.568023 6.89631M17.432 6.89631V6.10369M17.432 6.10369C16.7483 4.44692 15.5812 3.02909 14.0794 2.03105C12.5776 1.03301 10.8093 0.5 9 0.5C7.19067 0.5 5.42236 1.03301 3.92059 2.03105C2.41882 3.02909 1.25168 4.44692 0.568023 6.10369M0.568023 6.10369C0.477326 6.36028 0.477326 6.63972 0.568023 6.89631M0.568023 6.10369V6.89631M10.2143 6.5C10.2143 7.16326 9.67063 7.70093 9 7.70093C8.32937 7.70093 7.78572 7.16326 7.78572 6.5C7.78572 5.83674 8.32937 5.29907 9 5.29907C9.67063 5.29907 10.2143 5.83674 10.2143 6.5Z" stroke="#CCCCCC" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <p className="text-12 text-white-300">12k</p>
                </div>

                {/* COMMENTS */}
                <div className="flex flex-row justify-center items-center p-0 gap-2">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.09981 6.49977H4.10581M6.49981 6.49977H6.50581M8.8998 6.49977H8.9058M1.09501 9.10495C1.18324 9.3275 1.20288 9.57135 1.15141 9.80515L0.512415 11.7791C0.491825 11.8792 0.497149 11.9829 0.52788 12.0804C0.558611 12.1779 0.613732 12.2659 0.688015 12.3361C0.762297 12.4063 0.85328 12.4563 0.952334 12.4815C1.05139 12.5067 1.15523 12.5061 1.25401 12.4799L3.30181 11.8811C3.52244 11.8374 3.75093 11.8565 3.96121 11.9363C5.24244 12.5347 6.69383 12.6612 8.0593 12.2938C9.42476 11.9263 10.6166 11.0883 11.4244 9.92777C12.2323 8.7672 12.6043 7.35861 12.4748 5.9505C12.3453 4.5424 11.7226 3.22528 10.7166 2.23152C9.71067 1.23776 8.38603 0.631238 6.97644 0.518954C5.56685 0.40667 4.16289 0.795843 3.01228 1.61781C1.86166 2.43978 1.03833 3.64172 0.68755 5.01156C0.336768 6.38141 0.481076 7.83113 1.09501 9.10495Z" stroke="#E6E6E6" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <p className="text-12 text-white-300">1k</p>
                </div>

                {/* LIKES */}
                <div className="flex flex-row justify-center items-center gap-2">
                  <svg width="15" height="13" viewBox="0 0 15 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0.5 4.39013C0.500014 3.60536 0.736315 2.83905 1.17769 2.19241C1.61907 1.54578 2.24476 1.04924 2.97212 0.768375C3.69948 0.487513 4.4943 0.435541 5.25159 0.619322C6.00889 0.803104 6.69304 1.21399 7.21368 1.79772C7.25035 1.83723 7.29468 1.86872 7.34393 1.89025C7.39318 1.91178 7.44629 1.92289 7.49998 1.92289C7.55366 1.92289 7.60678 1.91178 7.65602 1.89025C7.70527 1.86872 7.74961 1.83723 7.78628 1.79772C8.30528 1.2102 8.98959 0.795857 9.74811 0.609842C10.5066 0.423828 11.3034 0.474964 12.0324 0.756446C12.7613 1.03793 13.3879 1.5364 13.8287 2.18553C14.2695 2.83465 14.5037 3.60364 14.5 4.39013C14.5 6.0051 13.45 7.21103 12.4 8.26887L8.55557 12.0157C8.42514 12.1667 8.26433 12.2879 8.08381 12.3714C7.90329 12.4549 7.70721 12.4987 7.50858 12.5C7.30995 12.5012 7.11333 12.4599 6.93178 12.3787C6.75023 12.2976 6.5879 12.1784 6.45558 12.0291L2.59999 8.26887C1.55 7.21103 0.5 6.01215 0.5 4.39013Z" stroke="#D9D9D9" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <p className="text-12 text-white-300">2k</p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[320px] shrink-0">
            <div className="aspect-video rounded-lg overflow-hidden">
              <img
                src={user?.profilePicture}
                alt="Blog"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
