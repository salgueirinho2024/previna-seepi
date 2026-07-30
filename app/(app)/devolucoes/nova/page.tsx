import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { DevolucaoForm } from "@/components/DevolucaoForm";
import { registrarDevolucao } from "../actions";

export default async function NovaDevolucaoPage({
  searchParams,
}: {
  searchParams: { colaboradorId?: string };
}) {
  const session = await requireSession();

  const colaboradoresRaw = await prisma.colaborador.findMany({
    where: { empresaId: session.user.empresaId },
    orderBy: { nome: "asc" },
    select: {
      id: true,
      nome: true,
      matricula: true,
      entregas: {
        select: {
          itens: {
            select: {
              id: true,
              quantidade: true,
              item: { select: { id: true, nome: true, ca: true } },
            },
          },
        },
      },
    },
  });

  const colaboradores = colaboradoresRaw.map((c) => ({
    id: c.id,
    nome: c.nome,
    matricula: c.matricula,
    itensEntregues: c.entregas.flatMap((e) =>
      e.itens.map((ei) => ({
        entregaItemId: ei.id,
        itemId: ei.item.id,
        itemNome: ei.item.nome,
        itemCa: ei.item.ca,
        quantidadeEntregue: ei.quantidade,
      }))
    ),
  }));

  return (
    <div>
      <PageHeader title="Registrar devolução" subtitle="A devolução registra histórico e não altera o estoque" />
      <DevolucaoForm
        action={registrarDevolucao}
        colaboradores={colaboradores}
        colaboradorIdInicial={searchParams.colaboradorId}
      />
    </div>
  );
}
