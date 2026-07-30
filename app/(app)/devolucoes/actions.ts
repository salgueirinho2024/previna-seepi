"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

const schema = z.object({
  colaboradorId: z.string().min(1, "Selecione um colaborador"),
  itemId: z.string().min(1, "Selecione o item devolvido"),
  entregaItemId: z.string().optional(),
  quantidade: z.coerce.number().int().min(1),
  motivo: z.string().min(1, "Selecione o motivo"),
  observacao: z.string().optional(),
});

export type DevolucaoFormState = { error?: string };

/**
 * Registra a devolução de um EPI (colaborador desligado, item recolhido, etc).
 * IMPORTANTE: isso só grava histórico — o estoque (estoqueAtual) NÃO é alterado
 * automaticamente, por decisão do cliente.
 */
export async function registrarDevolucao(
  _prev: DevolucaoFormState,
  formData: FormData
): Promise<DevolucaoFormState> {
  const session = await requireSession();
  const empresaId = session.user.empresaId;

  const parsed = schema.safeParse({
    colaboradorId: formData.get("colaboradorId"),
    itemId: formData.get("itemId"),
    entregaItemId: formData.get("entregaItemId") || undefined,
    quantidade: formData.get("quantidade") || 1,
    motivo: formData.get("motivo"),
    observacao: formData.get("observacao") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };

  const colaborador = await prisma.colaborador.findFirst({
    where: { id: parsed.data.colaboradorId, empresaId },
  });
  if (!colaborador) return { error: "Colaborador inválido." };

  await prisma.devolucao.create({
    data: {
      empresaId,
      colaboradorId: parsed.data.colaboradorId,
      itemId: parsed.data.itemId,
      entregaItemId: parsed.data.entregaItemId,
      quantidade: parsed.data.quantidade,
      motivo: parsed.data.motivo,
      observacao: parsed.data.observacao,
    },
  });

  revalidatePath("/devolucoes");
  revalidatePath(`/colaboradores/${parsed.data.colaboradorId}`);
  redirect("/devolucoes");
}
