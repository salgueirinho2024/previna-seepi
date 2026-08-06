"use client";

import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import type { RealizacaoFormState } from "@/app/(app)/treinamentos/actions";

type Treinamento = {
  id: string;
  nome: string;
  periodicidadeDias: number | null;
};

type Colaborador = {
  id: string;
  nome: string;
  matricula: string | null;
  setorNome: string | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "Registrando..." : "Registrar realização"}
    </button>
  );
}

function todayISO() {
  const d = new Date();
  const tz = d.getTimezoneOffset();
  const local = new Date(d.getTime() - tz * 60000);
  return local.toISOString().slice(0, 10);
}

export function TreinamentoRealizacaoForm({
  action,
  colaboradores,
  treinamentos,
  colaboradorIdInicial,
  treinamentoIdInicial,
}: {
  action: (prev: RealizacaoFormState, formData: FormData) => Promise<RealizacaoFormState>;
  colaboradores: Colaborador[];
  treinamentos: Treinamento[];
  colaboradorIdInicial?: string;
  treinamentoIdInicial?: string;
}) {
  const [state, formAction] = useFormState<RealizacaoFormState, FormData>(action, {});
  const [busca, setBusca] = useState("");
  const [colaboradorId, setColaboradorId] = useState(colaboradorIdInicial ?? "");

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

      <div className="card p-6">
        <h2 className="mb-1 text-base font-semibold text-ink-900">1. Colaborador</h2>
        <p className="mb-4 text-sm text-ink-500">Quem realizou o treinamento.</p>

        {colaboradorSelecionado ? (
          <div className="flex items-center justify-between rounded-lg border border-brand-500/30 bg-brand-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-ink-800">{colaboradorSelecionado.nome}</p>
              <p className="text-xs text-ink-500">
                {colaboradorSelecionado.matricula ?? "sem matrícula"}
                {colaboradorSelecionado.setorNome ? ` · ${colaboradorSelecionado.setorNome}` : ""}
              </p>
            </div>
            <button
              type="button"
              className="text-xs font-medium text-ink-500 hover:underline"
              onClick={() => setColaboradorId("")}
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
        <div className="card space-y-4 p-6">
          <h2 className="text-base font-semibold text-ink-900">2. Detalhes do treinamento</h2>

          {treinamentos.length === 0 ? (
            <p className="text-sm text-ink-300">
              Nenhum treinamento cadastrado ainda. Cadastre no catálogo primeiro.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label">Treinamento</label>
                <select name="treinamentoId" className="input" defaultValue={treinamentoIdInicial ?? ""} required>
                  <option value="" disabled>
                    Selecione...
                  </option>
                  {treinamentos.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome}
                      {t.periodicidadeDias ? ` · válido por ${t.periodicidadeDias} dias` : " · não vence"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Data de realização</label>
                <input name="realizadoEm" type="date" defaultValue={todayISO()} className="input" required />
              </div>
              <div>
                <label className="label">Instrutor / Instituição (opcional)</label>
                <input name="instrutor" className="input" placeholder="Ex: SESI, Fulano de Tal" />
              </div>

              <div className="sm:col-span-2">
                <label className="label">Observação (opcional)</label>
                <textarea name="observacao" className="input min-h-20" placeholder="Ex: turma extra, reciclagem" />
              </div>
            </div>
          )}
        </div>
      )}

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
          {state.error}
        </p>
      )}

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
