"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { toast } from "sonner";

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

type FormValues = z.infer<typeof formSchema>;

export default function SignUpPage() {
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await API.post("/user/register", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Account created successfully!");
      router.push("/");
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || "Something went wrong!";
      toast.error(message);
    },
  });

  const onSubmit = async (data: FormValues) => {

    if (!isPending) return
    try {
      const response = await API.post("/user/register", data);
      toast.success("Registration successful!");
    } catch (error) {
    }
  };

  return (
  );
}
