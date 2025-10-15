"use server";

import { auth } from "@/lib/better-auth/auth";
import { inngest } from "@/lib/inngest/client";
import { headers } from "next/headers";

export const signUpWithEmail = async ({
  email,
  password,
  fullName,
  country,
  investmentGoals,
  riskTolerance,
  preferredIndustry,
}: SignUpFormData) => {
  try {
    const authInstance = await auth;

    const response = await authInstance.api.signUpEmail({
      body: { email, password, name: fullName },
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
    return { success: false, message: "Sign up failed" };
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

export const signInWithEmail = async ({ email, password }: SignInFormData) => {
  try {
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
    console.error("Error signing in", e);
    return {
      success: false,
      message:
        "Sign in failed. Try again. If it persists, reset password for security",
    };
  }
};
