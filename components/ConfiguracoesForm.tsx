"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateConfiguracoes, type ConfiguracoesFormState } from "@/app/(app)/configuracoes/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary shrink-0" disabled={pending}>
      {pending ? "Salvando..." : "Salvar"}
    </button>
  );
}

export function DiasAvisoTrocaForm({ diasAvisoTroca }: { diasAvisoTroca: number }) {
  const [state, formAction] = useFormState<ConfiguracoesFormState, FormData>(updateConfiguracoes, {});

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="label">Avisar com quantos dias de antecedência?</label>
        <input
          type="number"
          name="diasAvisoTroca"
          min={1}
          defaultValue={diasAvisoTroca}
          className="input w-32"
        />
      </div>
      <SubmitButton />
      {state.success && <p className="text-sm font-medium text-brand-700">Salvo!</p>}
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
