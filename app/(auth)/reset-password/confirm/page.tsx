"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import InputField from "@/components/forms/inputField";
import FooterLink from "@/components/forms/FooterLink";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/schemas";
import { resetPassword } from "@/lib/actions/auth.actions";
import { toast } from "sonner";

const ResetPasswordConfirmPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [tokenError, setTokenError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setTokenError("Invalid or missing reset token.");
    }
  }, [token]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: token || "", newPassword: "" },
    mode: "onBlur",
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      const result = await resetPassword(data.token, data.newPassword);

      if (result.success) {
        toast.success("Password reset successful!", {
          description: "You can now sign in with your new password.",
        });
        router.push("/sign-in");
      } else {
        toast.error("Reset failed", {
          description: result.message || "An error occurred. Please try again.",
        });
      }
    } catch (error) {
      console.error("Reset error:", error);
      toast.error("Something went wrong", {
        description: "Please request a new reset link.",
      });
    }
  };

  if (tokenError) {
    return (
      <div className="text-center space-y-6">
        <h1 className="form-title text-red-500">Invalid Link</h1>
        <p>{tokenError}</p>
        <p className="text-sm text-muted-foreground">
          Reset links expire after 1 hour. Please request a new one.
        </p>
        <FooterLink
          text="Request a new"
          linkText="Reset Link"
          href="/reset-password"
        />
      </div>
    );
  }

  return (
    <>
      <h1 className="form-title">Set New Password</h1>
      <p className="text-center text-muted-foreground -mt-4 mb-6">
        Enter your new password below.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <input type="hidden" {...register("token")} value={token || ""} />
        <InputField
          name="newPassword"
          label="New Password"
          placeholder="••••••••"
          type="password"
          register={register}
          error={errors.newPassword}
        />
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Password must contain:</p>
          <ul className="list-disc list-inside pl-2 space-y-0.5">
            <li>At least 8 characters</li>
            <li>One uppercase letter</li>
            <li>One lowercase letter</li>
            <li>One number</li>
          </ul>
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="yellow-btn w-full"
        >
          {isSubmitting ? "Resetting..." : "Reset Password"}
        </Button>
        <FooterLink text="Back to" linkText="Sign In" href="/sign-in" />
      </form>
    </>
  );
};

export default ResetPasswordConfirmPage;
