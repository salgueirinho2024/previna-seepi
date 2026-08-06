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
      </div>

      {/* Login form */}
      <div className="flex w-full flex-1 items-center justify-center px-4 py-12 lg:w-1/2">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="card p-8">
            <div className="mb-6 flex justify-center">
              <Logo size={40} />
            </div>
            <h1 className="mb-1 text-center text-lg font-semibold text-ink-900">Entrar</h1>
            <p className="mb-6 text-center text-sm text-ink-500">Acesse sua conta Previna-Se</p>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
