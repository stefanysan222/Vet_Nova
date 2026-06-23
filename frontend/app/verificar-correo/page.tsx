import { Suspense } from "react";
import AuthLayout from "../components/auth/AuthLayout";
import VerifyEmailStatus from "../components/auth/VerifyEmailStatus";

export default function VerificarCorreoPage() {
  return (
    <AuthLayout title="Confirmar correo" description="Estamos confirmando tu cuenta de VetNova.">
      <Suspense
        fallback={<div className="h-32 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />}
      >
        <VerifyEmailStatus />
      </Suspense>
    </AuthLayout>
  );
}
