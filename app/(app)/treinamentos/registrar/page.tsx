import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { TreinamentoRealizacaoForm } from "@/components/TreinamentoRealizacaoForm";
import { registrarRealizacao } from "../actions";

export default async function RegistrarTreinamentoPage({
  searchParams,
}: {
  searchParams: { colaboradorId?: string; treinamentoId?: string };
}) {
  const session = await requireSession();
  const empresaId = session.user.empresaId;

  const [colaboradoresRaw, treinamentos] = await Promise.all([
    prisma.colaborador.findMany({
      where: { empresaId },
      orderBy: { nome: "asc" },
      select: {
        id: true,
        nome: true,
        matricula: true,
        setor: { select: { nome: true } },
      },
    }),
    prisma.treinamentoCatalogo.findMany({
      where: { empresaId },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true, periodicidadeDias: true },
    }),
  ]);

  const colaboradores = colaboradoresRaw.map((c) => ({
    id: c.id,
    nome: c.nome,
    matricula: c.matricula,
    setorNome: c.setor?.nome ?? null,
  }));

  return (
    <div>
      <PageHeader title="Registrar treinamento" subtitle="Registre a realização ou renovação de um treinamento" />
      <TreinamentoRealizacaoForm
        action={registrarRealizacao}
        colaboradores={colaboradores}
        treinamentos={treinamentos}
        colaboradorIdInicial={searchParams.colaboradorId}
        treinamentoIdInicial={searchParams.treinamentoId}
      />
    </div>
  );
}
