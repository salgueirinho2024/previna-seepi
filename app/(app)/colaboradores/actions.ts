"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

const schema = z.object({
  nome: z.string().min(2, "Informe o nome"),
  matricula: z.string().optional(),
  cpf: z.string().optional(),
  cargo: z.string().optional(),
  setorId: z.string().optional(),
  unidadeId: z.string().optional(),
});

export type ColaboradorFormState = { error?: string };

function parseForm(formData: FormData) {
  return schema.safeParse({
    nome: formData.get("nome"),
    matricula: formData.get("matricula") || undefined,
    cpf: formData.get("cpf") || undefined,
    cargo: formData.get("cargo") || undefined,
    setorId: formData.get("setorId") || undefined,
    unidadeId: formData.get("unidadeId") || undefined,
  });
}

export async function createColaborador(
  _prev: ColaboradorFormState,
  formData: FormData
): Promise<ColaboradorFormState> {
  const session = await requireSession();
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };

  await prisma.colaborador.create({
    data: { ...parsed.data, empresaId: session.user.empresaId },
  });

  revalidatePath("/colaboradores");
  redirect("/colaboradores");
}

export async function updateColaborador(
  id: string,
  _prev: ColaboradorFormState,
  formData: FormData
): Promise<ColaboradorFormState> {
  const session = await requireSession();
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };

  await prisma.colaborador.updateMany({
    where: { id, empresaId: session.user.empresaId },
    data: parsed.data,
  });

  revalidatePath("/colaboradores");
  revalidatePath(`/colaboradores/${id}`);
  redirect(`/colaboradores/${id}`);
}

export async function deleteColaborador(id: string) {
  "use server";
  const session = await requireSession();
  await prisma.colaborador.deleteMany({
    where: { id, empresaId: session.user.empresaId },
  });
  revalidatePath("/colaboradores");
  redirect("/colaboradores");
}
