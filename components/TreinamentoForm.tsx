"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { TreinamentoFormState } from "@/app/(app)/treinamentos/actions";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "Salvando..." : label}
    </button>
  );
}

type TreinamentoInitial = {
  nome?: string;
  norma?: string | null;
  descricao?: string | null;
  cargaHorariaHoras?: number | null;
  periodicidadeDias?: number | null;
};

export function TreinamentoForm({
  action,
  initial,
  submitLabel = "Salvar treinamento",
}: {
  action: (prev: TreinamentoFormState, formData: FormData) => Promise<TreinamentoFormState>;
  initial?: TreinamentoInitial;
  submitLabel?: string;
}) {
  const [state, formAction] = useFormState<TreinamentoFormState, FormData>(action, {});

  return (
    <form action={formAction} className="card space-y-5 p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Nome do treinamento</label>
          <input
            name="nome"
            defaultValue={initial?.nome}
            className="input"
            placeholder="Ex: NR-35 Trabalho em Altura"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label className="label">Norma / categoria (opcional)</label>
          <input
            name="norma"
            defaultValue={initial?.norma ?? ""}
            className="input"
            placeholder="Ex: NR-35, Brigada de Incêndio, Integração"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="label">Descrição (opcional)</label>
          <textarea
            name="descricao"
            defaultValue={initial?.descricao ?? ""}
            className="input min-h-20"
            placeholder="Ex: Capacitação obrigatória para atividades acima de 2m de altura"
          />
        </div>

        <div>
          <label className="label">Carga horária (horas)</label>
          <input
            name="cargaHorariaHoras"
            type="number"
            min={0}
            defaultValue={initial?.cargaHorariaHoras ?? ""}
            className="input"
            placeholder="Ex: 8"
          />
        </div>
        <div>
          <label className="label">Validade (dias)</label>
          <input
            name="periodicidadeDias"
            type="number"
            min={0}
            defaultValue={initial?.periodicidadeDias ?? ""}
            className="input"
            placeholder="Ex: 365 · deixe em branco se não vence"
          />
        </div>
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
          {state.error}
        </p>
      )}

      <div className="flex justify-end gap-3 border-t border-ink-100 pt-5">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
