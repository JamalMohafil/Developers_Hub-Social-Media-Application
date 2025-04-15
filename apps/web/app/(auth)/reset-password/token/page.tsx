// هذا يجب أن يكون في ملف app/reset-password/page.tsx أو مماثل

import ResetPasswordForm from "../../../../components/auth/ResetPasswordForm";
import { getSession } from "../../../../lib/session";
import { verifyToken } from "../../../../lib/token";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const parms = (await searchParams) ;
  const token = parms.token!;
  const session = await getSession();

  // التحقق من التوكن على الخادم
  const tokenVerification = token ? await verifyToken(token) : null;

  // إذا لم يكن هناك جلسة ولكن يوجد توكن صحيح، فاجعل `isTokenValid` يساوي `true`
  const isTokenValid = !!tokenVerification && !session;

  // تمرير الخصائص الضرورية فقط إلى مكون العميل
  return (
    <ResetPasswordForm
      token={token}
      isTokenValid={isTokenValid} // لا داعي لفحص `session` هنا لأننا تحققنا منه سابقًا
    />
  );
}
