"use client";

import { useTransition } from "react";
import { assinarEntrega } from "@/app/(app)/solicitacoes/actions";

const OPCOES = [
  { tipo: "facial" as const, label: "Assinar Reconhecimento Facial", icon: "🧿" },
  { tipo: "digital" as const, label: "Assinar Digitalmente", icon: "✍️" },
  { tipo: "whatsapp" as const, label: "Assinar via WhatsApp", icon: "🟢" },
  { tipo: "email" as const, label: "Assinar via E-mail", icon: "✉️" },
];

export function SignButtons({ entregaId }: { entregaId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-2">
      {OPCOES.map((op) => (
        <button
          key={op.tipo}
          disabled={isPending}
          onClick={() => startTransition(() => assinarEntrega(entregaId, op.tipo))}
          className="flex w-full items-center gap-2 rounded-lg border border-ink-100 px-4 py-2.5 text-sm font-medium text-ink-700 transition hover:bg-ink-100/60 disabled:opacity-50"
        >
          <span>{op.icon}</span>
          {op.label}
        </button>
      ))}
    </div>
  );
}
