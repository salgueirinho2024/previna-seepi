import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatCard, EmptyState } from "@/components/ui";
import { formatDate, formatDateTime, formatBRL } from "@/lib/utils";

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: { unidadeId?: string; de?: string; ate?: string };
}) {
  const session = await requireSession();
  const empresaId = session.user.empresaId;

  const unidades = await prisma.unidade.findMany({
    where: { empresaId },
    orderBy: { nome: "asc" },
  });

  const unidadeId = searchParams.unidadeId || "";
  const de = searchParams.de ? new Date(`${searchParams.de}T00:00:00`) : undefined;
  const ate = searchParams.ate ? new Date(`${searchParams.ate}T23:59:59`) : undefined;

  const entregas = await prisma.entrega.findMany({
    where: {
      empresaId,
      ...(de || ate ? { entregueEm: { ...(de ? { gte: de } : {}), ...(ate ? { lte: ate } : {}) } } : {}),
      ...(unidadeId ? { colaborador: { unidadeId } } : {}),
    },
    include: {
      colaborador: { include: { unidade: true, setor: true } },
      solicitacao: true,
      itens: { include: { item: true } },
    },
    orderBy: { entregueEm: "desc" },
  });

  const linhas = entregas.flatMap((e) =>
    e.itens.map((ei) => ({
      id: ei.id,
      entrega: e,
      item: ei.item,
      quantidade: ei.quantidade,
      custo: Number(ei.item.custoUnitario) * ei.quantidade,
    }))
  );

  const totalItens = linhas.reduce((acc, l) => acc + l.quantidade, 0);
  const custoTotal = linhas.reduce((acc, l) => acc + l.custo, 0);
  const colaboradoresAtendidos = new Set(entregas.map((e) => e.colaboradorId)).size;

  return (
    <div>
      <PageHeader
        title="Relatórios"
        subtitle="EPIs entregues por projeto (unidade), com filtro por período"
      />

      <form className="card mb-6 grid grid-cols-1 gap-4 p-5 sm:grid-cols-4" method="get">
        <div>
          <label className="label">Projeto / Unidade</label>
          <select name="unidadeId" defaultValue={unidadeId} className="input">
            <option value="">Todas</option>
            {unidades.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
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
        <StatCard label="Entregas realizadas" value={String(entregas.length)} />
        <StatCard label="Itens entregues" value={String(totalItens)} />
        <StatCard label="Colaboradores atendidos" value={String(colaboradoresAtendidos)} />
        <StatCard label="Custo total" value={formatBRL(custoTotal)} tone="brand" />
      </div>

      <div className="card p-5">
        <h2 className="mb-4 text-base font-semibold text-ink-900">Detalhamento</h2>
        {linhas.length === 0 ? (
          <EmptyState title="Nenhuma entrega encontrada" subtitle="Ajuste os filtros para ver os resultados." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-300">
                  <th className="py-2 pr-3">Data</th>
                  <th className="py-2 pr-3">Colaborador</th>
                  <th className="py-2 pr-3">Projeto / Unidade</th>
                  <th className="py-2 pr-3">Setor</th>
                  <th className="py-2 pr-3">Item</th>
                  <th className="py-2 pr-3 text-center">Qtd.</th>
                  <th className="py-2 pr-3">Motivo</th>
                  <th className="py-2 pr-3 text-right">Custo</th>
                </tr>
              </thead>
              <tbody>
                {linhas.map((l) => (
                  <tr key={l.id} className="border-b border-ink-100">
                    <td className="py-2 pr-3">{formatDate(l.entrega.entregueEm)}</td>
                    <td className="py-2 pr-3 font-medium text-ink-800">{l.entrega.colaborador.nome}</td>
                    <td className="py-2 pr-3">{l.entrega.colaborador.unidade?.nome ?? "—"}</td>
                    <td className="py-2 pr-3">{l.entrega.colaborador.setor?.nome ?? "—"}</td>
                    <td className="py-2 pr-3">{l.item.nome}</td>
                    <td className="py-2 pr-3 text-center">{l.quantidade}</td>
                    <td className="py-2 pr-3">{l.entrega.solicitacao.motivo}</td>
                    <td className="py-2 pr-3 text-right">{formatBRL(l.custo)}</td>
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
