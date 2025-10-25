"use server";

import { auth } from "@/lib/better-auth/auth";
import { inngest } from "@/lib/inngest/client";
import { headers } from "next/headers";
import {
  signUpSchema,
  signInSchema,
  forgotPasswordSchema,
} from "@/lib/schemas";

export const signUpWithEmail = async (data: unknown) => {
  try {
    // Validate incoming data with Zod
    const validatedData = signUpSchema.parse(data);

    const {
      email,
      password,
      fullName,
      country,
      investmentGoals,
      riskTolerance,
      preferredIndustry,
    } = validatedData;

    const authInstance = await auth;

    const response = await authInstance.api.signUpEmail({
      body: {
        email,
        password,
        name: fullName,
      },
    });

    if (response) {
      await inngest.send({
        name: "app/user.created",
        data: {
          email,
          name: fullName,
          country,
          investmentGoals,
          riskTolerance,
          preferredIndustry,
        },
      });
    }

    return { success: true, data: response };
  } catch (e) {
    console.error("Error signing up:", e);
    return {
      success: false,
      message: e instanceof Error ? e.message : "Sign up failed",
    };
  }
};

export const signOut = async () => {
  try {
    const authInstance = await auth;
    await authInstance.api.signOut({ headers: await headers() });
    return { success: true };
  } catch (e) {
    console.error("Error signing out:", e);
    return { success: false, message: "Sign out failed" };
  }
};

export const signInWithEmail = async (data: unknown) => {
  try {
    // Validate incoming data with Zod
    const validatedData = signInSchema.parse(data);
    const { email, password } = validatedData;

    const authInstance = await auth;

    const response = await authInstance.api.signInEmail({
      body: { email, password },
    });

    if (response) {
      await inngest.send({
        name: "app/user.signed-in",
        data: {
          email,
        },
      });
    }

    return { success: true, data: response };
  } catch (e) {
    // Log detailed error for debugging
    if (process.env.NODE_ENV === "development") {
      console.error("Error signing in", e);
    } else {
      // In production, log less verbose error
      console.error(
        "Sign in failed:",
        e instanceof Error ? e.message : "Unknown error"
      );
    }

    return {
      success: false,
      message:
        e instanceof Error
          ? e.message
          : "Sign in failed. Try again. If it persists, reset password for security",
    };
  }
};

export const forgotPassword = async (data: unknown) => {
  try {
    const validatedData = forgotPasswordSchema.parse(data);
    const { email } = validatedData;

    const authInstance = await auth;

    await authInstance.api.forgetPassword({
      body: { email, redirectTo: "/reset-password/confirm" },
    });

    return { success: true };
  } catch (e) {
    console.error("Error requesting password reset:", e);
    // Always return success for security (don't reveal if email exists)
    return { success: true };
  }
};

export const resetPassword = async (token: string, newPassword: string) => {
  try {
    const authInstance = await auth;

    await authInstance.api.resetPassword({
      body: { token, newPassword },
    });

    return { success: true };
  } catch (e) {
    console.error("Error resetting password:", e);
    return {
      success: false,
      message:
        e instanceof Error
          ? e.message
          : "Failed to reset password. The link may have expired.",
    };
  }
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string
) => {
  try {
    const authInstance = await auth;

    await authInstance.api.changePassword({
      body: { currentPassword, newPassword },
      headers: await headers(),
    });

    return { success: true };
  } catch (e) {
    console.error("Error changing password:", e);
    return {
      success: false,
      message: e instanceof Error ? e.message : "Failed to change password",
    };
  }
};

export const updateEmail = async (_newEmail: string) => {
  try {
    // Better Auth doesn't support direct email change, so we need to implement custom logic
    // For now, return not implemented
    return {
      success: false,
      message:
        "Email change is not currently supported. Please contact support.",
    };
  } catch (e) {
    console.error("Error updating email:", e);
    return {
      success: false,
      message: e instanceof Error ? e.message : "Failed to update email",
    };
  }
};

export const sendMagicLink = async (email: string) => {
  try {
    // Use the correct Better Auth API method for magic link
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/auth/sign-in/magic-link`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          callbackURL: "/",
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to send magic link");
    }

    return { success: true };
  } catch (e) {
    console.error("Error sending magic link:", e);
    return {
      success: false,
      message: e instanceof Error ? e.message : "Failed to send magic link",
    };
  }
};
