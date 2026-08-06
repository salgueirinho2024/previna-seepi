"use client";

import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import type { SolicitacaoFormState } from "@/app/(app)/solicitacoes/actions";
import { MOTIVOS_SOLICITACAO } from "@/lib/utils";

type Colaborador = { id: string; nome: string; matricula: string | null; setorId: string | null };
type Item = { id: string; nome: string; ca: string | null; estoqueAtual: number };
type SetorObrigatorios = Record<string, { nome: string; itemIds: string[] }>;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "Enviando..." : "Registrar entrega"}
    </button>
  );
}

export function NovaSolicitacaoForm({
  action,
  colaboradores,
  itens,
  obrigatoriosPorSetor,
  colaboradorIdInicial,
}: {
  action: (prev: SolicitacaoFormState, formData: FormData) => Promise<SolicitacaoFormState>;
  colaboradores: Colaborador[];
  itens: Item[];
  obrigatoriosPorSetor: SetorObrigatorios;
  colaboradorIdInicial?: string;
}) {
  const [state, formAction] = useFormState<SolicitacaoFormState, FormData>(action, {});
  const [busca, setBusca] = useState("");
  const [colaboradorId, setColaboradorId] = useState(colaboradorIdInicial ?? "");
  const [selecionados, setSelecionados] = useState<Record<string, number>>({});

  const colaboradorSelecionado = colaboradores.find((c) => c.id === colaboradorId);

  const obrigatoriosDoSetor = useMemo(() => {
    if (!colaboradorSelecionado?.setorId) return null;
    return obrigatoriosPorSetor[colaboradorSelecionado.setorId] ?? null;
  }, [colaboradorSelecionado, obrigatoriosPorSetor]);

  // Apenas informativo: mostra quais EPIs são obrigatórios para o setor do
  // colaborador selecionado. Não marca nada sozinho — quem lança escolhe.
  const nomesObrigatorios = useMemo(() => {
    if (!obrigatoriosDoSetor) return [];
    return obrigatoriosDoSetor.itemIds
      .map((id) => itens.find((i) => i.id === id)?.nome)
      .filter((n): n is string => Boolean(n));
  }, [obrigatoriosDoSetor, itens]);

  const resultados = useMemo(() => {
    if (!busca.trim() || colaboradorSelecionado) return [];
    const q = busca.toLowerCase();
    return colaboradores.filter((c) => c.nome.toLowerCase().includes(q) || c.matricula?.toLowerCase().includes(q)).slice(0, 6);
  }, [busca, colaboradores, colaboradorSelecionado]);

  function toggleItem(id: string) {
    setSelecionados((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = 1;
      return next;
    });
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="colaboradorId" value={colaboradorId} />

      <div className="card p-6">
        <h2 className="mb-1 text-base font-semibold text-ink-900">1. Buscar colaborador</h2>
        <p className="mb-4 text-sm text-ink-500">Selecione quem vai receber os EPIs.</p>

        {colaboradorSelecionado ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-brand-500/30 bg-brand-50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-ink-800">{colaboradorSelecionado.nome}</p>
                {colaboradorSelecionado.matricula && (
                  <p className="text-xs text-ink-500">{colaboradorSelecionado.matricula}</p>
                )}
                {nomesObrigatorios.length > 0 ? (
                  <p className="mt-2 text-xs text-ink-500">
                    <span className="font-medium text-amber-700 dark:text-amber-400">
                      EPIs obrigatórios do setor {obrigatoriosDoSetor?.nome}:
                    </span>{" "}
                    {nomesObrigatorios.join(", ")}
                  </p>
                ) : colaboradorSelecionado.setorId ? (
                  <p className="mt-2 text-xs text-ink-300">Nenhum EPI obrigatório cadastrado para o setor deste colaborador.</p>
                ) : (
                  <p className="mt-2 text-xs text-ink-300">Este colaborador não tem setor definido.</p>
                )}
              </div>
              <button
                type="button"
                className="text-xs font-medium text-ink-500 hover:underline"
                onClick={() => setColaboradorId("")}
              >
                Trocar
              </button>
            </div>
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

      <div className="card p-6">
        <h2 className="mb-1 text-base font-semibold text-ink-900">2. Motivo da entrega</h2>
        <select name="motivo" className="input mt-3" required>
          {MOTIVOS_SOLICITACAO.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div className="card p-6">
        <h2 className="mb-1 text-base font-semibold text-ink-900">3. Itens de EPI</h2>
        <p className="mb-4 text-sm text-ink-500">Selecione os itens e ajuste a quantidade.</p>

        <div className="space-y-2">
          {itens.map((item) => {
            const marcado = item.id in selecionados;
            const obrigatorio = obrigatoriosDoSetor?.itemIds.includes(item.id) ?? false;
            return (
              <div
                key={item.id}
                className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-4 py-3 ${
                  marcado ? "border-brand-500/40 bg-brand-50" : "border-ink-100"
                }`}
              >
                <label className="flex min-w-0 flex-1 items-center gap-3">
                  <input type="checkbox" checked={marcado} onChange={() => toggleItem(item.id)} className="h-4 w-4 shrink-0 accent-brand-500" />
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-medium text-ink-800">
                      <span className="truncate">{item.nome}</span>
                      {obrigatorio && (
                        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-700 dark:text-amber-400">
                          Obrigatório
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-ink-300">
                      CA {item.ca ?? "—"} · estoque {item.estoqueAtual}
                    </p>
                  </div>
                </label>
                {marcado && (
                  <input
                    type="number"
                    min={1}
                    className="input w-20"
                    value={selecionados[item.id]}
                    onChange={(e) =>
                      setSelecionados((prev) => ({ ...prev, [item.id]: Number(e.target.value) || 1 }))
                    }
                  />
                )}
                {marcado && (
                  <>
                    <input type="hidden" name="itemId" value={item.id} />
                    <input type="hidden" name="quantidade" value={selecionados[item.id]} />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">{state.error}</p>}

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
