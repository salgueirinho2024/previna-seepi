"use client";

import { useTransition } from "react";
import {
  aprovarSolicitacao,
  cancelarSolicitacao,
  desfazerEntrega,
  efetuarEntrega,
  excluirSolicitacao,
  reabrirSolicitacao,
} from "@/app/(app)/solicitacoes/actions";

export function SolicitacaoActions({ id, status }: { id: string; status: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-3">
      {status === "pendente" && (
        <button
          disabled={isPending}
          className="btn-secondary"
          onClick={() => startTransition(() => aprovarSolicitacao(id))}
        >
          Aprovar entrega
        </button>
      )}

      {(status === "pendente" || status === "aprovada") && (
        <button
          disabled={isPending}
          className="btn-primary"
          onClick={() => startTransition(() => efetuarEntrega(id))}
        >
          {isPending ? "Processando..." : "Efetuar entrega"}
        </button>
      )}

      {(status === "pendente" || status === "aprovada") && (
        <button
          disabled={isPending}
          className="btn-danger"
          onClick={() => {
            if (confirm("Cancelar esta entrega?")) startTransition(() => cancelarSolicitacao(id));
          }}
        >
          Cancelar
        </button>
      )}

      {status === "cancelada" && (
        <button
          disabled={isPending}
          className="btn-secondary"
          onClick={() => startTransition(() => reabrirSolicitacao(id))}
        >
          ↺ Desfazer cancelamento
        </button>
      )}

      {status === "entregue" && (
        <button
          disabled={isPending}
          className="btn-secondary"
          onClick={() => {
            if (confirm("Desfazer esta entrega? A quantidade voltará ao estoque.")) {
              startTransition(() => desfazerEntrega(id));
            }
          }}
        >
          ↺ Desfazer entrega
        </button>
      )}

      <button
        disabled={isPending}
        className="btn-danger"
        onClick={() => {
          if (
            confirm(
              "Excluir esta entrega definitivamente? Se já tiver sido entregue, a quantidade volta ao estoque. Essa ação não pode ser desfeita."
            )
          ) {
            startTransition(() => excluirSolicitacao(id));
          }
        }}
      >
        Excluir
      </button>
    </div>
  );
}
