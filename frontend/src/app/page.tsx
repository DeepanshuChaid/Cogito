"use client";

import { Button } from "@/components/ui/button";
import API from "@/lib/API";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";          

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    try {
      await API.post("/user/logout");
      window.location.reload();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }


  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get("/user/current");
        setUser(res.data);
      } catch (err: any) {
        // Axios error handling
          setError(
            err?.response?.data?.message ||
            "Something went wrong"
          )
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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