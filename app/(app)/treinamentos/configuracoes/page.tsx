import Link from "next/link";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { DiasAvisoTreinamentoForm } from "@/components/ConfiguracoesForm";

export default async function ConfiguracoesTreinamentosPage() {
  const session = await requireSession();

  const empresa = await prisma.empresa.findUniqueOrThrow({
    where: { id: session.user.empresaId },
    select: { diasAvisoTreinamento: true },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Configurações de Treinamentos" subtitle="Preferências do módulo de Treinamentos" />

      <div className="card p-6">
        <h2 className="mb-1 text-base font-semibold text-ink-900">Aviso de vencimento</h2>
        <p className="mb-4 text-sm text-ink-500">
          O Painel de Treinamentos marca um treinamento como &quot;A vencer&quot; quando faltam X dias ou menos
          para o vencimento (calculado a partir da validade cadastrada no catálogo). Defina esse prazo aqui.
          Esse prazo é independente do usado no módulo de EPI.
        </p>
        <DiasAvisoTreinamentoForm diasAvisoTreinamento={empresa.diasAvisoTreinamento} />
      </div>

      <div className="card p-6">
        <h2 className="mb-1 text-base font-semibold text-ink-900">Minha conta</h2>
        <p className="mb-4 text-sm text-ink-500">
          Nome, e-mail, foto e senha são gerenciados em um só lugar para toda a plataforma.
        </p>
        <Link href="/configuracoes" className="btn-secondary">
          Editar minha conta
        </Link>
      </div>
    </div>
  );
}
