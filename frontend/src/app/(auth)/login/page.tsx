"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import "./login.css"
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import API from "@/lib/API";
import { toast } from "@/hooks/use-toast";
import { useEffect } from "react";
import Logo from "@/components/logo";
import GoogleOauthButton from "@/components/auth/GoogleLogo";

const formSchema = z.object({
  email: z.string().email("Invalid email").trim().min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters").trim(),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await API.post("/user/login", data);
      return res.data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Login successful!",
        variant: "success",
      });
      router.push("/");
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || "Something went wrong!";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // useEffect(() => {

  //   toast({
  //     title: "Error",
  //     description: "error.message",
  //     variant: "success",
  //   });
  // })

  const onSubmit = (data: FormValues) => {
    if (isPending) return;

    mutate(data);
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-[40px]">
        <Link href="/" className="flex item-center self-center">
          <Image src="/Logo.png" alt="logo" height={40} width={104} className="h-[40px] w-auto"
          />
        </Link>

        <div className="Card">
          <div className="flex flex-col justify-center items-center gap-[4px]">
            <h3 className="text-24 font-semibold text-white-200">Welcome back</h3>
            <p className="text-16 text-white-400 font-medium">Login to your account to continue</p>
          </div>

          <GoogleOauthButton label="Sign up" />

          <div className="relative flex items-center justify-center w-full">
            <div className="absolute inset-x-0 h-px bg-[#666666] rounded-md"></div>

            <span className="relative z-10 px-2.5 bg-[#141414] text-sm font-normal leading-[150%] tracking-[0.01em] text-[#BFBFBF]">
              Or Continue with
            </span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            {/* Email */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="email"
                className={`text-[16px] font-semibold leading-[160%] ${
                  errors.email ? "text-red-500" : "text-white"
                }`}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                placeholder="Enter your email"
                className={`w-full h-[53px] px-4 bg-[#1A1A1A] border ${
                  errors.email ? "border-red-500" : "border-[rgba(255,255,255,0.1)]"
                } rounded-[12px] shadow-inner text-white placeholder-gray-400`}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="password"
                className={`text-[16px] font-semibold leading-[160%] ${
                  errors.password ? "text-red-500" : "text-white"
                }`}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                {...register("password")}
                placeholder="Enter your password"
                className={`w-full h-[53px] px-4 bg-[#1A1A1A] border ${
                  errors.password ? "border-red-500" : "border-[rgba(255,255,255,0.1)]"
                } rounded-[12px] shadow-inner text-white placeholder-gray-400`}
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-[53px] bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-[12px] transition"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </form>
          
            
        </div>
        
      </div>
    </div>
  );
}

