"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { ItemFormState } from "@/app/(app)/inventario/actions";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "Salvando..." : label}
    </button>
  );
}

type ItemInitial = {
  nome?: string;
  ca?: string | null;
  fabricante?: string | null;
  categoriaNR?: string | null;
  descricao?: string | null;
  custoUnitario?: number | string;
  periodicidadeDias?: number | null;
  estoqueAtual?: number;
  estoqueMinimo?: number;
  validadeCA?: string | null;
};

export function ItemForm({
  action,
  initial,
  submitLabel = "Salvar item",
}: {
  action: (prev: ItemFormState, formData: FormData) => Promise<ItemFormState>;
  initial?: ItemInitial;
  submitLabel?: string;
}) {
  const [state, formAction] = useFormState<ItemFormState, FormData>(action, {});

  return (
    <form action={formAction} className="card space-y-5 p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Nome do item</label>
          <input name="nome" defaultValue={initial?.nome} className="input" placeholder="Ex: Capacete de Segurança 3M H-700" required />
        </div>

        <div>
          <label className="label">CA (Certificado de Aprovação)</label>
          <input name="ca" defaultValue={initial?.ca ?? ""} className="input" placeholder="Ex: 29638" />
        </div>
        <div>
          <label className="label">Fabricante</label>
          <input name="fabricante" defaultValue={initial?.fabricante ?? ""} className="input" placeholder="Ex: 3M" />
        </div>

        <div className="sm:col-span-2">
          <label className="label">Categoria / Norma</label>
          <input
            name="categoriaNR"
            defaultValue={initial?.categoriaNR ?? ""}
            className="input"
            placeholder="Ex: EPI (NR-6) • Capacete para proteção do crânio"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="label">Descrição (opcional)</label>
          <textarea
            name="descricao"
            defaultValue={initial?.descricao ?? ""}
            className="input min-h-20"
            placeholder="Ex: Capacete de proteção individual contra impactos"
          />
        </div>

        <div>
          <label className="label">Tempo de troca (dias)</label>
          <input
            name="periodicidadeDias"
            type="number"
            min={0}
            defaultValue={initial?.periodicidadeDias ?? ""}
            className="input"
            placeholder="Ex: 365"
          />
        </div>
        <div>
          <label className="label">Validade do CA</label>
          <input
            name="validadeCA"
            type="date"
            defaultValue={initial?.validadeCA ? initial.validadeCA.slice(0, 10) : ""}
            className="input"
          />
        </div>

        <div>
          <label className="label">Custo unitário (R$)</label>
          <input
            name="custoUnitario"
            type="number"
            step="0.01"
            min={0}
            defaultValue={initial?.custoUnitario as any}
            className="input"
            placeholder="0,00"
          />
        </div>
        <div />

        <div>
          <label className="label">Estoque atual</label>
          <input name="estoqueAtual" type="number" min={0} defaultValue={initial?.estoqueAtual ?? 0} className="input" />
        </div>
        <div>
          <label className="label">Estoque mínimo</label>
          <input name="estoqueMinimo" type="number" min={0} defaultValue={initial?.estoqueMinimo ?? 0} className="input" />
        </div>
      </div>

      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">{state.error}</p>}

      <div className="flex justify-end gap-3 border-t border-ink-100 pt-5">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
