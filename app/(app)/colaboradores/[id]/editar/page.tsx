import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { ColaboradorForm } from "@/components/ColaboradorForm";
import { updateColaborador } from "../../actions";

export default async function EditarColaboradorPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  const [colaborador, unidades, setores] = await Promise.all([
    prisma.colaborador.findFirst({ where: { id: params.id, empresaId: session.user.empresaId } }),
    prisma.unidade.findMany({ where: { empresaId: session.user.empresaId }, orderBy: { nome: "asc" } }),
    prisma.setor.findMany({ where: { empresaId: session.user.empresaId }, orderBy: { nome: "asc" } }),
  ]);
  if (!colaborador) notFound();

  const action = updateColaborador.bind(null, colaborador.id);

  return (
    <div>
      <PageHeader title="Editar colaborador" subtitle={colaborador.nome} />
      <ColaboradorForm action={action} unidades={unidades} setores={setores} initial={colaborador} submitLabel="Salvar alterações" />
    </div>
  );
}
