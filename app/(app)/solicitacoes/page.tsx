import Link from "next/link";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState, Badge } from "@/components/ui";
import { formatDateTime, statusBadgeClasses, statusLabel } from "@/lib/utils";

export default async function SolicitacoesPage() {
  const session = await requireSession();
  const solicitacoes = await prisma.solicitacao.findMany({
    where: { empresaId: session.user.empresaId },
    include: { colaborador: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Solicitações"
        subtitle={`${solicitacoes.length} solicitação(ões)`}
        action={{ href: "/solicitacoes/nova", label: "+ Nova solicitação" }}
      />

      {solicitacoes.length === 0 ? (
        <EmptyState title="Nenhuma solicitação ainda" subtitle="Crie a primeira solicitação de EPI." />
      ) : (
        <div className="card divide-y divide-ink-100">
          {solicitacoes.map((s) => (
            <Link
              key={s.id}
              href={`/solicitacoes/${s.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-ink-100/40"
            >
              <div>
                <p className="text-sm font-medium text-ink-800">
                  #{s.numero} · {s.colaborador.nome}
                </p>
                <p className="text-xs text-ink-300">
                  {s.motivo} · {formatDateTime(s.createdAt)}
                </p>
              </div>
              <Badge className={statusBadgeClasses(s.status)}>{statusLabel(s.status)}</Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
