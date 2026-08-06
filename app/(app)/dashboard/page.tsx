import Link from "next/link";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatCard, EmptyState } from "@/components/ui";
import { formatDate, formatDateTime, statusBadgeClasses, statusLabel, trocaStatus, daysUntil } from "@/lib/utils";
import { Badge } from "@/components/ui";
import { DiasAvisoTrocaForm } from "@/components/ConfiguracoesForm";

export default async function DashboardPage() {
  const session = await requireSession();
  const empresaId = session.user.empresaId;

  const [empresa, totalColaboradores, itens, solicitacoesPendentes, ultimasSolicitacoes, entregaItens, colaboradoresComSetor] =
    await Promise.all([
      prisma.empresa.findUniqueOrThrow({ where: { id: empresaId }, select: { diasAvisoTroca: true } }),
      prisma.colaborador.count({ where: { empresaId } }),
      prisma.itemEPI.findMany({ where: { empresaId }, select: { estoqueAtual: true, estoqueMinimo: true } }),
      prisma.solicitacao.count({ where: { empresaId, status: "pendente" } }),
      prisma.solicitacao.findMany({
        where: { empresaId },
        include: { colaborador: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.entregaItem.findMany({
        where: { entrega: { empresaId }, proximaTroca: { not: null } },
        include: { item: true, entrega: { include: { colaborador: true } } },
        orderBy: { proximaTroca: "asc" },
      }),
      prisma.colaborador.findMany({
        where: { empresaId },
        include: {
          setor: { include: { treinamentosObrigatorios: true } },
          treinamentoRealizacoes: { select: { treinamentoId: true, validoAte: true }, orderBy: { realizadoEm: "desc" } },
        },
      }),
    ]);

  const diasAvisoTroca = empresa.diasAvisoTroca;

  const totalItens = itens.length;
  const itensBaixoEstoque = itens.filter((i) => i.estoqueAtual <= i.estoqueMinimo).length;

  let treinamentosPendentesOuVencidos = 0;
  for (const c of colaboradoresComSetor) {
    for (const ot of c.setor?.treinamentosObrigatorios ?? []) {
      const ultima = c.treinamentoRealizacoes.find((r) => r.treinamentoId === ot.treinamentoId);
      if (!ultima) {
        treinamentosPendentesOuVencidos++;
      } else if (ultima.validoAte && trocaStatus(ultima.validoAte, diasAvisoTroca) === "vencida") {
        treinamentosPendentesOuVencidos++;
      }
    }
  }

  const avisos = entregaItens
    .filter((ei) => trocaStatus(ei.proximaTroca!, diasAvisoTroca) !== "ok")
    .map((ei) => ({
      id: ei.id,
      colaborador: ei.entrega.colaborador,
      item: ei.item,
      proximaTroca: ei.proximaTroca!,
      status: trocaStatus(ei.proximaTroca!, diasAvisoTroca),
    }));

  return (
    <div>
      <PageHeader title="Painel" subtitle={`Visão geral de ${session.user.empresaNome}`} />

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Colaboradores" value={String(totalColaboradores)} />
        <StatCard label="Itens de EPI cadastrados" value={String(totalItens)} />
        <StatCard label="Itens com estoque baixo" value={String(itensBaixoEstoque)} tone={itensBaixoEstoque > 0 ? "danger" : "default"} />
        <StatCard label="Entregas pendentes" value={String(solicitacoesPendentes)} tone={solicitacoesPendentes > 0 ? "warning" : "default"} />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link href="/treinamentos">
          <StatCard
            label="Treinamentos pendentes ou vencidos"
            value={String(treinamentosPendentesOuVencidos)}
            hint="Ver situação completa em Treinamentos"
            tone={treinamentosPendentesOuVencidos > 0 ? "danger" : "default"}
          />
        </Link>
      </div>

      <div className="card mb-8 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-ink-900">Avisos de troca periódica</h2>
            <p className="text-sm text-ink-500">
              EPIs vencidos ou que vencem em até {diasAvisoTroca} dia(s).{" "}
              <Link href="/configuracoes" className="text-brand-700 hover:underline">
                Ajustar em Configurações
              </Link>
              .
            </p>
          </div>
          <DiasAvisoTrocaForm diasAvisoTroca={diasAvisoTroca} />
        </div>

        {avisos.length === 0 ? (
          <EmptyState title="Nenhum aviso de troca no momento" subtitle="Tudo em dia dentro da janela configurada." />
        ) : (
          <div className="divide-y divide-ink-100">
            {avisos.map((a) => {
              const dias = daysUntil(a.proximaTroca);
              return (
                <Link
                  key={a.id}
                  href={`/colaboradores/${a.colaborador.id}`}
                  className="flex flex-col gap-1 py-3 hover:bg-ink-100/40 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-800">
                      {a.item.nome} · {a.colaborador.nome}
                    </p>
                    <p className="text-xs text-ink-300">Próxima troca: {formatDate(a.proximaTroca)}</p>
                  </div>
                  <Badge className={`shrink-0 self-start sm:self-center ${a.status === "vencida" ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"}`}>
                    {a.status === "vencida" ? `Vencida há ${Math.abs(dias)} dia(s)` : `Vence em ${dias} dia(s)`}
                  </Badge>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink-900">Últimas entregas</h2>
          <Link href="/solicitacoes" className="text-sm font-medium text-brand-700 hover:underline">
            Ver todas
          </Link>
        </div>

        {ultimasSolicitacoes.length === 0 ? (
          <EmptyState title="Nenhuma entrega ainda" subtitle="Registre a primeira entrega de EPI." />
        ) : (
          <div className="divide-y divide-ink-100">
            {ultimasSolicitacoes.map((s) => (
              <Link
                key={s.id}
                href={`/solicitacoes/${s.id}`}
                className="flex flex-col gap-1 py-3 hover:bg-ink-100/40 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-800">
                    #{s.numero} · {s.colaborador.nome}
                  </p>
                  <p className="text-xs text-ink-300">{formatDateTime(s.createdAt)}</p>
                </div>
                <Badge className={`shrink-0 self-start sm:self-center ${statusBadgeClasses(s.status)}`}>{statusLabel(s.status)}</Badge>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
