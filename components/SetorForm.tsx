"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import type { SetorFormState } from "@/app/(app)/setores/actions";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "Salvando..." : label}
    </button>
  );
}

type Item = { id: string; nome: string; ca: string | null };

export function SetorForm({
  action,
  itens,
  initial,
  submitLabel = "Salvar setor",
}: {
  action: (prev: SetorFormState, formData: FormData) => Promise<SetorFormState>;
  itens: Item[];
  initial?: { nome?: string; itemIds?: string[] };
  submitLabel?: string;
}) {
  const [state, formAction] = useFormState<SetorFormState, FormData>(action, {});
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set(initial?.itemIds ?? []));

  function toggle(id: string) {
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <form action={formAction} className="space-y-6">
      <div className="card space-y-5 p-6">
        <div>
          <label className="label">Nome do setor</label>
          <input name="nome" defaultValue={initial?.nome} className="input" placeholder="Ex: Produção" required />
        </div>
      </div>

      <div className="card p-6">
        <h2 className="mb-1 text-base font-semibold text-ink-900">EPIs obrigatórios</h2>
        <p className="mb-4 text-sm text-ink-500">
          Marque os EPIs que todo colaborador desse setor deve possuir.
        </p>

        {itens.length === 0 ? (
          <p className="text-sm text-ink-300">Nenhum item de EPI cadastrado ainda. Cadastre no Inventário primeiro.</p>
        ) : (
          <div className="space-y-2">
            {itens.map((item) => {
              const marcado = selecionados.has(item.id);
              return (
                <label
                  key={item.id}
                  className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
                    marcado ? "border-brand-500/40 bg-brand-50" : "border-ink-100"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={marcado}
                    onChange={() => toggle(item.id)}
                    className="h-4 w-4 accent-brand-500"
                  />
                  {marcado && <input type="hidden" name="itemId" value={item.id} />}
                  <div>
                    <p className="text-sm font-medium text-ink-800">{item.nome}</p>
                    <p className="text-xs text-ink-300">CA {item.ca ?? "—"}</p>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>}

      <div className="flex justify-end gap-3">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
