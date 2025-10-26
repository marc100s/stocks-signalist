"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");
      const callbackURL = searchParams.get("callbackURL") || "/";

      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link. No token provided.");
        return;
      }

      try {
        // Better Auth verify-email endpoint expects GET with query params
        const verifyURL = new URL(
          "/api/auth/verify-email",
          window.location.origin
        );
        verifyURL.searchParams.set("token", token);
        verifyURL.searchParams.set("callbackURL", callbackURL);

        const response = await fetch(verifyURL.toString(), {
          method: "GET",
          redirect: "manual", // Don't follow redirects automatically
        });

        // Better Auth redirects on success (status 307/302)
        if (response.status === 307 || response.status === 302 || response.ok) {
          setStatus("success");
          setMessage("Your email has been verified successfully!");

          // Redirect to sign-in after 2 seconds
          setTimeout(() => {
            router.push("/sign-in");
          }, 2000);
        } else {
          // Try to parse error message
          let errorMessage = "Verification failed. The link may have expired.";
          try {
            const data = await response.json();
            if (data.message) errorMessage = data.message;
          } catch {
            // If response isn't JSON, use default message
          }

          setStatus("error");
          setMessage(errorMessage);
        }
      } catch (error) {
        setStatus("error");
        setMessage("An error occurred during verification. Please try again.");
        console.error("Verification error:", error);
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto" />
            <h1 className="text-2xl font-semibold text-white">
              Verifying your email...
            </h1>
            <p className="text-gray-400">
              Please wait while we verify your account.
            </p>
          </>
        )}

        {status === "success" && (
          <>
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-white">
              Email Verified!
            </h1>
            <p className="text-gray-400">{message}</p>
            <p className="text-sm text-gray-500">
              Redirecting you to sign in...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <title>Error</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-white">
              Verification Failed
            </h1>
            <p className="text-gray-400">{message}</p>
            <div className="flex flex-col gap-3 mt-6">
              <Button
                onClick={() => router.push("/sign-in")}
                className="yellow-btn w-full"
              >
                Go to Sign In
              </Button>
              <Button
                onClick={() => router.push("/sign-up")}
                variant="outline"
                className="w-full"
              >
                Create New Account
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
