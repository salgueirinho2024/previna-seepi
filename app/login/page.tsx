import Link from "next/link";
import { Logo } from "@/components/Logo";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f8f7] px-4">
      <div className="card w-full max-w-sm p-8">
        <div className="mb-6 flex justify-center">
          <Logo size={36} />
        </div>
        <h1 className="mb-1 text-center text-lg font-semibold text-ink-900">Entrar</h1>
        <p className="mb-6 text-center text-sm text-ink-500">Acesse o painel de gestão de EPIs</p>
        <LoginForm />
        <p className="mt-6 text-center text-sm text-ink-500">
          Não tem uma conta?{" "}
          <Link href="/register" className="font-medium text-brand-700 hover:underline">
            Cadastre sua empresa
          </Link>
        </p>
      </div>
    </div>
  );
}
