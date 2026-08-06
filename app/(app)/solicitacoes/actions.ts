"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { addDays } from "@/lib/utils";

const schema = z.object({
  colaboradorId: z.string().min(1, "Selecione um colaborador"),
  motivo: z.string().min(1, "Selecione o motivo"),
  itemIds: z.array(z.string()).min(1, "Selecione ao menos um item"),
  quantidades: z.array(z.coerce.number().int().min(1)),
});

export type SolicitacaoFormState = { error?: string };

export async function createSolicitacao(
  _prev: SolicitacaoFormState,
  formData: FormData
): Promise<SolicitacaoFormState> {
  const session = await requireSession();

  const itemIds = formData.getAll("itemId").map(String);
  const quantidades = formData.getAll("quantidade").map(String);

  const parsed = schema.safeParse({
    colaboradorId: formData.get("colaboradorId"),
    motivo: formData.get("motivo"),
    itemIds,
    quantidades,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };

  const colaborador = await prisma.colaborador.findFirst({
    where: { id: parsed.data.colaboradorId, empresaId: session.user.empresaId },
  });
  if (!colaborador) return { error: "Colaborador inválido." };

  const solicitacao = await prisma.solicitacao.create({
    data: {
      empresaId: session.user.empresaId,
      colaboradorId: colaborador.id,
      motivo: parsed.data.motivo,
      status: "pendente",
      itens: {
        create: parsed.data.itemIds.map((itemId, i) => ({
          itemId,
          quantidade: parsed.data.quantidades[i] ?? 1,
        })),
      },
    },
  });

  revalidatePath("/solicitacoes");
  redirect(`/solicitacoes/${solicitacao.id}`);
}

export async function aprovarSolicitacao(id: string) {
  const session = await requireSession();
  await prisma.solicitacao.updateMany({
    where: { id, empresaId: session.user.empresaId, status: "pendente" },
    data: { status: "aprovada" },
  });
  revalidatePath(`/solicitacoes/${id}`);
  revalidatePath("/solicitacoes");
}

export async function cancelarSolicitacao(id: string) {
  const session = await requireSession();
  await prisma.solicitacao.updateMany({
    where: { id, empresaId: session.user.empresaId },
    data: { status: "cancelada" },
  });
  revalidatePath(`/solicitacoes/${id}`);
  revalidatePath("/solicitacoes");
}

/** Desfaz um cancelamento feito por engano, voltando a entrega para "pendente". */
export async function reabrirSolicitacao(id: string) {
  const session = await requireSession();
  await prisma.solicitacao.updateMany({
    where: { id, empresaId: session.user.empresaId, status: "cancelada" },
    data: { status: "pendente" },
  });
  revalidatePath(`/solicitacoes/${id}`);
  revalidatePath("/solicitacoes");
}

/**
 * Desfaz uma entrega já efetuada por engano: devolve a quantidade ao estoque,
 * apaga o registro de entrega e volta a solicitação para "aprovada".
 */
export async function desfazerEntrega(id: string) {
  const session = await requireSession();
  const empresaId = session.user.empresaId;

  const solicitacao = await prisma.solicitacao.findFirst({
    where: { id, empresaId },
    include: { entrega: { include: { itens: true } } },
  });
  if (!solicitacao?.entrega) return;

  await prisma.$transaction(async (tx) => {
    for (const ei of solicitacao.entrega!.itens) {
      await tx.itemEPI.update({
        where: { id: ei.itemId },
        data: { estoqueAtual: { increment: ei.quantidade } },
      });
    }
    await tx.entrega.delete({ where: { id: solicitacao.entrega!.id } });
    await tx.solicitacao.update({ where: { id }, data: { status: "aprovada" } });
  });

  revalidatePath(`/solicitacoes/${id}`);
  revalidatePath("/solicitacoes");
  revalidatePath("/inventario");
  revalidatePath(`/colaboradores/${solicitacao.colaboradorId}`);
  revalidatePath("/dashboard");
}

/**
 * Exclui a entrega/solicitação definitivamente. Se já tinha sido efetuada,
 * devolve a quantidade ao estoque antes de apagar (evita perder o registro do estoque).
 */
export async function excluirSolicitacao(id: string) {
  const session = await requireSession();
  const empresaId = session.user.empresaId;

  const solicitacao = await prisma.solicitacao.findFirst({
    where: { id, empresaId },
    include: { entrega: { include: { itens: true } } },
  });
  if (!solicitacao) return;

  await prisma.$transaction(async (tx) => {
    if (solicitacao.entrega) {
      for (const ei of solicitacao.entrega.itens) {
        await tx.itemEPI.update({
          where: { id: ei.itemId },
          data: { estoqueAtual: { increment: ei.quantidade } },
        });
      }
    }
    await tx.solicitacao.delete({ where: { id } });
  });

  revalidatePath("/solicitacoes");
  revalidatePath("/inventario");
  revalidatePath(`/colaboradores/${solicitacao.colaboradorId}`);
  revalidatePath("/dashboard");
  redirect("/solicitacoes");
}

/** Efetuar a entrega: baixa o estoque, cria o registro de Entrega e calcula a próxima troca de cada item. */
export async function efetuarEntrega(id: string) {
  const session = await requireSession();
  const empresaId = session.user.empresaId;

  const solicitacao = await prisma.solicitacao.findFirst({
    where: { id, empresaId },
    include: { itens: { include: { item: true } } },
  });
  if (!solicitacao || solicitacao.status === "entregue" || solicitacao.status === "cancelada") return;

  await prisma.$transaction(async (tx) => {
    const entrega = await tx.entrega.create({
      data: {
        empresaId,
        solicitacaoId: solicitacao.id,
        colaboradorId: solicitacao.colaboradorId,
        itens: {
          create: solicitacao.itens.map((si) => ({
            itemId: si.itemId,
            quantidade: si.quantidade,
            proximaTroca: si.item.periodicidadeDias
              ? addDays(new Date(), si.item.periodicidadeDias)
              : null,
          })),
        },
      },
    });

    for (const si of solicitacao.itens) {
      await tx.itemEPI.update({
        where: { id: si.itemId },
        data: { estoqueAtual: { decrement: si.quantidade } },
      });
    }

    await tx.solicitacao.update({ where: { id: solicitacao.id }, data: { status: "entregue" } });
    return entrega;
  });

  revalidatePath(`/solicitacoes/${id}`);
  revalidatePath("/solicitacoes");
  revalidatePath("/inventario");
  revalidatePath(`/colaboradores/${solicitacao.colaboradorId}`);
  revalidatePath("/dashboard");
}

/** A assinatura agora é sempre manual/escrita — coletada no papel e apenas confirmada aqui. */
export async function assinarEntrega(entregaId: string) {
  const session = await requireSession();
  const entrega = await prisma.entrega.findFirst({
    where: { id: entregaId, empresaId: session.user.empresaId },
  });
  if (!entrega) return;

  await prisma.entrega.update({
    where: { id: entregaId },
    data: { assinado: true, assinaturaTipo: "manual", assinadoEm: new Date() },
  });

  revalidatePath(`/solicitacoes/${entrega.solicitacaoId}`);
  revalidatePath("/dashboard");
  revalidatePath(`/colaboradores/${entrega.colaboradorId}`);
}
