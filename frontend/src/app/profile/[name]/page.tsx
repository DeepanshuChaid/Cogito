"use client"

import API from "@/lib/API";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ProfilePage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orgName, setOrgName] = useState<string>("");

  useEffect(() => {
    // Unwrap the params promise
    params.then((resolvedParams) => {
      setOrgName(resolvedParams.name);
    });
  }, [params]);

  useEffect(() => {
    if (!orgName) return;

    const fetchData = async () => {
      try {
        // Properly encode the name for URL
        const encodedName = encodeURIComponent(orgName);
        const res = await API.get(`/user/profile/${encodedName}`);
        toast.success("Profile data fetched successfully");
        setProfile(res.data.user);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orgName]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <p>Loading...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <p>No profile data found</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <pre className="p-4 bg-gray-100 rounded">
        {JSON.stringify(profile, null, 2)}
      </pre>
    </div>
  );
}