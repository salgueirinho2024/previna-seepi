"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

const catalogoSchema = z.object({
  nome: z.string().min(2, "Informe o nome do treinamento"),
  descricao: z.string().optional(),
  cargaHorariaHoras: z.coerce.number().int().min(0).optional(),
  periodicidadeDias: z.coerce.number().int().min(0).optional(),
});

export type TreinamentoFormState = { error?: string };

function parseCatalogoForm(formData: FormData) {
  return catalogoSchema.safeParse({
    nome: formData.get("nome"),
    descricao: formData.get("descricao") || undefined,
    cargaHorariaHoras: formData.get("cargaHorariaHoras") || undefined,
    periodicidadeDias: formData.get("periodicidadeDias") || undefined,
  });
}

export async function criarTreinamento(
  _prev: TreinamentoFormState,
  formData: FormData
): Promise<TreinamentoFormState> {
  const session = await requireSession();
  const parsed = parseCatalogoForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };

  await prisma.treinamentoCatalogo.create({
    data: {
      ...parsed.data,
      empresaId: session.user.empresaId,
    },
  });

  revalidatePath("/treinamentos");
  revalidatePath("/treinamentos/catalogo");
  redirect("/treinamentos/catalogo");
}

export async function atualizarTreinamento(
  id: string,
  _prev: TreinamentoFormState,
  formData: FormData
): Promise<TreinamentoFormState> {
  const session = await requireSession();
  const parsed = parseCatalogoForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };

  await prisma.treinamentoCatalogo.updateMany({
    where: { id, empresaId: session.user.empresaId },
    data: parsed.data,
  });

  revalidatePath("/treinamentos");
  revalidatePath("/treinamentos/catalogo");
  redirect("/treinamentos/catalogo");
}

export async function excluirTreinamento(id: string) {
  "use server";
  const session = await requireSession();
  await prisma.treinamentoCatalogo.deleteMany({
    where: { id, empresaId: session.user.empresaId },
  });
  revalidatePath("/treinamentos");
  revalidatePath("/treinamentos/catalogo");
  redirect("/treinamentos/catalogo");
}

const realizacaoSchema = z.object({
  colaboradorId: z.string().min(1, "Selecione um colaborador"),
  treinamentoId: z.string().min(1, "Selecione o treinamento"),
  realizadoEm: z.string().min(1, "Informe a data de realização"),
  instrutor: z.string().optional(),
  observacao: z.string().optional(),
});

export type RealizacaoFormState = { error?: string };

/**
 * Registra que um colaborador realizou (ou renovou) um treinamento.
 * validoAte é calculado automaticamente a partir da periodicidadeDias do catálogo,
 * contando a partir da data de realização informada.
 */
export async function registrarRealizacao(
  _prev: RealizacaoFormState,
  formData: FormData
): Promise<RealizacaoFormState> {
  const session = await requireSession();
  const empresaId = session.user.empresaId;

  const parsed = realizacaoSchema.safeParse({
    colaboradorId: formData.get("colaboradorId"),
    treinamentoId: formData.get("treinamentoId"),
    realizadoEm: formData.get("realizadoEm"),
    instrutor: formData.get("instrutor") || undefined,
    observacao: formData.get("observacao") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };

  const [colaborador, treinamento] = await Promise.all([
    prisma.colaborador.findFirst({ where: { id: parsed.data.colaboradorId, empresaId } }),
    prisma.treinamentoCatalogo.findFirst({ where: { id: parsed.data.treinamentoId, empresaId } }),
  ]);
  if (!colaborador) return { error: "Colaborador inválido." };
  if (!treinamento) return { error: "Treinamento inválido." };

  const realizadoEm = new Date(parsed.data.realizadoEm);
  const validoAte = treinamento.periodicidadeDias
    ? new Date(realizadoEm.getTime() + treinamento.periodicidadeDias * 86400000)
    : null;

  await prisma.treinamentoRealizacao.create({
    data: {
      empresaId,
      colaboradorId: parsed.data.colaboradorId,
      treinamentoId: parsed.data.treinamentoId,
      realizadoEm,
      validoAte,
      instrutor: parsed.data.instrutor,
      observacao: parsed.data.observacao,
    },
  });

  revalidatePath("/treinamentos");
  revalidatePath(`/colaboradores/${parsed.data.colaboradorId}`);
  redirect("/treinamentos");
}

/** Exclui um registro de realização lançado por engano. */
export async function excluirRealizacao(id: string) {
  const session = await requireSession();
  const empresaId = session.user.empresaId;

  const realizacao = await prisma.treinamentoRealizacao.findFirst({ where: { id, empresaId } });
  if (!realizacao) return;

  await prisma.treinamentoRealizacao.delete({ where: { id } });

  revalidatePath("/treinamentos");
  revalidatePath(`/colaboradores/${realizacao.colaboradorId}`);
}
