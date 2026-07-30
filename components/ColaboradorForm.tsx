"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { ColaboradorFormState } from "@/app/(app)/colaboradores/actions";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "Salvando..." : label}
    </button>
  );
}

type Unidade = { id: string; nome: string };
type Setor = { id: string; nome: string };
type Initial = {
  nome?: string;
  matricula?: string | null;
  cpf?: string | null;
  cargo?: string | null;
  setorId?: string | null;
  unidadeId?: string | null;
};

export function ColaboradorForm({
  action,
  unidades,
  setores,
  initial,
  submitLabel = "Salvar",
}: {
  action: (prev: ColaboradorFormState, formData: FormData) => Promise<ColaboradorFormState>;
  unidades: Unidade[];
  setores: Setor[];
  initial?: Initial;
  submitLabel?: string;
}) {
  const [state, formAction] = useFormState<ColaboradorFormState, FormData>(action, {});

  return (
    <form action={formAction} className="card space-y-5 p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Nome completo</label>
          <input name="nome" defaultValue={initial?.nome} className="input" required />
        </div>
        <div>
          <label className="label">Matrícula</label>
          <input name="matricula" defaultValue={initial?.matricula ?? ""} className="input" placeholder="Ex: FUNC001" />
        </div>
        <div>
          <label className="label">CPF</label>
          <input name="cpf" defaultValue={initial?.cpf ?? ""} className="input" placeholder="000.000.000-00" />
        </div>
        <div>
          <label className="label">Cargo</label>
          <input name="cargo" defaultValue={initial?.cargo ?? ""} className="input" />
        </div>
        <div>
          <label className="label">Setor</label>
          <select name="setorId" defaultValue={initial?.setorId ?? ""} className="input">
            <option value="">Sem setor</option>
            {setores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome}
              </option>
            ))}
          </select>
          {setores.length === 0 && (
            <p className="mt-1 text-xs text-ink-300">
              Nenhum setor cadastrado ainda. Cadastre em Setores para definir os EPIs obrigatórios.
            </p>
          )}
        </div>
        <div>
          <label className="label">Unidade</label>
          <select name="unidadeId" defaultValue={initial?.unidadeId ?? ""} className="input">
            <option value="">Selecione...</option>
            {unidades.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">{state.error}</p>}

      <div className="flex justify-end gap-3 border-t border-ink-100 pt-5">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
