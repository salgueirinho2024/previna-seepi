import Link from "next/link";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatCard, EmptyState } from "@/components/ui";
import { formatDateTime, statusBadgeClasses, statusLabel } from "@/lib/utils";
import { Badge } from "@/components/ui";

export default async function DashboardPage() {
  const session = await requireSession();
  const empresaId = session.user.empresaId;

  const [totalColaboradores, itens, solicitacoesPendentes, ultimasSolicitacoes] = await Promise.all([
    prisma.colaborador.count({ where: { empresaId } }),
    prisma.itemEPI.findMany({ where: { empresaId }, select: { estoqueAtual: true, estoqueMinimo: true } }),
    prisma.solicitacao.count({ where: { empresaId, status: "pendente" } }),
    prisma.solicitacao.findMany({
      where: { empresaId },
      include: { colaborador: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const totalItens = itens.length;
  const itensBaixoEstoque = itens.filter((i) => i.estoqueAtual <= i.estoqueMinimo).length;

  return (
    <div>
      <PageHeader title="Painel" subtitle={`Visão geral de ${session.user.empresaNome}`} />

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Colaboradores" value={String(totalColaboradores)} />
        <StatCard label="Itens de EPI cadastrados" value={String(totalItens)} />
        <StatCard label="Itens com estoque baixo" value={String(itensBaixoEstoque)} tone={itensBaixoEstoque > 0 ? "danger" : "default"} />
        <StatCard label="Solicitações pendentes" value={String(solicitacoesPendentes)} tone={solicitacoesPendentes > 0 ? "warning" : "default"} />
      </div>

      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink-900">Últimas solicitações</h2>
          <Link href="/solicitacoes" className="text-sm font-medium text-brand-700 hover:underline">
            Ver todas
          </Link>
        </div>

        {ultimasSolicitacoes.length === 0 ? (
          <EmptyState title="Nenhuma solicitação ainda" subtitle="Crie a primeira solicitação de EPI." />
        ) : (
          <div className="divide-y divide-ink-100">
            {ultimasSolicitacoes.map((s) => (
              <Link
                key={s.id}
                href={`/solicitacoes/${s.id}`}
                className="flex items-center justify-between py-3 hover:bg-ink-100/40"
              >
                <div>
                  <p className="text-sm font-medium text-ink-800">
                    #{s.numero} · {s.colaborador.nome}
                  </p>
                  <p className="text-xs text-ink-300">{formatDateTime(s.createdAt)}</p>
                </div>
                <Badge className={statusBadgeClasses(s.status)}>{statusLabel(s.status)}</Badge>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
