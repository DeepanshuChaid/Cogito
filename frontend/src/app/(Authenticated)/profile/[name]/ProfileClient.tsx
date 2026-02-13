"use client";

import API from "@/lib/API";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { name } = useParams<{ name: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["profile", name],
    queryFn: async () => {
      const res = await API.get(`/user/profile/${encodeURIComponent(name!)}`);
      return res.data.user;
    },
    enabled: !!name,
    // onSucces: () => toast({
    //   title: "Success",
    //   description: "Profile fetched successfully",
    //   variant: "success"
    // }),
    // onError: (err: any) => toast({
    //     title: "Error",
    //     description: err?.response?.data?.message || "Something went wrong!",
    //     variant: "destructive"
    //   })
  });

  if (isLoading) return <div className="h-screen grid place-items-center">Loading…</div>;
  if (!data) return <div className="h-screen grid place-items-center">No data</div>;

  return (
    <div className="w-full">
      <pre className="p-4 max-w-full overflow-x-auto whitespace-pre-wrap break-all">{JSON.stringify(data)}</pre>         
      </div>
  ) 
}