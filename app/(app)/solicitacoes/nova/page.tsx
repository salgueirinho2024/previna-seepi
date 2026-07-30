import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { NovaSolicitacaoForm } from "@/components/NovaSolicitacaoForm";
import { createSolicitacao } from "../actions";

export default async function NovaSolicitacaoPage({
  searchParams,
}: {
  searchParams: { colaboradorId?: string };
}) {
  const session = await requireSession();
  const [colaboradores, itens] = await Promise.all([
    prisma.colaborador.findMany({
      where: { empresaId: session.user.empresaId },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true, matricula: true },
    }),
    prisma.itemEPI.findMany({
      where: { empresaId: session.user.empresaId },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true, ca: true, estoqueAtual: true },
    }),
  ]);

  return (
    <div>
      <PageHeader title="Nova solicitação de EPI" subtitle="Registre a entrega de EPIs para um colaborador" />
      <NovaSolicitacaoForm
        action={createSolicitacao}
        colaboradores={colaboradores}
        itens={itens}
        colaboradorIdInicial={searchParams.colaboradorId}
      />
    </div>
  );
}
