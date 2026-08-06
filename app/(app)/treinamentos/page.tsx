import Link from "next/link";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatCard, EmptyState, Badge } from "@/components/ui";
import {
  formatDate,
  formatDateTime,
  trocaStatus,
  treinamentoStatusBadgeClasses,
  treinamentoStatusLabel,
  type TreinamentoStatus,
} from "@/lib/utils";
import { RealizacaoDeleteButton } from "@/components/RealizacaoDeleteButton";

export default async function TreinamentosPage() {
  const session = await requireSession();
  const empresaId = session.user.empresaId;

  const [empresa, colaboradores, ultimasRealizacoes] = await Promise.all([
    prisma.empresa.findUniqueOrThrow({ where: { id: empresaId }, select: { diasAvisoTroca: true } }),
    prisma.colaborador.findMany({
      where: { empresaId },
      include: {
        setor: {
          include: { treinamentosObrigatorios: { include: { treinamento: true } } },
        },
        treinamentoRealizacoes: {
          orderBy: { realizadoEm: "desc" },
        },
      },
      orderBy: { nome: "asc" },
    }),
    prisma.treinamentoRealizacao.findMany({
      where: { empresaId },
      include: { colaborador: true, treinamento: true },
      orderBy: { realizadoEm: "desc" },
      take: 20,
    }),
  ]);

  const diasAviso = empresa.diasAvisoTroca;

  type Linha = {
    colaboradorId: string;
    colaboradorNome: string;
    setorNome: string | null;
    treinamentoId: string;
    treinamentoNome: string;
    status: TreinamentoStatus;
    validoAte: Date | null;
  };

  const linhas: Linha[] = [];

  for (const c of colaboradores) {
    for (const ot of c.setor?.treinamentosObrigatorios ?? []) {
      const ultima = c.treinamentoRealizacoes.find((r) => r.treinamentoId === ot.treinamentoId);

      let status: TreinamentoStatus;
      let validoAte: Date | null = null;

      if (!ultima) {
        status = "pendente";
      } else if (!ultima.validoAte) {
        status = "sem_vencimento";
      } else {
        validoAte = ultima.validoAte;
        const s = trocaStatus(ultima.validoAte, diasAviso);
        status = s === "vencida" ? "vencido" : s === "atencao" ? "atencao" : "ok";
      }

      linhas.push({
        colaboradorId: c.id,
        colaboradorNome: c.nome,
        setorNome: c.setor?.nome ?? null,
        treinamentoId: ot.treinamentoId,
        treinamentoNome: ot.treinamento.nome,
        status,
        validoAte,
      });
    }
  }

  const pendentes = linhas.filter((l) => l.status === "pendente").length;
  const vencidos = linhas.filter((l) => l.status === "vencido").length;
  const aVencer = linhas.filter((l) => l.status === "atencao").length;
  const emDia = linhas.filter((l) => l.status === "ok" || l.status === "sem_vencimento").length;

  const ordemStatus: Record<TreinamentoStatus, number> = {
    vencido: 0,
    pendente: 1,
    atencao: 2,
    ok: 3,
    sem_vencimento: 4,
  };
  const linhasOrdenadas = [...linhas].sort((a, b) => ordemStatus[a.status] - ordemStatus[b.status]);

  return (
    <div>
      <PageHeader
        title="Treinamentos"
        subtitle="Situação dos treinamentos obrigatórios por colaborador"
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <Link href="/treinamentos/registrar" className="btn-primary">
          + Registrar treinamento
        </Link>
        <Link href="/treinamentos/catalogo" className="btn-secondary">
          Catálogo de treinamentos
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pendentes" value={String(pendentes)} tone={pendentes > 0 ? "danger" : "default"} />
        <StatCard label="Vencidos" value={String(vencidos)} tone={vencidos > 0 ? "danger" : "default"} />
        <StatCard label="A vencer" value={String(aVencer)} tone={aVencer > 0 ? "warning" : "default"} />
        <StatCard label="Em dia" value={String(emDia)} tone="brand" />
      </div>

      <h2 className="mb-3 text-base font-semibold text-ink-900">Situação por colaborador</h2>
      {linhasOrdenadas.length === 0 ? (
        <EmptyState
          title="Nenhum treinamento obrigatório configurado"
          subtitle="Cadastre treinamentos no catálogo e defina quais são obrigatórios em cada setor."
        />
      ) : (
        <div className="card mb-10 divide-y divide-ink-100">
          {linhasOrdenadas.map((l) => (
            <Link
              key={`${l.colaboradorId}-${l.treinamentoId}`}
              href={`/colaboradores/${l.colaboradorId}`}
              className="flex flex-col gap-2 px-5 py-4 hover:bg-ink-100/40 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink-800">{l.colaboradorNome}</p>
                <p className="text-xs text-ink-300">
                  {l.treinamentoNome} · {l.setorNome ?? "sem setor"}
                  {l.validoAte ? ` · válido até ${formatDate(l.validoAte)}` : ""}
                </p>
              </div>
              <div className="shrink-0">
                <Badge className={treinamentoStatusBadgeClasses(l.status)}>
                  {treinamentoStatusLabel(l.status)}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      )}

      <h2 className="mb-3 text-base font-semibold text-ink-900">Últimas realizações</h2>
      {ultimasRealizacoes.length === 0 ? (
        <EmptyState title="Nenhuma realização registrada ainda" subtitle="Registre o primeiro treinamento realizado." />
      ) : (
        <div className="card divide-y divide-ink-100">
          {ultimasRealizacoes.map((r) => (
            <div
              key={r.id}
              className="flex flex-col gap-1 px-5 py-2 hover:bg-ink-100/40 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
            >
              <Link href={`/colaboradores/${r.colaboradorId}`} className="min-w-0 flex-1 py-2">
                <p className="truncate text-sm font-medium text-ink-800">
                  {r.treinamento.nome} · {r.colaborador.nome}
                </p>
                <p className="text-xs text-ink-300">
                  Realizado em {formatDateTime(r.realizadoEm)}
                  {r.instrutor ? ` · ${r.instrutor}` : ""}
                  {r.validoAte ? ` · válido até ${formatDate(r.validoAte)}` : " · não vence"}
                </p>
              </Link>
              <div className="shrink-0 self-start sm:self-center">
                <RealizacaoDeleteButton id={r.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
