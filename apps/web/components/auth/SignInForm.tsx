"use client";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Code, AlertCircle } from "lucide-react";
import { useActionState } from "react";
import { signInAction } from "../../actions/auth/signin.action";
import { SubmitButton } from "../utils/SubmitButton";

const SignInForm = () => {
  const [state, action, pending] = useActionState(signInAction, {});
  console.log(state )
  return (
    <div className=" max-w-lg w-full mx-auto my-8">
      <div className="flex flex-col items-center mb-6">
        <div className="bg-emerald-500 p-3 rounded-xl mb-4">
          <Code className="h-8 w-8 text-slate-900" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 text-transparent bg-clip-text">
          Developers Hub
        </h1>
        <p className="text-slate-500 mt-2">Sign in to your account</p>
      </div>

      <form
        action={action}
        className="space-y-5 w-full p-6 bg-slate-900 border border-slate-800 rounded-lg shadow-xl"
      >
        {state?.message && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-red-500 text-sm">{state.message}</p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-300">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            defaultValue={state?.data?.email}
            type="email"
            placeholder="Enter your email"
            required
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
          />
          {state?.error?.email && (
            <p className="text-red-500 text-sm mt-1">{state?.error?.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-300">
            Password
          </Label>
          <Input
            id="password"
            name="password"
            defaultValue={state?.data?.password}
            type="password"
            placeholder="Enter your password"
            required
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
          />
          {state?.error?.password && (
            <p className="text-red-500 text-sm mt-1">
              {state?.error?.password}
            </p>
          )}
        </div>

        <div className="pt-2">
          <SubmitButton
            pending={pending}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-medium py-2.5 rounded-md transition-colors"
          >
            {pending ? "Signing in..." : "Sign In"}
          </SubmitButton>
        </div>

        <div className="text-center mt-4 text-sm text-slate-500">
          Don't have an account?{" "}
          <a href="/signup" className="text-emerald-400 hover:text-emerald-300">
            Sign up
          </a>
        </div>
      </form>
    </div>
  );
};

export default SignInForm;
