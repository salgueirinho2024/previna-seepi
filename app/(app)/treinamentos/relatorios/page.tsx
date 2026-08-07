import Link from "next/link";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatCard, EmptyState } from "@/components/ui";
import { formatDate, formatDateTime } from "@/lib/utils";

export default async function RelatoriosTreinamentosPage({
  searchParams,
}: {
  searchParams: { setorId?: string; treinamentoId?: string; de?: string; ate?: string };
}) {
  const session = await requireSession();
  const empresaId = session.user.empresaId;

  const [setores, treinamentosCatalogo] = await Promise.all([
    prisma.setor.findMany({ where: { empresaId }, orderBy: { nome: "asc" } }),
    prisma.treinamentoCatalogo.findMany({ where: { empresaId }, orderBy: { nome: "asc" } }),
  ]);

  const setorId = searchParams.setorId || "";
  const treinamentoId = searchParams.treinamentoId || "";
  const de = searchParams.de ? new Date(`${searchParams.de}T00:00:00`) : undefined;
  const ate = searchParams.ate ? new Date(`${searchParams.ate}T23:59:59`) : undefined;

  const realizacoes = await prisma.treinamentoRealizacao.findMany({
    where: {
      empresaId,
      ...(de || ate ? { realizadoEm: { ...(de ? { gte: de } : {}), ...(ate ? { lte: ate } : {}) } } : {}),
      ...(treinamentoId ? { treinamentoId } : {}),
      ...(setorId ? { colaborador: { setorId } } : {}),
    },
    include: {
      colaborador: { include: { setor: true, unidade: true } },
      treinamento: true,
    },
    orderBy: { realizadoEm: "desc" },
  });

  const totalRealizacoes = realizacoes.length;
  const colaboradoresAtendidos = new Set(realizacoes.map((r) => r.colaboradorId)).size;
  const cargaHorariaTotal = realizacoes.reduce((acc, r) => acc + (r.treinamento.cargaHorariaHoras ?? 0), 0);
  const semVencimento = realizacoes.filter((r) => !r.validoAte).length;

  return (
    <div>
      <PageHeader
        title="Relatórios de Treinamentos"
        subtitle="Realizações registradas, com filtro por setor, treinamento e período"
      />

      <div className="mb-6">
        <Link href="/treinamentos" className="text-sm text-ink-500 hover:underline">
          ← Voltar ao painel de treinamentos
        </Link>
      </div>

      <form className="card mb-6 grid grid-cols-1 gap-4 p-5 sm:grid-cols-5" method="get">
        <div>
          <label className="label">Setor</label>
          <select name="setorId" defaultValue={setorId} className="input">
            <option value="">Todos</option>
            {setores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Treinamento</label>
          <select name="treinamentoId" defaultValue={treinamentoId} className="input">
            <option value="">Todos</option>
            {treinamentosCatalogo.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">De</label>
          <input type="date" name="de" defaultValue={searchParams.de ?? ""} className="input" />
        </div>
        <div>
          <label className="label">Até</label>
          <input type="date" name="ate" defaultValue={searchParams.ate ?? ""} className="input" />
        </div>
        <div className="flex items-end">
          <button type="submit" className="btn-primary w-full">
            Filtrar
          </button>
        </div>
      </form>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Realizações no período" value={String(totalRealizacoes)} />
        <StatCard label="Colaboradores atendidos" value={String(colaboradoresAtendidos)} />
        <StatCard label="Carga horária total" value={`${cargaHorariaTotal}h`} tone="brand" />
        <StatCard label="Sem data de vencimento" value={String(semVencimento)} />
      </div>

      <div className="card p-5">
        <h2 className="mb-4 text-base font-semibold text-ink-900">Detalhamento</h2>
        {realizacoes.length === 0 ? (
          <EmptyState title="Nenhuma realização encontrada" subtitle="Ajuste os filtros para ver os resultados." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-300">
                  <th className="py-2 pr-3">Realizado em</th>
                  <th className="py-2 pr-3">Colaborador</th>
                  <th className="py-2 pr-3">Setor</th>
                  <th className="py-2 pr-3">Treinamento</th>
                  <th className="py-2 pr-3">Instrutor</th>
                  <th className="py-2 pr-3">Válido até</th>
                </tr>
              </thead>
              <tbody>
                {realizacoes.map((r) => (
                  <tr key={r.id} className="border-b border-ink-100">
                    <td className="py-2 pr-3">{formatDateTime(r.realizadoEm)}</td>
                    <td className="py-2 pr-3 font-medium text-ink-800">{r.colaborador.nome}</td>
                    <td className="py-2 pr-3">{r.colaborador.setor?.nome ?? "—"}</td>
                    <td className="py-2 pr-3">{r.treinamento.nome}</td>
                    <td className="py-2 pr-3">{r.instrutor ?? "—"}</td>
                    <td className="py-2 pr-3">{r.validoAte ? formatDate(r.validoAte) : "não vence"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
