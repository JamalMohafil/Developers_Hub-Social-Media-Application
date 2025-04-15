 import Link from "next/link";
import { Code } from "lucide-react";
import SignUpForm from "@/components/auth/SignUpForm";

const SignUpPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center w-full bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        <div className="flex flex-col items-center">
          <div className="bg-emerald-500 p-3 rounded-xl mb-4">
            <Code className="h-8 w-8 text-slate-900" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 text-transparent bg-clip-text">
            Join Developers Hub
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Create your account and start collaborating
          </p>
        </div>

        <div className="bg-slate-900 p-8 rounded-lg shadow-xl border border-slate-800">
          <SignUpForm />

          <div className="flex justify-between text-sm mt-6 pt-6 border-t border-slate-800 w-full">
            <p className="text-slate-400">Already have an account?</p>
            <Link
              className="text-emerald-400 hover:text-emerald-300 transition-colors"
              href="/signin"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
