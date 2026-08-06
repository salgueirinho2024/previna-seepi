"use client";

import { useTransition } from "react";
import { excluirDevolucao } from "@/app/(app)/devolucoes/actions";

export function DevolucaoDeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950/40"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm("Excluir esta devolução? Essa ação não pode ser desfeita.")) {
          startTransition(() => excluirDevolucao(id));
        }
      }}
    >
      Excluir
    </button>
  );
}
