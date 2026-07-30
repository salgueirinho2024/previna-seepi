"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { Logo } from "@/components/Logo";
import { registerEmpresa, type RegisterState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full">
      {pending ? "Criando conta..." : "Criar conta"}
    </button>
  );
}

export default function RegisterPage() {
  const [state, formAction] = useFormState<RegisterState, FormData>(registerEmpresa, {});

  if (state.success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8f7] px-4">
        <div className="card w-full max-w-sm p-8 text-center">
          <p className="text-3xl">✅</p>
          <h1 className="mt-3 text-lg font-semibold text-ink-900">Conta criada!</h1>
          <p className="mt-1 text-sm text-ink-500">Agora é só fazer login com o e-mail e senha cadastrados.</p>
          <Link href="/login" className="btn-primary mt-6 inline-flex">
            Ir para o login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f8f7] px-4">
      <div className="card w-full max-w-sm p-8">
        <div className="mb-6 flex justify-center">
          <Logo size={36} />
        </div>
        <h1 className="mb-1 text-center text-lg font-semibold text-ink-900">Cadastre sua empresa</h1>
        <p className="mb-6 text-center text-sm text-ink-500">Crie a conta administradora da sua empresa</p>

        <form action={formAction} className="space-y-4">
          <div>
            <label className="label">Nome da empresa</label>
            <input name="empresaNome" required className="input" placeholder="Ex: Bambuí Bioenergia S/A" />
          </div>
          <div>
            <label className="label">CNPJ (opcional)</label>
            <input name="cnpj" className="input" placeholder="00.000.000/0000-00" />
          </div>
          <div>
            <label className="label">Seu nome</label>
            <input name="nome" required className="input" placeholder="Nome completo" />
          </div>
          <div>
            <label className="label">E-mail</label>
            <input name="email" type="email" required className="input" placeholder="voce@empresa.com" />
          </div>
          <div>
            <label className="label">Senha</label>
            <input name="password" type="password" required className="input" placeholder="Mínimo 6 caracteres" />
          </div>
          {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>}
          <SubmitButton />
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          Já tem uma conta?{" "}
          <Link href="/login" className="font-medium text-brand-700 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
