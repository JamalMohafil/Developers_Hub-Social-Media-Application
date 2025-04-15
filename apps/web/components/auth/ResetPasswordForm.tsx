"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Lock, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordAction } from "@/actions/auth/resetPassword.action";

export default function ResetPasswordForm({
  token,
  isTokenValid,
}: {
  token: string;
  isTokenValid: boolean;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(resetPasswordAction, {
    pending: false,
    errors: {},
    message: "",
    success: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect to sign in page if password reset was successful
  useEffect(() => {
    if (state.success) {
      router.push("/signin");
    }
  }, [state.success, router]);

  // If token is invalid, show error message
  if (!isTokenValid) {
    return (
      <div className="flex w-full flex-col items-center justify-center min-h-screen bg-slate-950 p-4">
        <div className="max-w-lg w-full p-6 bg-slate-900 border border-slate-800 rounded-lg shadow-xl">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-red-500/20 p-3 rounded-xl mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-red-500">Token Expired</h1>
            <p className="text-slate-400 mt-2 text-center">
              Your password reset link has expired. Please request a new one.
            </p>
          </div>

          <Button
            variant="default"
            className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-medium py-2.5 rounded-md transition-colors"
            onClick={() => router.push("/")}
          >
            Return to Home Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center justify-center min-h-screen bg-slate-950 p-4">
      <div className="max-w-lg w-full mx-auto">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-emerald-500 p-3 rounded-xl mb-4">
            <Lock className="h-8 w-8 text-slate-900" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 text-transparent bg-clip-text">
            Developers Hub
          </h1>
          <p className="text-slate-500 mt-2">Reset your password</p>
        </div>

        <form
          action={action}
          className="space-y-5 w-full p-6 bg-slate-900 border border-slate-800 rounded-lg shadow-xl"
        >
          {/* Hidden token field */}
          <input type="hidden" name="token" value={token} />

          {state.message && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-500 text-sm">{state.message}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-300">
              New Password
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Enter your new password"
                required
                minLength={8}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-slate-300"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
            {state.errors?.password && (
              <p className="text-red-500 text-sm mt-1">
                {state.errors.password}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-slate-300">
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your new password"
                required
                minLength={8}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-slate-300"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {showConfirmPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
            {state.errors?.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {state.errors.confirmPassword}
              </p>
            )}
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-medium py-2.5 rounded-md transition-colors"
              disabled={pending}
            >
              {pending ? (
                <>
                  <span className="mr-2">Updating...</span>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Set New Password
                </>
              )}
            </Button>
          </div>

          <div className="text-center mt-4 text-sm text-slate-500">
            Remember your password?{" "}
            <a
              href="/signin"
              className="text-emerald-400 hover:text-emerald-300"
            >
              Sign in
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
