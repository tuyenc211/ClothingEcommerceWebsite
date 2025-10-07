import { LoginForm } from "@/components/ui/login-form";
export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 md:p-10">
      <div className="flex w-full max-w-5xl flex-col gap-6">
        <LoginForm />
      </div>
    </div>
  );
}
