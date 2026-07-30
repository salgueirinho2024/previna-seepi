"use client";

import { useTransition } from "react";
import { aprovarSolicitacao, cancelarSolicitacao, efetuarEntrega } from "@/app/(app)/solicitacoes/actions";

export function SolicitacaoActions({ id, status }: { id: string; status: string }) {
  const [isPending, startTransition] = useTransition();

  if (status === "entregue" || status === "cancelada") return null;

  return (
    <div className="flex flex-wrap gap-3">
      {status === "pendente" && (
        <button
          disabled={isPending}
          className="btn-secondary"
          onClick={() => startTransition(() => aprovarSolicitacao(id))}
        >
          Aprovar solicitação
        </button>
      )}
      <button
        disabled={isPending}
        className="btn-primary"
        onClick={() => startTransition(() => efetuarEntrega(id))}
      >
        {isPending ? "Processando..." : "Efetuar entrega"}
      </button>
      <button
        disabled={isPending}
        className="btn-danger"
        onClick={() => {
          if (confirm("Cancelar esta solicitação?")) startTransition(() => cancelarSolicitacao(id));
        }}
      >
        Cancelar
      </button>
    </div>
  );
}
