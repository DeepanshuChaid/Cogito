"use client";

import { Button } from "@/components/ui/button";
import API from "@/lib/API";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link"; 
import { useAuth } from "@/context/auth.provider";
import { useQueryClient } from "@tanstack/react-query";

export default function Home() {

  const queryClient = useQueryClient();

  const logout = async () => {
    try {
      await API.post("/user/logout");
      await queryClient.invalidateQueries({queryKey: ["currentUser"]})
      window.location.reload();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }




  const { user, isPending, error } = useAuth()

  if (error) {
    return (
     <>
      <p className="cdsc">Error: {JSON.stringify(error)}</p>;

    <Button onClick={() => toast.success("Makima ki chudai")}>Create Event</Button>

       <Link href="/profile/Ergo25">Profile</Link>
     </> 
    )
  }

  if (!user) {
    return <p>{JSON.stringify(error)}</p>;
  }

  return (
    <>
      <p>{JSON.stringify(user, null, 2)}</p>

      <Button onClick={logout}>Logout</Button>

      <Button onClick={() => toast.success("Makima ki chudai")}>Create Event</Button>

      <Link href="/profile/Ergo25">Profile</Link>
    </>
  );
}