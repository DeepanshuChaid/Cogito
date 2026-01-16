"use client";

import { Button } from "@/components/ui/button";
import API from "@/lib/API";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth.provider";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

export default function Home() {
  const queryClient = useQueryClient();
  const { user, isPending, error: authError } = useAuth();
  const [localError, setLocalError] = useState<unknown | null>(null);

  useEffect(() => {
    if (!user && authError) {
      toast({
        title: "Authenticated",
        description: authError.response.data.message,
        variant: "destructive",
      });
    }
  }, [user, authError]);

  const handleLogout = async () => {
    try {
      await API.post("/user/logout");
      queryClient.clear();

      toast({
        title: "Logged out",
      });
    } catch (err) {
      setLocalError(err);
      toast({
        title: "Logout failed",
        description: JSON.stringify(err),
        variant: "destructive",
      });
    }
  };

  if (isPending) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (authError || localError) {
    const err = authError || localError;
    return (
      <div className="flex flex-col w-full gap-2">
        <p>yOU Are LOGGED OUT NIGGa</p>
        <Button onClick={handleLogout}>Logout</Button>
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
      <Button onClick={handleLogout}>Logout</Button>
      <Link href="/profile/Ergo25" className="underline">
        Profile
      </Link>
    </div>
  );
}