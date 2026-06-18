import AuthLayout from "../components/auth/AuthLayout";
import ForgotPasswordForm from "../components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Recuperar contraseña"
      description="Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
