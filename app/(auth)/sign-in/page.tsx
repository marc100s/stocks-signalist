"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import InputField from "@/components/forms/inputField";
import FooterLink from "@/components/forms/FooterLink";
import { toast } from "sonner";
import { signInWithEmail } from "@/lib/actions/auth.actions";
import { useRouter } from "next/navigation";
import { signInSchema, type SignInFormData } from "@/lib/schemas";

const SignInPage = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: SignInFormData) => {
    try {
      const result = await signInWithEmail(data);
      if (result.success) {
        router.push("/");
        toast.success("Signed in successfully!");
      } else {
        // Show error toast when sign in fails
        toast.error("Sign in failed", {
          description:
            result.message || "Invalid email or password. Please try again.",
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Sign in failed", {
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.",
      });
    }
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
        />

        <div className="space-y-2">
          <InputField
            name="password"
            label="Password"
            placeholder="Enter your password"
            type="password"
            register={register}
            error={errors.password}
          />
          <div className="flex justify-end">
            <FooterLink
              text="Forgot password?"
              linkText="Reset"
              href="/reset-password"
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
