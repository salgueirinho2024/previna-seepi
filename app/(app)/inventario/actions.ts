"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

const schema = z.object({
  nome: z.string().min(2, "Informe o nome do item"),
  ca: z.string().optional(),
  fabricante: z.string().optional(),
  categoriaNR: z.string().optional(),
  descricao: z.string().optional(),
  custoUnitario: z.coerce.number().min(0).default(0),
  periodicidadeDias: z.coerce.number().int().min(0).optional(),
  estoqueAtual: z.coerce.number().int().min(0).default(0),
  estoqueMinimo: z.coerce.number().int().min(0).default(0),
  validadeCA: z.string().optional(),
});

export type ItemFormState = { error?: string };

function parseForm(formData: FormData) {
  return schema.safeParse({
    nome: formData.get("nome"),
    ca: formData.get("ca") || undefined,
    fabricante: formData.get("fabricante") || undefined,
    categoriaNR: formData.get("categoriaNR") || undefined,
    descricao: formData.get("descricao") || undefined,
    custoUnitario: formData.get("custoUnitario") || 0,
    periodicidadeDias: formData.get("periodicidadeDias") || undefined,
    estoqueAtual: formData.get("estoqueAtual") || 0,
    estoqueMinimo: formData.get("estoqueMinimo") || 0,
    validadeCA: formData.get("validadeCA") || undefined,
  });
}

export async function createItem(_prev: ItemFormState, formData: FormData): Promise<ItemFormState> {
  const session = await requireSession();
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };

  const { validadeCA, ...rest } = parsed.data;
  await prisma.itemEPI.create({
    data: {
      ...rest,
      empresaId: session.user.empresaId,
      validadeCA: validadeCA ? new Date(validadeCA) : undefined,
    },
  });

  revalidatePath("/inventario");
  redirect("/inventario");
}

export async function updateItem(
  id: string,
  _prev: ItemFormState,
  formData: FormData
): Promise<ItemFormState> {
  const session = await requireSession();
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };

  const { validadeCA, ...rest } = parsed.data;
  await prisma.itemEPI.updateMany({
    where: { id, empresaId: session.user.empresaId },
    data: {
      ...rest,
      validadeCA: validadeCA ? new Date(validadeCA) : null,
    },
  });

  revalidatePath("/inventario");
  redirect("/inventario");
}

export async function deleteItem(id: string) {
  "use server";
  const session = await requireSession();
  await prisma.itemEPI.deleteMany({
    where: { id, empresaId: session.user.empresaId },
  });
  revalidatePath("/inventario");
  redirect("/inventario");
}
