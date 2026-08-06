"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

const schema = z.object({
  nome: z.string().min(2, "Informe o nome do setor"),
  itemIds: z.array(z.string()).default([]),
  treinamentoIds: z.array(z.string()).default([]),
});

export type SetorFormState = { error?: string };

function parseForm(formData: FormData) {
  return schema.safeParse({
    nome: formData.get("nome"),
    itemIds: formData.getAll("itemId").map(String),
    treinamentoIds: formData.getAll("treinamentoId").map(String),
  });
}

export async function createSetor(_prev: SetorFormState, formData: FormData): Promise<SetorFormState> {
  const session = await requireSession();
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };

  await prisma.setor.create({
    data: {
      nome: parsed.data.nome,
      empresaId: session.user.empresaId,
      itensObrigatorios: {
        create: parsed.data.itemIds.map((itemId) => ({ itemId })),
      },
      treinamentosObrigatorios: {
        create: parsed.data.treinamentoIds.map((treinamentoId) => ({ treinamentoId })),
      },
    },
  });

  revalidatePath("/setores");
  revalidatePath("/treinamentos");
  redirect("/setores");
}

export async function updateSetor(
  id: string,
  _prev: SetorFormState,
  formData: FormData
): Promise<SetorFormState> {
  const session = await requireSession();
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };

  const setor = await prisma.setor.findFirst({ where: { id, empresaId: session.user.empresaId } });
  if (!setor) return { error: "Setor não encontrado." };

  await prisma.$transaction([
    prisma.setor.update({ where: { id }, data: { nome: parsed.data.nome } }),
    prisma.setorItemEPI.deleteMany({ where: { setorId: id } }),
    prisma.setorItemEPI.createMany({
      data: parsed.data.itemIds.map((itemId) => ({ setorId: id, itemId })),
    }),
    prisma.setorTreinamento.deleteMany({ where: { setorId: id } }),
    prisma.setorTreinamento.createMany({
      data: parsed.data.treinamentoIds.map((treinamentoId) => ({ setorId: id, treinamentoId })),
    }),
  ]);

  revalidatePath("/setores");
  revalidatePath("/treinamentos");
  redirect("/setores");
}

export async function deleteSetor(id: string) {
  "use server";
  const session = await requireSession();
  await prisma.setor.deleteMany({ where: { id, empresaId: session.user.empresaId } });
  revalidatePath("/setores");
  revalidatePath("/treinamentos");
  redirect("/setores");
}
