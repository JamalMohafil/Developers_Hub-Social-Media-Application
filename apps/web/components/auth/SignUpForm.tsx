"use client";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { AlertCircle, User, Mail, Lock } from "lucide-react";
import { useActionState } from "react";
import { signUpAction } from "../../actions/auth/signup.action";
import { SubmitButton } from "../utils/SubmitButton";

const SignUpForm = () => {
  const [state, action, pending] = useActionState(signUpAction, undefined);

  return (
    <form action={action} className="space-y-5 w-full">
      {state?.message && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-red-500 text-sm">{state.message}</p>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-slate-300">
          Name
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-slate-500" />
          </div>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Enter your name"
            required
            defaultValue={state?.data?.name}
            className="bg-slate-800 border-slate-700 text-white pl-10 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
          />
        </div>
        {state?.error?.name && (
          <p className="text-red-500 text-sm mt-1">{state?.error?.name}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="username" className="text-slate-300">
          Username
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-slate-500" />
          </div>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="Enter your username"
            required
            defaultValue={state?.data?.username}
            className="bg-slate-800 border-slate-700 text-white pl-10 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
          />
        </div>
        {state?.error?.username && (
          <p className="text-red-500 text-sm mt-1">{state?.error?.username}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-slate-300">
          Email
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-slate-500" />
          </div>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={state?.data?.email}
            placeholder="Enter your email"
            required
            className="bg-slate-800 border-slate-700 text-white pl-10 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
          />
        </div>
        {state?.error?.email && (
          <p className="text-red-500 text-sm mt-1">{state?.error?.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-slate-300">
          Password
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-slate-500" />
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            defaultValue={state?.data?.password}
            placeholder="Enter your password"
            required
            className="bg-slate-800 border-slate-700 text-white pl-10 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
          />
        </div>
        {state?.error?.password && (
          <p className="text-red-500 text-sm mt-1">{state?.error?.password}</p>
        )}
      </div>

      <div className="pt-2">
        <SubmitButton pending={pending}>Create Account</SubmitButton>
      </div>

      <p className="text-xs text-slate-500 text-center mt-4">
        By signing up, you agree to our{" "}
        <a href="/terms" className="text-emerald-400 hover:text-emerald-300">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy" className="text-emerald-400 hover:text-emerald-300">
          Privacy Policy
        </a>
      </p>
    </form>
  );
};

export default SignUpForm;
