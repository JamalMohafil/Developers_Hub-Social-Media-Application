import Link from "next/link";
 import { BACKEND_URL } from "@/lib/constants";
import SignInForm from "@/components/auth/SignInForm";

const SignInPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center w-full bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        <div className="bg-slate-900 p-8 rounded-lg shadow-xl border border-slate-800">
          <SignInForm />

          <div className="flex items-center my-6 w-full">
            <hr className="flex-grow border-slate-700" />
            <span className="px-3 text-slate-500 text-sm">Or</span>
            <hr className="flex-grow border-slate-700" />
          </div>

          <a
            href={`${BACKEND_URL}/auth/google/callback`}
            className="flex items-center justify-center w-full py-2.5 px-4 border border-slate-700 rounded-md shadow-sm bg-slate-800 text-sm font-medium text-white hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 mb-4 h-11"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"
              />
              <path
                fill="#34A853"
                d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"
              />
              <path
                fill="#4A90E2"
                d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"
              />
              <path
                fill="#FBBC05"
                d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"
              />
            </svg>
            Sign in with Google
          </a>

          <div className="space-y-4 mt-6 pt-6 border-t border-slate-800">
         
            <div className="flex justify-between text-sm w-full">
              <p className="text-slate-400">Forgot your password?</p>
              <Link
                className="text-emerald-400 hover:text-emerald-300 transition-colors"
                href="/reset-password"
              >
                Reset Password
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
