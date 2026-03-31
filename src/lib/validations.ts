import { z } from "zod";

// Password: 8+ chars, 1 uppercase, 1 lowercase, 1 digit, 1 special character
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\#^()\-_=+])[A-Za-z\d@$!%*?&\#^()\-_=+]{8,}$/;

// Stricter email regex
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const signupSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes")
    .trim(),
  email: z
    .string()
    .regex(emailRegex, "Please enter a valid email address")
    .max(100, "Email must be at most 100 characters")
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be at most 100 characters")
    .regex(
      passwordRegex,
      "Password must include uppercase, lowercase, number, and special character"
    ),
});

export const loginSchema = z.object({
  email: z
    .string()
    .regex(emailRegex, "Please enter a valid email address")
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(1, "Password is required"),
});

export const otpSchema = z.object({
  email: z
    .string()
    .regex(emailRegex, "Invalid email")
    .trim()
    .toLowerCase(),
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only digits"),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OtpInput = z.infer<typeof otpSchema>;

export const tagSchema = z
  .string()
  .min(1, "Tag cannot be empty")
  .max(30, "Tag must be at most 30 characters")
  .regex(/^[a-zA-Z0-9\s#+-.]+$/, "Tag contains invalid characters")
  .trim();

export const courseSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be at most 100 characters")
    .trim(),
  url: z
    .string()
    .url("Must be a valid URL")
    .trim(),
  platform: z
    .string()
    .min(2, "Platform must be at least 2 characters")
    .max(50, "Platform name is too long")
    .trim(),
  tags: z.array(tagSchema).min(1, "At least one tag is required").max(10, "Maximum 10 tags allowed").default([]),
});

export const userUpdateSchema = z.object({
  interests: z.array(tagSchema).optional(),
  completedCourses: z.array(tagSchema).optional(),
});

export const emailSchema = z.object({
  email: z
    .string()
    .regex(emailRegex, "Invalid email")
    .trim()
    .toLowerCase(),
});

export const courseFormSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be at most 100 characters")
    .trim(),
  url: z
    .string()
    .url("Must be a valid URL")
    .trim(),
  platform: z
    .string()
    .min(2, "Platform must be at least 2 characters")
    .max(50, "Platform name is too long")
    .trim(),
  tags: z
    .string()
    .transform((val) => val.split(",").map((tag) => tag.trim()).filter(Boolean))
    .pipe(z.array(tagSchema).min(1, "At least one valid tag is required").max(10, "Maximum 10 tags allowed")),
});

export type TagInput = z.infer<typeof tagSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type CourseFormInput = z.input<typeof courseFormSchema>;
export type CourseFormOutput = z.infer<typeof courseFormSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type EmailInput = z.infer<typeof emailSchema>;



