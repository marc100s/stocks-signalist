"use client";

// biome-ignore assist/source/organizeImports: <Example of suppression: // biome-ignore lint: false positive>
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";

import InputField from "@/components/forms/inputField";
import SelectField from "@/components/forms/SelectField";
import { CountrySelectField } from "@/components/forms/CountrySelectField";
import {
  INVESTMENT_GOALS,
  PREFERRED_INDUSTRIES,
  RISK_TOLERANCE_OPTIONS,
} from "@/lib/constants";
import FooterLink from "@/components/forms/FooterLink";
import { signUpWithEmail } from "@/lib/actions/auth.actions";
import { toast } from "sonner"; // ✅ add this (or your toast lib)
import { signUpSchema, type SignUpFormData } from "@/lib/schemas";

const SignUp = () => {
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const isDevelopment = process.env.NODE_ENV === "development";

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      country: "",
      investmentGoals: "",
      riskTolerance: "",
      preferredIndustry: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: SignUpFormData) => {
    try {
      const result = await signUpWithEmail(data);

      if (result.success) {
        if (isDevelopment) {
          // In development, auto sign-in is enabled, so redirect directly
          toast.success("Account created successfully!", {
            description: "You can now access your dashboard.",
          });
          window.location.href = "/";
        } else {
          // In production, show email verification message
          setShowVerificationMessage(true);
          toast.success("Account created successfully!", {
            description: "Please check your email to verify your account.",
          });
        }
      } else {
        toast.error("Sign up failed. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Sign up failed. Please try again.", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to create an account",
      });
    }
  };

  return (
    <>
      <h1 className="form-title">Sign Up & Personalize</h1>

      {showVerificationMessage ? (
        <div className="space-y-5 text-center">
          <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <title>Success</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-white">
            Check Your Email!
          </h2>
          <p className="text-gray-400">
            We&apos;ve sent a verification link to your email address. Please
            check your inbox and click the link to verify your account.
          </p>
          <p className="text-sm text-gray-500">
            Didn&apos;t receive the email? Check your spam folder or contact
            support.
          </p>
          <FooterLink
            text="Already verified?"
            linkText="Sign in"
            href="/sign-in"
          />
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <InputField
            name="fullName"
            label="Full Name"
            placeholder="John Doe"
            register={register}
            error={errors.fullName}
          />

          <InputField
            name="email"
            label="Email"
            placeholder="contact@contact.com"
            register={register}
            error={errors.email}
          />

          <InputField
            name="password"
            label="Password"
            placeholder="Enter a strong password"
            type="password"
            register={register}
            error={errors.password}
          />

          <CountrySelectField
            name="country"
            label="Country"
            control={control}
            error={errors.country}
          />

          <SelectField
            name="investmentGoals"
            label="Investment Goals"
            placeholder="Select your investment goal"
            options={INVESTMENT_GOALS}
            control={control}
            error={errors.investmentGoals}
            required
          />

          <SelectField
            name="riskTolerance"
            label="Risk Tolerance"
            placeholder="Select your risk level"
            options={RISK_TOLERANCE_OPTIONS}
            control={control}
            error={errors.riskTolerance}
            required
          />

          <SelectField
            name="preferredIndustry"
            label="Preferred Industry"
            placeholder="Select your preferred industry"
            options={PREFERRED_INDUSTRIES}
            control={control}
            error={errors.preferredIndustry}
            required
          />

          <Button
            type="submit"
            disabled={isSubmitting}
            className="yellow-btn w-full mt-5"
          >
            {isSubmitting
              ? "Creating Account..."
              : "Start Your Investing Journey"}
          </Button>

          <FooterLink
            text="Already have an account?"
            linkText="Sign in"
            href="/sign-in"
          />
        </form>
      )}
    </>
  );
};

export default SignUp;
