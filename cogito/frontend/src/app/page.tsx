"use client";

import { Button } from "@/components/ui/button";
import API from "@/lib/API";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link"; 
import { useQuery } from "@tanstack/react-query";

export default function Home() {

  const logout = async () => {
    try {
      await API.post("/user/logout");
      window.location.reload();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }



  const {data, isPending, error} = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    staleTime: 300 * 1000,
  })

  if (error) {
    return (
     <>
      <p className="cdsc">Error: {error}</p>;

    <Button onClick={() => toast.success("Makima ki chudai")}>Create Event</Button>

       <Link href="/profile/Ergo25">Profile</Link>
     </> 
    )
  }

  if (!user) {
    return <p>{error}</p>;
  }

  return (
    <>
      <p>{JSON.stringify(user)}</p>

      <Button onClick={logout}>Logout</Button>

      <Button onClick={() => toast.success("Makima ki chudai")}>Create Event</Button>

      <Link href="/profile/Ergo25">Profile</Link>
    </>
  );
}