"use client";

import { Button } from "@/components/ui/button";
import API from "@/lib/API";
import { useEffect, useState } from "react";
import Link from "next/link"; 
import { useAuth } from "@/context/auth.provider";
import { useQueryClient } from "@tanstack/react-query";
import {toast} from "@/hooks/use-toast"


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


       <Link href="/profile/Ergo25">Profile</Link>
     </> 
    )
  }

  if (!user) {
    toast({
      title: "succes",
      description: JSON.stringify(error),
      variant: "success"
    })
    return <p>{JSON.stringify(error)}</p>;
  }

  return (
    <>
      <p>{JSON.stringify(user, null, 2)}</p>

      <Button onClick={logout}>Logout</Button>

      <Button >Create Event</Button>

      <Link href="/profile/Ergo25">Profile</Link>
    </>
  );
}