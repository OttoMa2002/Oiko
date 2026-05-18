import { LoginForm } from "./login-form";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirectTo?: string };
}) {
  return <LoginForm redirectTo={searchParams.redirectTo} />;
}
