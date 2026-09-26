import { z } from "zod";

export const userSchema = z.object({
  firstname: z
    .string()
    .min(3, "First name must be at least 3 characters.")
    .max(10, "Firstname cannot be more than 10 characters."),
  lastname: z
    .string()
    .min(3, "Last name must be at least 3 characters.")
    .max(10, "Lastname cannot be more than 10 characters."),
  email: z.email("Invalid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(16, "Password cannot be more than 16 characters"),
  type: z.string(),
  gender: z.enum(["male", "female"]),
});

export const loginRequestSchema = z.object({
  email: z.email("Invalid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(16, "Password cannot be more than 16 characters"),
});

export const jobPostSchema = z.object({
  title: z
    .string()
    .min(6, "Title must be at least 6 characters")
    .max(50, "Title cannot be more than 16 characters"),
  empType: z.enum([
    "full-time",
    "part-time",
    "internship",
    "contract",
    "freelance",
  ]),
  workMode: z.enum(["on-site", "remote", "hybrid"]),
  summary: z
    .string()
    .min(20, "Summary must be at least 20 characters")
    .max(300, "Summary cannot be more than 300 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(3500, "Description cannot be more than 3500 characters"),
  salary: z
    .object({
      currency: z.enum(["USD", "LKR", "AUD"]),
      min: z.number().min(0, "Minimum salary cannot be negative"),
      max: z.number().min(0, "Maximum salary cannot be negative"),
    })
    .refine((data) => data.max >= data.min, {
      message: "Max salary must be greater than or equal to min salary",
      path: ["max"],
    }),
  companyID: z.string(),
});

export const jobPostUpdateSchema = z.object({
  title: z
    .string()
    .min(6, "Title must be at least 6 characters")
    .max(50, "Title cannot be more than 16 characters"),
  empType: z.enum([
    "full-time",
    "part-time",
    "internship",
    "contract",
    "freelance",
  ]),
  workMode: z.enum(["on-site", "remote", "hybrid"]),
  summary: z
    .string()
    .min(20, "Summary must be at least 20 characters")
    .max(400, "Summary cannot be more than 400 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(3500, "Description cannot be more than 3500 characters"),
  salary: z
    .object({
      currency: z.enum(["USD", "LKR", "AUD"]),
      min: z.number().min(0, "Minimum salary cannot be negative"),
      max: z.number().min(0, "Maximum salary cannot be negative"),
    })
    .refine((data) => data.max >= data.min, {
      message: "Max salary must be greater than or equal to min salary",
      path: ["max"],
    }),
});

export const companySchema = z.object({
  name: z
    .string()
    .min(1, "Name must be at least 1 character")
    .max(50, "Name cannot be more than 70 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(120, "Description cannot be more than 1200 characters"),
  email: z.email("Invalid email address."),
  username: z
    .string()
    .min(3, "Username name must be at least 2 characters.")
    .max(10, "Username cannot be more than 10 characters."),
  location: z.string(),
  website: z.union([z.url(), z.literal("")]).optional(),
  twitter: z.union([z.url(), z.literal("")]).optional(),
  linkedin: z.union([z.url(), z.literal("")]).optional(),
  facebook: z.union([z.url(), z.literal("")]).optional(),
  file: z
    .union([
      z
        .instanceof(File, { message: "Logo is required" })
        .refine((file) => !file || (file.size !== 0 && file.size <= 5000000), {
          message: "Max file size exceeded",
        }),
    ])
    .refine((value) => value instanceof File || typeof value === "string", {
      message: "Logo is required",
    })
    .optional(),
});

export const applicationSchema = z.object({
  companyID: z.string(),
  postID: z.string(),
  file: z
    .union([
      z
        .instanceof(File, { message: "Resume/CV is required" })
        .refine((file) => !file || (file.size !== 0 && file.size <= 5000000), {
          message: "Max file size exceeded",
        }),
    ])
    .refine((value) => value instanceof File || typeof value === "string", {
      message: "Resume/CV is required",
    })
    .optional(),
});

export const jobSearchSchema = z.object({
  q: z.string(),
  workMode: z.enum(["on-site", "remote", "hybrid", ""]).optional(),
  empType: z
    .enum(["full-time", "part-time", "internship", "contract", "freelance", ""])
    .optional(),
  createdAt: z.string().optional(),
  minSalary: z
    .number()
    .min(0, "Minimum salary cannot be less than 0")
    .optional(),
  maxSalary: z
    .number()
    .min(0, "Maximum salary cannot be less than 0")
    .optional(),
  currency: z.string().optional(),
  page: z.number().min(1),
  location : z.string().optional()
});
