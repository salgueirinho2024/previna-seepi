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
  const [colaboradores, itens, setores] = await Promise.all([
    prisma.colaborador.findMany({
      where: { empresaId: session.user.empresaId },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true, matricula: true, setorId: true },
    }),
    prisma.itemEPI.findMany({
      where: { empresaId: session.user.empresaId },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true, ca: true, estoqueAtual: true },
    }),
    prisma.setor.findMany({
      where: { empresaId: session.user.empresaId },
      select: { id: true, nome: true, itensObrigatorios: { select: { itemId: true } } },
    }),
  ]);

  // setorId -> { nome, itemIds[] obrigatórios } — usado pra pré-marcar os EPIs do setor do colaborador
  const obrigatoriosPorSetor = Object.fromEntries(
    setores.map((s) => [s.id, { nome: s.nome, itemIds: s.itensObrigatorios.map((i) => i.itemId) }])
  );

  return (
    <div>
      <PageHeader title="Nova entrega de EPI" subtitle="Registre a entrega de EPIs para um colaborador" />
      <NovaSolicitacaoForm
        action={createSolicitacao}
        colaboradores={colaboradores}
        itens={itens}
        obrigatoriosPorSetor={obrigatoriosPorSetor}
        colaboradorIdInicial={searchParams.colaboradorId}
      />
    </div>
  );
}
