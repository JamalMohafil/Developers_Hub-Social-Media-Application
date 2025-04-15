import { Code } from "lucide-react";
import VerifyEmailForm from "../../../components/auth/VerifyEmailForm";
import { getSession } from "@/lib/session";

export default async function EmailVerificationPage() {
  const session = await getSession();
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
          <p className="text-slate-500 mt-2 text-center">
            We've sent a verification code to your email address.
            <br />
            Please enter the code below to verify your account.
          </p>
        </div>

        <VerifyEmailForm session={session} />
      </div>
    </div>
  );
}
