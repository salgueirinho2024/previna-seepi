import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { ItemForm } from "@/components/ItemForm";
import { DeleteButton } from "@/components/DeleteButton";
import { updateItem, deleteItem } from "../../actions";

export default async function EditarItemPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  const item = await prisma.itemEPI.findFirst({
    where: { id: params.id, empresaId: session.user.empresaId },
  });
  if (!item) notFound();

  const action = updateItem.bind(null, item.id);

  return (
    <div>
      <PageHeader title="Editar item" subtitle={item.nome} />
      <ItemForm
        action={action}
        initial={{ ...item, custoUnitario: item.custoUnitario as unknown as number, validadeCA: item.validadeCA?.toISOString() ?? null }}
        submitLabel="Salvar alterações"
      />
      <div className="mt-4">
        <DeleteButton action={deleteItem.bind(null, item.id)} />
      </div>
    </div>
  );
}
