import { Suspense } from "react";
import AuthLayout from "../components/auth/AuthLayout";
import ResetPasswordForm from "../components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Nueva contraseña"
      description="Elige una contraseña segura para tu cuenta de VetNova."
    >
      <Suspense
        fallback={<div className="h-32 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />}
      >
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
