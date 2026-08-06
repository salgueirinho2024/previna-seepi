import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { SetorForm } from "@/components/SetorForm";
import { createSetor } from "../actions";

export default async function NovoSetorPage() {
  const session = await requireSession();
  const [itens, treinamentos] = await Promise.all([
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

  return (
    <div>
      <PageHeader title="Novo setor" subtitle="Defina o setor e os EPIs e treinamentos obrigatórios para quem trabalha nele" />
      <SetorForm action={createSetor} itens={itens} treinamentos={treinamentos} submitLabel="Cadastrar setor" />
    </div>
  );
}
