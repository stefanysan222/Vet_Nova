import AuthLayout from "../components/auth/AuthLayout";
import RegisterForm from "../components/auth/RegisterForm";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ clinica?: string }>;
}) {
  const { clinica } = await searchParams;

  return (
    <AuthLayout title="Crear cuenta">
      <RegisterForm clinicaSlug={clinica} />
    </AuthLayout>
  );
}
