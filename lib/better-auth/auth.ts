// biome-ignore assist/source/organizeImports: <Example of suppression: // biome-ignore lint: false positive>
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { connectToDatabase } from "@/database/mongoose";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins";
import type { Db } from "mongodb";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendMagicLinkEmail,
} from "@/lib/nodemailer";

let authInstance: ReturnType<typeof betterAuth> | null = null;
let initPromise: Promise<ReturnType<typeof betterAuth>> | null = null;

const isDevelopment = process.env.NODE_ENV === "development";

// Determine the base URL based on environment
const getBaseURL = () => {
  // In production, use the production URL
  if (!isDevelopment && process.env.BETTER_AUTH_URL) {
    return process.env.BETTER_AUTH_URL;
  }

  // In development, use localhost or NEXT_PUBLIC_BASE_URL
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
};

export const getAuth = async () => {
  if (authInstance) {
    return authInstance;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;

    if (!db) {
      throw new Error("Database connection failed");
    }

    const baseURL = getBaseURL();

    // Log only in development to avoid noisy builds
    if (isDevelopment) {
      console.log(`🔐 Better Auth initializing with baseURL: ${baseURL}`);
    }

    const instance = betterAuth({
      database: mongodbAdapter(db as Db),
      secret: process.env.BETTER_AUTH_SECRET,
      baseURL,
      emailAndPassword: {
        enabled: true,
        requireEmailVerification: !isDevelopment,
        autoSignIn: isDevelopment,
      },
      emailVerification: {
        sendOnSignUp: !isDevelopment,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url, token }) => {
          try {
            // Log in all environments for debugging
            console.log("\n" + "=".repeat(80));
            console.log(
              `📧 EMAIL VERIFICATION (${
                isDevelopment ? "Development" : "Production"
              } Mode)`
            );
            console.log("=".repeat(80));
            console.log("To:", user.email);
            console.log("Name:", user.name || "User");
            console.log("Verification URL:", url);
            console.log("Token:", token);
            console.log("URL includes token:", url.includes("token="));
            console.log("=".repeat(80) + "\n");

            if (isDevelopment) {
              // In development, just log
              return;
            }

            // In production, send actual email
            await sendVerificationEmail({
              email: user.email,
              name: user.name || "User",
              verificationUrl: url,
            });

            console.log(
              "✅ Verification email sent successfully to:",
              user.email
            );
          } catch (error) {
            console.error("❌ Error sending verification email:", error);
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
            console.log("\n" + "=".repeat(80));
            console.log(
              `🔐 PASSWORD RESET (${
                isDevelopment ? "Development" : "Production"
              } Mode)`
            );
            console.log("=".repeat(80));
            console.log("To:", user.email);
            console.log("Reset URL:", url);
            console.log("=".repeat(80) + "\n");

            if (isDevelopment) {
              return;
            }

            await sendPasswordResetEmail({
              email: user.email,
              name: user.name || "User",
              resetUrl: url,
            });

            console.log(
              "✅ Password reset email sent successfully to:",
              user.email
            );
          } catch (error) {
            console.error("❌ Error sending password reset email:", error);
            throw error;
          }
        },
      },
      account: {
        accountLinking: {
          enabled: false,
        },
      },
      session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
      },
      plugins: [
        nextCookies(),
        magicLink({
          expiresIn: 60 * 5, // 5 minutes
          disableSignUp: false, // Allow auto sign-up for new users
          async sendMagicLink({ email, url, token }) {
            try {
              console.log("\n" + "=".repeat(80));
              console.log(
                `🔐 MAGIC LINK (${
                  isDevelopment ? "Development" : "Production"
                } Mode)`
              );
              console.log("=".repeat(80));
              console.log("To:", email);
              console.log("Magic Link URL:", url);
              console.log("Token:", token);
              console.log("URL includes token:", url.includes("token="));
              console.log("=".repeat(80) + "\n");

              if (isDevelopment) {
                // In development, just log the link
                return;
              }

              // In production, send actual email
              await sendMagicLinkEmail({
                email,
                magicLinkUrl: url,
              });

              console.log("✅ Magic link sent successfully to:", email);
            } catch (error) {
              console.error("❌ Error sending magic link:", error);
              throw error;
            }
          },
        }),
      ],
    });

    authInstance = instance;
    initPromise = null;
    return instance;
  })();

  return initPromise;
};
