import AuthLayout from "../components/auth/AuthLayout";
import LoginForm from "../components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Bienvenido de nuevo"
      description="Accede al panel de VetNova para gestionar citas, pacientes y clientes con facilidad."
    >
      <LoginForm />
    </AuthLayout>
  );
}
