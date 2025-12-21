"use client";

import { Button } from "@/components/ui/button";
import API from "@/utils/API";
import { useEffect, useState } from "react";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get("/api/user/current");
        setUser(res.data);
      } catch (err: any) {
        // Axios error handling
        setError(
          JSON.stringify(err)
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  if (!user) {
    return <p>No user data</p>;
  }

  return (
    <>
      <Button>sigmaboy</Button>
      <p className="text-2xl font-bold">
        Hello {user.name}
      </p>
    </>
  );
}