import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { TreinamentoForm } from "@/components/TreinamentoForm";
import { DeleteButton } from "@/components/DeleteButton";
import { atualizarTreinamento, excluirTreinamento } from "../../../actions";

export default async function EditarTreinamentoPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  const treinamento = await prisma.treinamentoCatalogo.findFirst({
    where: { id: params.id, empresaId: session.user.empresaId },
  });
  if (!treinamento) notFound();

  const action = atualizarTreinamento.bind(null, treinamento.id);

  return (
    <div>
      <PageHeader title="Editar treinamento" subtitle={treinamento.nome} />
      <TreinamentoForm action={action} initial={treinamento} submitLabel="Salvar alterações" />
      <div className="mt-4">
        <DeleteButton
          action={excluirTreinamento.bind(null, treinamento.id)}
          confirmText="Excluir este treinamento do catálogo? Registros de realização e vínculos com setores também serão removidos."
        />
      </div>
    </div>
  );
}
