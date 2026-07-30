"use client";

import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import type { DevolucaoFormState } from "@/app/(app)/devolucoes/actions";
import { MOTIVOS_DEVOLUCAO } from "@/lib/utils";

type ItemEntregue = {
  entregaItemId: string;
  itemId: string;
  itemNome: string;
  itemCa: string | null;
  quantidadeEntregue: number;
};

type Colaborador = {
  id: string;
  nome: string;
  matricula: string | null;
  itensEntregues: ItemEntregue[];
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "Registrando..." : "Registrar devolução"}
    </button>
  );
}

export function DevolucaoForm({
  action,
  colaboradores,
  colaboradorIdInicial,
}: {
  action: (prev: DevolucaoFormState, formData: FormData) => Promise<DevolucaoFormState>;
  colaboradores: Colaborador[];
  colaboradorIdInicial?: string;
}) {
  const [state, formAction] = useFormState<DevolucaoFormState, FormData>(action, {});
  const [busca, setBusca] = useState("");
  const [colaboradorId, setColaboradorId] = useState(colaboradorIdInicial ?? "");
  const [itemEscolhido, setItemEscolhido] = useState<ItemEntregue | null>(null);
  const [quantidade, setQuantidade] = useState(1);

  const colaboradorSelecionado = colaboradores.find((c) => c.id === colaboradorId);

  const resultados = useMemo(() => {
    if (!busca.trim() || colaboradorSelecionado) return [];
    const q = busca.toLowerCase();
    return colaboradores
      .filter((c) => c.nome.toLowerCase().includes(q) || c.matricula?.toLowerCase().includes(q))
      .slice(0, 6);
  }, [busca, colaboradores, colaboradorSelecionado]);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="colaboradorId" value={colaboradorId} />
      {itemEscolhido && (
        <>
          <input type="hidden" name="itemId" value={itemEscolhido.itemId} />
          <input type="hidden" name="entregaItemId" value={itemEscolhido.entregaItemId} />
        </>
      )}

      <div className="card p-6">
        <h2 className="mb-1 text-base font-semibold text-ink-900">1. Colaborador</h2>
        <p className="mb-4 text-sm text-ink-500">Quem está devolvendo o EPI.</p>

        {colaboradorSelecionado ? (
          <div className="flex items-center justify-between rounded-lg border border-brand-500/30 bg-brand-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-ink-800">{colaboradorSelecionado.nome}</p>
              {colaboradorSelecionado.matricula && (
                <p className="text-xs text-ink-500">{colaboradorSelecionado.matricula}</p>
              )}
            </div>
            <button
              type="button"
              className="text-xs font-medium text-ink-500 hover:underline"
              onClick={() => {
                setColaboradorId("");
                setItemEscolhido(null);
              }}
            >
              Trocar
            </button>
          </div>
        ) : (
          <div className="relative">
            <input
              className="input"
              placeholder="Digite o nome ou matrícula..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            {resultados.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border border-ink-100 bg-surface shadow-card">
                {resultados.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-ink-100/60"
                    onClick={() => {
                      setColaboradorId(c.id);
                      setBusca("");
                    }}
                  >
                    <span className="font-medium text-ink-800">{c.nome}</span>
                    <span className="text-xs text-ink-300">{c.matricula}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {colaboradorSelecionado && (
        <div className="card p-6">
          <h2 className="mb-1 text-base font-semibold text-ink-900">2. Item devolvido</h2>
          <p className="mb-4 text-sm text-ink-500">Selecione qual EPI entregue está sendo devolvido.</p>

          {colaboradorSelecionado.itensEntregues.length === 0 ? (
            <p className="text-sm text-ink-300">Este colaborador não possui EPIs entregues registrados.</p>
          ) : (
            <div className="space-y-2">
              {colaboradorSelecionado.itensEntregues.map((i) => {
                const marcado = itemEscolhido?.entregaItemId === i.entregaItemId;
                return (
                  <label
                    key={i.entregaItemId}
                    className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
                      marcado ? "border-brand-500/40 bg-brand-50" : "border-ink-100"
                    }`}
                  >
                    <input
                      type="radio"
                      name="_itemRadio"
                      checked={marcado}
                      onChange={() => {
                        setItemEscolhido(i);
                        setQuantidade(1);
                      }}
                      className="h-4 w-4 accent-brand-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-ink-800">{i.itemNome}</p>
                      <p className="text-xs text-ink-300">
                        CA {i.itemCa ?? "—"} · entregue: {i.quantidadeEntregue}×
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {itemEscolhido && (
        <div className="card space-y-4 p-6">
          <h2 className="text-base font-semibold text-ink-900">3. Detalhes da devolução</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Quantidade devolvida</label>
              <input
                type="number"
                min={1}
                max={itemEscolhido.quantidadeEntregue}
                name="quantidade"
                value={quantidade}
                onChange={(e) => setQuantidade(Number(e.target.value) || 1)}
                className="input"
              />
            </div>
            <div>
              <label className="label">Motivo</label>
              <select name="motivo" className="input" required>
                {MOTIVOS_DEVOLUCAO.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Observação (opcional)</label>
              <textarea name="observacao" className="input min-h-20" placeholder="Ex: item recolhido no desligamento" />
            </div>
          </div>

          <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
            Esta devolução apenas registra histórico — o estoque não é alterado automaticamente.
          </p>
        </div>
      )}

      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">{state.error}</p>}

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
