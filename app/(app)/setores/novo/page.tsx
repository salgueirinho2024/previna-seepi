import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { SetorForm } from "@/components/SetorForm";
import { createSetor } from "../actions";

export default async function NovoSetorPage() {
  const session = await requireSession();
  const itens = await prisma.itemEPI.findMany({
    where: { empresaId: session.user.empresaId },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true, ca: true },
  });

  return (
    <div>
      <PageHeader title="Novo setor" subtitle="Defina o setor e os EPIs obrigatórios para quem trabalha nele" />
      <SetorForm action={createSetor} itens={itens} submitLabel="Cadastrar setor" />
    </div>
  );
}
