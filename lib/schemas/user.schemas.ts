import { z } from "zod";

// -----------------------------
// Alert Schemas
// -----------------------------

export const alertDataSchema = z.object({
  symbol: z.string().min(1, "Symbol is required").toUpperCase(),
  company: z.string().min(1, "Company name is required"),
  alertName: z.string().min(1, "Alert name is required").max(100),
  alertType: z.enum(["upper", "lower"], {
    message: "Alert type must be either 'upper' or 'lower'",
  }),
  threshold: z.string().min(1, "Threshold is required"),
});

export const alertSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  company: z.string(),
  alertName: z.string(),
  currentPrice: z.number().nonnegative(),
  alertType: z.enum(["upper", "lower"]),
  threshold: z.number().nonnegative(),
  changePercent: z.number().optional(),
});

// -----------------------------
// User Schemas
// -----------------------------

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

export const userForNewsEmailSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  country: z.string().optional(),
});

export const welcomeEmailDataSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  intro: z.string(),
});

// -----------------------------
// Type Inference from Schemas
// -----------------------------

export type AlertData = z.infer<typeof alertDataSchema>;
export type Alert = z.infer<typeof alertSchema>;
export type User = z.infer<typeof userSchema>;
export type UserForNewsEmail = z.infer<typeof userForNewsEmailSchema>;
export type WelcomeEmailData = z.infer<typeof welcomeEmailDataSchema>;
