import Link from "next/link";
import { Logo } from "@/components/Logo";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-page">
      {/* Branding panel with the floating logo video — hidden on small screens */}
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-ink-900 lg:flex">
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-90"
          src="/logo-flutuando.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/20 to-ink-900/60" />
        <div className="relative z-10 max-w-md px-10 text-center">
          <h2 className="text-2xl font-semibold text-white">Gestão de EPIs sem complicação</h2>
          <p className="mt-3 text-sm text-white/70">
            Controle a entrega, o estoque e a troca periódica de equipamentos de proteção da sua empresa em um
            só lugar.
          </p>
        </div>
      </div>

      {/* Login form */}
      <div className="flex w-full flex-1 items-center justify-center px-4 py-12 lg:w-1/2">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="card p-8">
            <div className="mb-6 flex justify-center">
              <Logo size={40} />
            </div>
            <h1 className="mb-1 text-center text-lg font-semibold text-ink-900">Entrar</h1>
            <p className="mb-6 text-center text-sm text-ink-500">Acesse o painel de gestão de EPIs</p>
            <LoginForm />
            <p className="mt-6 text-center text-sm text-ink-500">
              Não tem uma conta?{" "}
              <Link href="/register" className="font-medium text-brand-700 hover:underline dark:text-brand-400">
                Cadastre sua empresa
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
