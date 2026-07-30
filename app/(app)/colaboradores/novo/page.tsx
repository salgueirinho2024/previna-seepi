import { PageHeader } from "@/components/ui";
import { ColaboradorForm } from "@/components/ColaboradorForm";
import { createColaborador } from "../actions";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function NovoColaboradorPage() {
  const session = await requireSession();
  const [unidades, setores] = await Promise.all([
    prisma.unidade.findMany({ where: { empresaId: session.user.empresaId }, orderBy: { nome: "asc" } }),
    prisma.setor.findMany({ where: { empresaId: session.user.empresaId }, orderBy: { nome: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader title="Novo colaborador" subtitle="Cadastre um colaborador para vincular EPIs" />
      <ColaboradorForm action={createColaborador} unidades={unidades} setores={setores} submitLabel="Cadastrar colaborador" />
    </div>
  );
}
