"use client";

import { useTransition } from "react";
import { assinarEntrega } from "@/app/(app)/solicitacoes/actions";

/**
 * A assinatura agora é sempre manual/escrita (o colaborador assina no papel,
 * ex: a Ficha de EPI impressa). Este botão apenas confirma no sistema que a
 * assinatura física foi coletada — não há mais opções de assinatura digital.
 */
export function SignButtons({ entregaId }: { entregaId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => assinarEntrega(entregaId))}
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-ink-100 px-4 py-2.5 text-sm font-medium text-ink-700 transition hover:bg-ink-100/60 disabled:opacity-50"
    >
      <span>✍️</span>
      {isPending ? "Confirmando..." : "Confirmar assinatura manual"}
    </button>
  );
}
