"use client";

import { Button } from "@/components/ui/button";
import API from "@/lib/API";
import { useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth.provider";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

export default function Home() {
  const queryClient = useQueryClient();
  const { user, isPending, error } = useAuth();

  // ✅ side-effects belong here, NOT in render
  useEffect(() => {
    if (!user && error) {
      toast({
        title: "Authentication error",
        description: JSON.stringify(error),
        variant: "destructive",
      });
    }
  }, [user, error]);

  if (isPending) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col w-full gap-2">
        <p>Error: {JSON.stringify(error).slice(0, 235)}</p>
        <Link href="/profile/Ergo25" className="underline">
          Profile
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <p>Not authenticated</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">

      <Button>Create Event</Button>

      <Link href="/profile/Ergo25" className="underline">
        Profile
      </Link>
    </div>
  );
}