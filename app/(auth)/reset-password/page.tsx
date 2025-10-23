"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import InputField from "@/components/forms/inputField";
import FooterLink from "@/components/forms/FooterLink";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/schemas";
import { forgotPassword } from "@/lib/actions/auth.actions";
import { toast } from "sonner";

const ForgotPasswordPage = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onBlur",
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPassword(data);
      setIsSubmitted(true);
      toast.success("Reset link sent!", {
        description: "Check your email for password reset instructions.",
      });
    } catch (error) {
      console.error("Error:", error);
      setIsSubmitted(true); // Still show success for security
    }
  };

  // After the form is submitted, show a confirmation message
  if (isSubmitted) {
    return (
      <div className="text-center space-y-6">
        <h1 className="form-title">Request Sent</h1>
        <p>
          If an account with that email exists, we&apos;ve sent a link to reset
          your password.
        </p>
        <FooterLink text="Back to" linkText="Sign In" href="/sign-in" />
      </div>
    );
  }

  // The initial form view
  return (
    <>
      <h1 className="form-title">Reset Your Password</h1>
      <p className="text-center text-muted-foreground -mt-4 mb-6">
        Enter your email and we&apos;ll send you a reset link.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <InputField
          name="email"
          label="Email"
          placeholder="your@email.com"
          type="email"
          register={register}
          error={errors.email}
        />
        <Button
          type="submit"
          disabled={isSubmitting}
          className="yellow-btn w-full"
        >
          {isSubmitting ? "Sending..." : "Send Reset Link"}
        </Button>
        <FooterLink
          text="Remembered your password?"
          linkText="Sign In"
          href="/sign-in"
        />
      </form>
    </>
  );
};

export default ForgotPasswordPage;
