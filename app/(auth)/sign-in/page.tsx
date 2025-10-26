"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import InputField from "@/components/forms/inputField";
import FooterLink from "@/components/forms/FooterLink";
import { toast } from "sonner";
import { signInWithEmail, sendMagicLink } from "@/lib/actions/auth.actions";
import { useRouter } from "next/navigation";
import { signInSchema, type SignInFormData } from "@/lib/schemas";
import { useState } from "react";
import { Mail } from "lucide-react";

const SignInPage = () => {
  const router = useRouter();
  const [magicLinkEmail, setMagicLinkEmail] = useState("");
  const [sendingMagicLink, setSendingMagicLink] = useState(false);

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

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!magicLinkEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(magicLinkEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSendingMagicLink(true);
    try {
      const result = await sendMagicLink(magicLinkEmail);
      if (result.success) {
        toast.success("Magic link sent!", {
          description:
            "Check your email for the sign-in link. It expires in 5 minutes.",
        });
        setMagicLinkEmail("");
      } else {
        toast.error("Failed to send magic link", {
          description: result.message || "Please try again.",
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to send magic link", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setSendingMagicLink(false);
    }
  };

  return (
    <>
      <h1 className="form-title">Welcome Back!</h1>

      {/* Traditional Email/Password Sign In */}
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
      </form>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-background-dark px-4 text-gray-400">OR</span>
        </div>
      </div>

      {/* Magic Link Sign In */}
      <form onSubmit={handleMagicLink} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="magic-link-email" className="form-label">
            Sign in without password
          </label>
          <input
            id="magic-link-email"
            type="email"
            value={magicLinkEmail}
            onChange={(e) => setMagicLinkEmail(e.target.value)}
            placeholder="your@email.com"
            className="form-input w-full"
            disabled={sendingMagicLink}
          />
          <p className="text-xs text-gray-400">
            We&apos;ll send you a secure link to sign in instantly
          </p>
        </div>

        <Button
          type="submit"
          disabled={sendingMagicLink}
          variant="outline"
          className="w-full border-yellow-400 text-yellow-400 hover:bg-yellow-400/10"
        >
          {sendingMagicLink ? (
            "Sending..."
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Send Magic Link
            </>
          )}
        </Button>
      </form>

      <div className="mt-6">
        <FooterLink
          text="Don't have an account?"
          linkText="Sign Up"
          href="/sign-up"
        />
      </div>
    </>
  );
};

export default SignInPage;
