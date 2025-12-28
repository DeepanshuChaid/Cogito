"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { toast } from "react-hot-toast";

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

const formSchema = z.object({
  email: z.string().email("Invalid email").trim(),
  password: z.string().min(6, "Password must be at least 6 characters").trim(),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await API.post("/user/login", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Logged in successfully!");
      router.push("/");
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message || "Something went wrong!";
      toast.error(message);
    },
  });

  const onSubmit = (data: FormValues) => {
    mutate(data);
  };

  return (
    <div className="bg-neutral-950 flex flex-col overflow-y-auto min-h-screen">
      {/* Center content vertically on large screens, scroll on small */}
      <div className="flex flex-1 justify-center items-center py-10 px-4 sm:px-6 md:px-10">
        <div className="w-full max-w-md space-y-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-medium text-white justify-center"
          >
            Team Sync.
          </Link>

          <Card className="border-neutral-800 bg-neutral-900 text-white">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl sm:text-xl">Welcome back</CardTitle>
              <CardDescription className="text-neutral-400">
                Login with your Email
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm text-neutral-300">Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="m@example.com"
                            className="h-12 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm text-neutral-300">Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            className="h-12 bg-neutral-800 border-neutral-700 text-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-white text-black hover:bg-neutral-200 flex items-center justify-center"
                  >
                    {isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                    {isPending ? "Logging in..." : "Login"}
                  </Button>

                  <div className="text-center text-sm text-neutral-400">
                    Don't have an account?{" "}
                    <Link href="/signup" className="underline underline-offset-4 text-white">
                      Sign up
                    </Link>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="text-center text-xs text-neutral-500 [&_a]:underline [&_a]:underline-offset-4">
            By clicking continue, you agree to our{" "}
            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  );
}