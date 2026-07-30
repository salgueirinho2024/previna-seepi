"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  updateConfiguracoes,
  updateAccount,
  type ConfiguracoesFormState,
  type AccountFormState,
} from "@/app/(app)/configuracoes/actions";

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

function AccountSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "Salvando..." : "Salvar alterações"}
    </button>
  );
}

export function AccountForm({
  name,
  email,
  image,
}: {
  name: string;
  email: string;
  image?: string | null;
}) {
  const { update } = useSession();
  const router = useRouter();
  const [state, formAction] = useFormState<AccountFormState, FormData>(updateAccount, {});
  const [preview, setPreview] = useState<string | null | undefined>(image);
  const [removeImage, setRemoveImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.success) {
      update({ name: state.name, image: state.image });
      router.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setRemoveImage(false);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleRemovePhoto() {
    setPreview(null);
    setRemoveImage(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <form action={formAction} className="space-y-5">
      <div className="flex items-center gap-4">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Foto de perfil"
            className="h-16 w-16 rounded-full border border-ink-100 object-cover"
          />
        ) : (
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-lg font-semibold text-brand-700">
            {name.slice(0, 1).toUpperCase()}
          </span>
        )}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            name="image"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            className="hidden"
            id="account-photo-input"
          />
          <div className="flex gap-2">
            <label htmlFor="account-photo-input" className="btn-secondary cursor-pointer text-xs">
              Alterar foto
            </label>
            {preview && (
              <button type="button" onClick={handleRemovePhoto} className="btn-secondary text-xs">
                Remover
              </button>
            )}
          </div>
          <p className="mt-1.5 text-xs text-ink-300">PNG, JPEG ou WEBP · até 1,5MB</p>
        </div>
        <input type="hidden" name="removeImage" value={removeImage ? "true" : "false"} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Nome</label>
          <input name="name" defaultValue={name} required className="input" />
        </div>
        <div>
          <label className="label">E-mail</label>
          <input name="email" type="email" defaultValue={email} required className="input" />
        </div>
      </div>

      <div className="border-t border-ink-100 pt-5">
        <h3 className="mb-1 text-sm font-semibold text-ink-900">Alterar senha</h3>
        <p className="mb-3 text-xs text-ink-500">Deixe em branco se não quiser alterar sua senha.</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Senha atual</label>
            <input name="currentPassword" type="password" className="input" placeholder="••••••••" />
          </div>
          <div>
            <label className="label">Nova senha</label>
            <input name="newPassword" type="password" className="input" placeholder="••••••••" />
          </div>
          <div>
            <label className="label">Confirmar nova senha</label>
            <input name="confirmPassword" type="password" className="input" placeholder="••••••••" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <AccountSubmitButton />
        {state.success && <p className="text-sm font-medium text-brand-700 dark:text-brand-400">Salvo!</p>}
        {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      </div>
    </form>
  );
}
