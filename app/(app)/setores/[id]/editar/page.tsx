import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { SetorForm } from "@/components/SetorForm";
import { DeleteButton } from "@/components/DeleteButton";
import { updateSetor, deleteSetor } from "../../actions";

export default async function EditarSetorPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  const [setor, itens, treinamentos] = await Promise.all([
    prisma.setor.findFirst({
      where: { id: params.id, empresaId: session.user.empresaId },
      include: { itensObrigatorios: true, treinamentosObrigatorios: true },
    }),
    prisma.itemEPI.findMany({
      where: { empresaId: session.user.empresaId },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true, ca: true },
    }),
    prisma.treinamentoCatalogo.findMany({
      where: { empresaId: session.user.empresaId },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true, periodicidadeDias: true },
    }),
  ]);
  if (!setor) notFound();

  const action = updateSetor.bind(null, setor.id);

  return (
    <div>
      <PageHeader title="Editar setor" subtitle={setor.nome} />
      <SetorForm
        action={action}
        itens={itens}
        treinamentos={treinamentos}
        initial={{
          nome: setor.nome,
          itemIds: setor.itensObrigatorios.map((i) => i.itemId),
          treinamentoIds: setor.treinamentosObrigatorios.map((t) => t.treinamentoId),
        }}
        submitLabel="Salvar alterações"
      />
      <div className="mt-4">
        <DeleteButton
          action={deleteSetor.bind(null, setor.id)}
          confirmText="Excluir este setor? Colaboradores vinculados ficarão sem setor."
        />
      </div>
    </div>
  );
}
