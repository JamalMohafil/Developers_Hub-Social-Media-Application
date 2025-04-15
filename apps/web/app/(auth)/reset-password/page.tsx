"use client";
import Link from "next/link";
import { Mail, AlertCircle, Code, ArrowRight } from "lucide-react";
import { resetPasswordRequestAction } from "../../../actions/auth/resetPassword.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionState } from "react";

const ResetPasswordRequestPage = () => {
  // Create a wrapper function that adapts the parameter order
  const adaptedAction = async (prevState: any, formData: FormData) => {
    // Call the original action with parameters in the order it expects
    return resetPasswordRequestAction(formData, prevState);
  };

  const [state, action, pending] = useActionState(adaptedAction, undefined);

  if (state?.success) {
    return (
      <div className="flex w-full flex-col items-center justify-center min-h-screen bg-slate-950 p-4">
        <div className="max-w-lg w-full mx-auto">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-emerald-500 p-3 rounded-xl mb-4">
              <Mail className="h-8 w-8 text-slate-900" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 text-transparent bg-clip-text">
              Developers Hub
            </h1>
            <p className="text-slate-500 mt-2">Check your email</p>
          </div>

          <div className="space-y-5 w-full p-6 bg-slate-900 border border-slate-800 rounded-lg shadow-xl">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-white">
                Reset Password Link Has Been Sent
              </h2>
              <p className="text-slate-400">
                We have sent an email with a link to reset your password. Please
                check your inbox.
              </p>
            </div>

            <Link
              href="/signin"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-medium py-2.5 rounded-md transition-colors flex items-center justify-center"
            >
              Go back to Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center justify-center min-h-screen bg-slate-950 p-4">
      <div className="max-w-lg w-full mx-auto">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-emerald-500 p-3 rounded-xl mb-4">
            <Code className="h-8 w-8 text-slate-900" />
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
          {(state?.errors?.email || state?.message) && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-500 text-sm">
                {state?.errors?.email || state?.message}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300">
              Email Address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="Enter your email address"
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
             />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-medium py-2.5 rounded-md transition-colors"
              disabled={state?.pending || pending}
            >
              {state?.pending || pending ? (
                <>
                  <span className="mr-2">Sending...</span>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Reset Link
                </>
              )}
            </Button>
          </div>

          <div className="text-center mt-4 text-sm text-slate-500">
            Remember your password?{" "}
            <Link
              href="/signin"
              className="text-emerald-400 hover:text-emerald-300"
            >
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordRequestPage;
