"use client";

import { useTransition } from "react";
import { excluirRealizacao } from "@/app/(app)/treinamentos/actions";

export function RealizacaoDeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950/40"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm("Excluir este registro de realização? Essa ação não pode ser desfeita.")) {
          startTransition(() => excluirRealizacao(id));
        }
      }}
    >
      Excluir
    </button>
  );
}
