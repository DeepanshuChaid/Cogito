import { z } from "zod";
export const loginUserSchema = z.object({
    email: z.string().email().trim(),
    password: z.string().min(6, "Password must be at least 6 characters").trim()
});
export const registerUserSchema = z.object({
    name: z.string().min(1, "Name is Required").trim().refine((val) => !val.includes(" "), {
        message: "Organization name cannot contain spaces",
    }),
    email: z.string().email().trim(),
    password: z.string().min(6, "Password must be at least 6 characters").trim()
});
