// biome-ignore assist/source/organizeImports: <Example of suppression: // biome-ignore lint: false positive>
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { connectToDatabase } from "@/database/mongoose";
import { nextCookies } from "better-auth/next-js";
import type { Db } from "mongodb";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "@/lib/nodemailer";

let authInstance: ReturnType<typeof betterAuth> | null = null;

const isDevelopment = process.env.NODE_ENV === "development";

export const getAuth = async () => {
  if (authInstance) {
    return authInstance;
  }

  const mongoose = await connectToDatabase();
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error("Database connection failed");
  }

  authInstance = betterAuth({
    database: mongodbAdapter(db as Db),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    emailAndPassword: {
      enabled: true,
      disableSignUp: false,
      requireEmailVerification: !isDevelopment, // Skip email verification in development
      minPasswordLength: 8,
      maxPasswordLength: 128,
      autoSignIn: isDevelopment, // Auto sign-in in development
      sendVerificationEmail: async ({
        user,
        url,
      }: {
        user: { email: string; name?: string };
        url: string;
      }) => {
        try {
          if (isDevelopment) {
            // In development, log the verification URL instead of sending email
            console.log("\n" + "=".repeat(80));
            console.log("📧 EMAIL VERIFICATION (Development Mode)");
            console.log("=".repeat(80));
            console.log("To:", user.email);
            console.log("Name:", user.name || "User");
            console.log("Verification URL:");
            console.log(url);
            console.log("=".repeat(80) + "\n");
            return;
          }

          // In production, send actual email
          await sendVerificationEmail({
            email: user.email,
            name: user.name || "User",
            verificationUrl: url,
          });
        } catch (error) {
          console.error("Error sending verification email:", error);
          throw error;
        }
      },
      sendResetPassword: async ({
        user,
        url,
      }: {
        user: { email: string; name?: string };
        url: string;
      }) => {
        try {
          if (isDevelopment) {
            // In development, log the reset URL instead of sending email
            console.log("\n" + "=".repeat(80));
            console.log("🔐 PASSWORD RESET (Development Mode)");
            console.log("=".repeat(80));
            console.log("To:", user.email);
            console.log("Name:", user.name || "User");
            console.log("Reset URL:");
            console.log(url);
            console.log("=".repeat(80) + "\n");
            return;
          }

          // In production, send actual email
          await sendPasswordResetEmail({
            email: user.email,
            name: user.name || "User",
            resetUrl: url,
          });
        } catch (error) {
          console.error("Error sending password reset email:", error);
          throw error;
        }
      },
    },
    plugins: [nextCookies()],
  });

  return authInstance;
};

export const auth = await getAuth();
