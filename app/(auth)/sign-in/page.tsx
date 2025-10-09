"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import InputField from "@/components/forms/inputField";
import FooterLink from "@/components/forms/FooterLink";

const SignInPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: SignInFormData) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(data);
  };

  return (
    <>
      <h1 className="form-title">Welcome Back!</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <InputField
          name="email"
          label="Email"
          placeholder="your@email.com"
          type="email"
          register={register}
          error={errors.email}
          validation={{
            required: "Email is required",
            pattern: {
              value: /^\S+@\S+\.\S+$/,
              message: "Please enter a valid email address",
            },
          }}
        />

        <div className="space-y-2">
          <InputField
            name="password"
            label="Password"
            placeholder="Enter your password"
            type="password"
            register={register}
            error={errors.password}
            validation={{
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            }}
          />
          <div className="flex justify-end">
            <FooterLink
              text="Forgot password?"
              linkText="Reset"
              href="/reset-password"
              className="text-sm"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="yellow-btn w-full"
        >
          {isSubmitting ? "Signing In..." : "Sign In"}
        </Button>

        <FooterLink
          text="Don't have an account?"
          linkText="Sign Up"
          href="/sign-up"
        />
      </form>
    </>
  );
};

export default SignInPage;
