"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import API from "@/lib/API"
import GoogleOauthButton from "@/components/auth/GoogleLogo";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";

const formSchema = z
.object({
  name: z
    .string()
    .min(1, "Name is required")
    .trim()
    .refine((val) => !val.includes(" "), {
      message: "Organization name cannot contain spaces",
    }),
  email: z.string().email("Invalid email").trim(),
  password: z.string().min(6, "Password must be at least 6 characters").trim(),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters").trim(),
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const inputBase =
  "py-[16px] w-full px-4 bg-[#1A1A1A] rounded-[12px] shadow-[inset_0px_8px_18px_rgba(0,0,0,0.18)] text-[14px] font-normal leading-[150%] text-[#F2F2F2] placeholder-[#F2F2F2] border focus:outline-none  focus:border-white-300 focus:ring-2 focus:ring-white-200/40";

type FormValues = z.infer<typeof formSchema>;

export default function SignUpPage() {
  const router = useRouter();

  // Inside your component
  const [showPassword, setShowPassword] = useState(false);


  const {handleSubmit, register, formState: {errors}} = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    },
  });

  const {mutate, isPending} = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await API.post("/user/register", data);
      return res.data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Registered successfully!",
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
  })

  const onSubmit = async (data: FormValues) => {
    if (!isPending) return

    mutate(data)
  };

  return (
    <div className="flex flex-col justify-center items-center gap-6 min-h-svh px-2 py-12 md:p-2">
       <div className="flex w-full flex-col gap-[32px] justify-center items-center">
         {/* LOGO */}
         <Link href="/" className="flex item-center self-center">
             <Image src="/Logo.png" alt="logo" height={40} width={104} className="h-[40px] w-auto"
             />
           </Link>

         <div className="flex flex-col justify-center items-center p-6 gap-8 w-full bg-[#141414] rounded-[12px] shadow-[0_0_1px_1px_rgba(255,255,255,0.13),0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)] max-w-[536px]">
           {/* HEADING */}
           <div className="flex flex-col justify-center items-center gap-[4px]">
             <h3 className="font-semibold text-white-200 text-20 md:text-24 lg:text-28">
               Welcome back
             </h3>
             <p className="text-14 md:text-16 lg:text-18 text-white-400 font-medium">
               Login to your account to continue
             </p>
           </div>

           <GoogleOauthButton label="Sign up" />

           {/* DIVIDER */}
           <div className="relative flex items-center justify-center w-full">
             <div className="absolute inset-x-0 h-px bg-[#666666] rounded-md"></div>

             <span className="relative z-10 px-2.5 bg-[#141414] text-sm font-normal leading-[150%] tracking-[0.01em] text-[#BFBFBF]">
               Or Continue with
             </span>
           </div>

           {/* FORM */}
           <form 
             onSubmit={handleSubmit(onSubmit)}
             className="flex flex-col gap-7 gap- w-full"
            >

             {/* Name Field */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="name"
                  className={`font-semibold text-[16px] leading-[160%] ${
                    errors.name ? "text-red-500" : "text-[#F2F2F2]"
                  }`}
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  {...register("name")}
                  placeholder="Enter your Name"
                  className={`py-[16px] w-full px-4 bg-[#1A1A1A] border ${
                    errors.name ? "border-red-500" : "border-[rgba(255,255,255,0.1)]"
                  } rounded-[12px] shadow-[inset_0px_8px_18px_rgba(0,0,0,0.18)] text-[14px] font-normal leading-[150%] text-[#F2F2F2] placeholder-[#F2F2F2] focus:outline-none  focus:border-white-300 focus:ring-2 focus:ring-white-200/40`}
                />
                {errors.name && <p className="text-red-500 text-[14px]">{errors.name.message}</p>}
              </div>
            
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
                 className={`py-[16px] w-full px-4 bg-[#1A1A1A] border ${
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

               {/* INPUT WRAPPER */}
               <div className="relative">
                 <input
                   id="password"
                   type={showPassword ? "text" : "password"}
                   {...register("password")}
                   placeholder="Enter your Password"
                   className={`${inputBase} border ${
                     errors.email ? "border-red-500" : "border-[rgba(255,255,255,0.1)]"
                   }`}
                 />

                 <button
                   type="button"
                   onClick={() => setShowPassword(!showPassword)}
                   className="absolute right-4 top-1/2 -translate-y-1/2 text-[#BFBFBF] hover:text-white"
                 >
                   {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                 </button>
               </div>

               {errors.password && (
                 <p className="text-red-500 text-[14px]">{errors.password.message}</p>
               )}
             </div>

             {/* Confirm Password Field */}
             <div className="flex flex-col gap-1">
               <label
                 htmlFor="confirmPassword"
                 className={`font-semibold text-[16px] leading-[160%] ${
                   errors.confirmPassword ? "text-red-500" : "text-[#F2F2F2]"
                 }`}
               >
                 Confirm your Password
               </label>

               {/* INPUT WRAPPER */}
               <div className="relative">
                 <input
                   id="confirmPassword"
                   type={showPassword ? "text" : "password"}
                   {...register("confirmPassword")}
                   placeholder="Confirm your Password"
                   className={`${inputBase} ${
                     errors.email ? "border-red-500" : "border-[rgba(255,255,255,0.1)]"
                   }`}
                 />

                 <button
                   type="button"
                   onClick={() => setShowPassword(!showPassword)}
                   className="absolute right-4 top-1/2 -translate-y-1/2 text-[#BFBFBF] hover:text-white"
                 >
                   {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                 </button>
               </div>

               {errors.confirmPassword && (
                 <p className="text-red-500 text-[14px]">{errors.confirmPassword.message}</p>
               )}
             </div>

             {/* Register Button */}
             <button
               type="submit"
               disabled={isPending}
               className="flex justify-center items-center py-[12px] w-full bg-[#CCCCCC] border border-[rgba(0,0,0,0.1)] rounded-[12px] shadow-[0px_8px_5px_#000000,inset_0px_12px_14px_rgba(255,255,255,0.87)] font-medium text-[20px] leading-[165%] text-[#080808] hover:bg-gray-300 transition sm:text-16"
             >
               {isPending && <Loader className="animate-spin mr-2" />}
               {isPending ? "Registering..." : "Register"}
             </button>
           </form>
         </div>
       </div>
    </div>
  );
}
