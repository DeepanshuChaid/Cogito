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
    <div className="flex items-center justify-center h-full">
      <div className="flex w-full flex-col gap-[40px]">
        <Link href="/" className="flex item-center self-center">
          <Image src="/Logo.png" alt="logo" height={40} width={104} className="h-[40px] w-auto"
          />
        </Link>

        <div className="Card max-w-[536px] m-auto">
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

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-7 w-full"
          >
            {/* Email Field */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="email"
                className={`font-semibold text-[16px] leading-[160%] ${
                  errors.email ? "text-red-500" : "text-[#F2F2F2]"
                }`}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                placeholder="Enter your Email"
                className={`h-[53px] w-full px-4 bg-[#1A1A1A] border ${
                  errors.email ? "border-red-500" : "border-[rgba(255,255,255,0.1)]"
                } rounded-[12px] shadow-[inset_0px_8px_18px_rgba(0,0,0,0.18)] text-[14px] font-normal leading-[150%] text-[#F2F2F2] placeholder-[#F2F2F2]`}
              />
              {errors.email && <p className="text-red-500 text-[14px]">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="password"
                className={`font-semibold text-[16px] leading-[160%] ${
                  errors.password ? "text-red-500" : "text-[#F2F2F2]"
                }`}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                {...register("password")}
                placeholder="Enter your Password"
                className={`h-[53px] w-full px-4 bg-[#1A1A1A] border ${
                  errors.password ? "border-red-500" : "border-[rgba(255,255,255,0.1)]"
                } rounded-[12px] shadow-[inset_0px_8px_18px_rgba(0,0,0,0.18)] text-[14px] font-normal leading-[150%] text-[#F2F2F2] placeholder-[#F2F2F2]`}
              />
              {errors.password && <p className="text-red-500 text-[14px]">{errors.password.message}</p>}

              {/* Forgot Password */}
              <a
                href="/forgot-password"
                className="text-[#D9D9D9] font-semibold text-[14px] mt-1 self-start"
              >
                Forgot Password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex justify-center items-center h-[57px] w-full bg-[#CCCCCC] border border-[rgba(0,0,0,0.1)] rounded-[12px] shadow-[0px_8px_5px_#000000,inset_0px_12px_14px_rgba(255,255,255,0.87)] font-semibold text-[20px] leading-[165%] text-[#080808] hover:bg-gray-300 transition"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </form>
          
            
        </div>
        
      </div>
    </div>
  );
}

