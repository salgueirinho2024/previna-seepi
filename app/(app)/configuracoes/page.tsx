import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { DiasAvisoTrocaForm } from "@/components/ConfiguracoesForm";

export default async function ConfiguracoesPage() {
  const session = await requireSession();
  const empresa = await prisma.empresa.findUniqueOrThrow({
    where: { id: session.user.empresaId },
    select: { diasAvisoTroca: true },
  });

  return (
    <div>
      <PageHeader title="Configurações" subtitle="Preferências gerais do sistema para sua empresa" />

      <div className="card p-6">
        <h2 className="mb-1 text-base font-semibold text-ink-900">Aviso de troca periódica</h2>
        <p className="mb-4 text-sm text-ink-500">
          O Painel avisa quando um EPI está próximo da data de troca (`próxima troca`, calculada a partir do
          tempo de troca cadastrado em cada item). Defina com quantos dias de antecedência esse aviso deve
          aparecer.
        </p>
        <DiasAvisoTrocaForm diasAvisoTroca={empresa.diasAvisoTroca} />
      </div>
    </div>
  );
}
