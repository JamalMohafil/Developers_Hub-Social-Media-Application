'use client';
import React, { useEffect, useRef, useState, useTransition } from "react";
import { useActionState } from "react";
import {
  sendOTP,
  verifyEmail,
} from "../../actions/auth/emailVerification.action";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../ui/input-otp";
import { AlertCircle, CheckCircle, Mail, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { SessionType } from "@/lib/type";

type Props = {session:SessionType|null};
const initialState = {
  message: "",
  success: false,
  error: false,
};

const VerifyEmailForm = ({session}: Props) => {
  const [otp, setOtp] = useState<string>("");

  // Create a wrapper function that adapts the parameter order if needed
  const adaptedVerifyEmail = async (prevState: any, formData: any) => {
    return verifyEmail(prevState, formData);
  };

  const [state, formAction] = useActionState(adaptedVerifyEmail, initialState);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState("");
  const [seconds, setSeconds] = useState(0);

  // Track if OTP request has been made
  const hasCalledOTPRef = useRef(false);

  // Send OTP only once when page loads
  useEffect(() => {
    const fetchOTP = async () => {
      try {
        setIsLoading(true);
        hasCalledOTPRef.current = true;

        const res = await sendOTP();
        if (res.success) {
          setSeconds(60);
        }
      } catch (error) {
        console.error("Failed to send OTP:", error);
        setResendError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
        hasCalledOTPRef.current = false;
      } finally {
        setIsLoading(false);
      }
    };

    fetchOTP();
  }, []);

  // Handle resend OTP
  const handleResendOTP = async () => {
    if (seconds > 0) return;
    setResendLoading(true);
    setResendSuccess(false);
    setResendError("");
    try {
      const res = await sendOTP();
      if (res.success) {
        setResendSuccess(true);
        setSeconds(60);
      } else {
        throw new Error("Failed to send OTP");
      }
    } catch (error) {
      setResendError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setResendLoading(false);
    }
  };

  // Countdown timer for resend button
  useEffect(() => {
    const timer =
      seconds > 0 && (setInterval(() => setSeconds(seconds - 1), 1000) as any);
    return () => clearInterval(timer);
  }, [seconds]);

  // Submit form with transition
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(otp).toString().length == 6) {
      startTransition(() => {
        formAction({ otp });
      });
    }
  };

  return (
    <div className="w-full p-6 bg-slate-900 border border-slate-800 rounded-lg shadow-xl">
      {state.success ? (
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="bg-emerald-500/20 p-4 rounded-full">
            <CheckCircle className="h-16 w-16 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-white">
            Email verified successfully!
          </h3>
          <p className="text-slate-400">
            You can now proceed to use our platform.
          </p>
          <Button
            asChild
            className="mt-4 w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-medium py-2.5 rounded-md transition-colors"
          >
            <Link href={`/profile/${session?.user?.id}`} className="flex items-center justify-center">
              Go To Profile
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Verification Code
            </label>
            <div className="flex justify-center">
              <InputOTP
                value={otp}
                onChange={(value) => setOtp(value)}
                maxLength={6}
                className="w-full text-white"
              >
                <InputOTPGroup>
                  <InputOTPSlot
                    index={0}
                    className="bg-slate-800 border-slate-700 text-white focus:border-emerald-500"
                  />
                  <InputOTPSlot
                    index={1}
                    className="bg-slate-800 border-slate-700 text-white focus:border-emerald-500"
                  />
                  <InputOTPSlot
                    index={2}
                    className="bg-slate-800 border-slate-700 text-white focus:border-emerald-500"
                  />
                </InputOTPGroup>
                <InputOTPSeparator className="text-slate-600" />
                <InputOTPGroup>
                  <InputOTPSlot
                    index={3}
                    className="bg-slate-800 border-slate-700 text-white focus:border-emerald-500"
                  />
                  <InputOTPSlot
                    index={4}
                    className="bg-slate-800 border-slate-700 text-white focus:border-emerald-500"
                  />
                  <InputOTPSlot
                    index={5}
                    className="bg-slate-800 border-slate-700 text-white focus:border-emerald-500"
                  />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          {state.error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-500 text-sm">
                {state.message || "Invalid verification code"}
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isPending || isLoading || otp.length !== 6}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-medium py-2.5 rounded-md transition-colors disabled:bg-emerald-500/50 disabled:text-slate-900/50"
          >
            {isPending ? (
              <div className="flex items-center justify-center">
                <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Verifying...
              </div>
            ) : (
              "Verify"
            )}
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              onClick={handleResendOTP}
              disabled={seconds > 0 || resendLoading || isLoading}
              className={`text-sm font-medium hover:bg-white/[0.05] ${
                seconds > 0 || resendLoading || isLoading
                  ? "text-slate-500 cursor-not-allowed"
                  : "text-emerald-400 hover:text-emerald-300"
              }`}
            >
              {resendLoading ? (
                <div className="flex items-center">
                  <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Sending...
                </div>
              ) : isLoading ? (
                <div className="flex items-center">
                  <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Reset code
                </div>
              ) : seconds > 0 ? (
                `Resend code in ${seconds}s`
              ) : (
                "Resend verification code"
              )}
            </Button>

            {resendSuccess && (
              <p className="mt-2 text-xs text-emerald-500">
                Code resent successfully!
              </p>
            )}

            {resendError && (
              <p className="mt-2 text-xs text-red-500">{resendError}</p>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default VerifyEmailForm;
