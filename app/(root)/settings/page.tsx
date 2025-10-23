"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import InputField from "@/components/forms/inputField";
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from "@/lib/schemas";
import { changePassword } from "@/lib/actions/auth.actions";
import { toast } from "sonner";

const SettingsPage = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      const result = await changePassword(
        data.currentPassword,
        data.newPassword
      );

      if (result.success) {
        toast.success("Password updated!", {
          description: "Your password has been changed successfully.",
        });
        reset(); // Clear the form
      } else {
        toast.error("Update failed", {
          description: result.message || "Please check your current password.",
        });
      }
    } catch (error) {
      console.error("Change password error:", error);
      toast.error("Something went wrong", {
        description: "Please try again later.",
      });
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

      {/* Change Password Section */}
      <div className="bg-card rounded-lg border p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Update your password to keep your account secure.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <InputField
            name="currentPassword"
            label="Current Password"
            placeholder="••••••••"
            type="password"
            register={register}
            error={errors.currentPassword}
          />
          <InputField
            name="newPassword"
            label="New Password"
            placeholder="••••••••"
            type="password"
            register={register}
            error={errors.newPassword}
          />
          <div className="text-xs text-muted-foreground space-y-1 mb-4">
            <p>New password must contain:</p>
            <ul className="list-disc list-inside pl-2 space-y-0.5">
              <li>At least 8 characters</li>
              <li>One uppercase letter</li>
              <li>One lowercase letter</li>
              <li>One number</li>
            </ul>
          </div>
          <Button type="submit" disabled={isSubmitting} className="yellow-btn">
            {isSubmitting ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>

      {/* Account Info Section */}
      <div className="bg-card rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
        <p className="text-sm text-muted-foreground mb-4">
          To change your email address, please contact support.
        </p>
        <div className="text-xs text-muted-foreground">
          <p>
            Email changes require verification and are handled by our support
            team to ensure account security.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
