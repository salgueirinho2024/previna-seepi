import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatDate, trocaStatus, treinamentoStatusLabel, type TreinamentoStatus } from "@/lib/utils";
import { PrintButton } from "@/components/PrintButton";
import { Logo } from "@/components/Logo";

export default async function FichaTreinamentoPage({ params }: { params: { colaboradorId: string } }) {
  const session = await requireSession();

  const [colaborador, empresa] = await Promise.all([
    prisma.colaborador.findFirst({
      where: { id: params.colaboradorId, empresaId: session.user.empresaId },
      include: {
        unidade: true,
        setor: { include: { treinamentosObrigatorios: { include: { treinamento: true } } } },
        empresa: true,
        treinamentoRealizacoes: {
          include: { treinamento: true },
          orderBy: { realizadoEm: "asc" },
        },
      },
    }),
    prisma.empresa.findUniqueOrThrow({
      where: { id: session.user.empresaId },
      select: { diasAvisoTreinamento: true },
    }),
  ]);
  if (!colaborador) notFound();

  const diasAviso = empresa.diasAvisoTreinamento;

  // Treinamentos obrigatórios do setor que nunca foram realizados por esse colaborador.
  const pendentes = (colaborador.setor?.treinamentosObrigatorios ?? []).filter(
    (ot) => !colaborador.treinamentoRealizacoes.some((r) => r.treinamentoId === ot.treinamentoId)
  );

  return (
    <div className="mx-auto max-w-4xl px-3 py-6 sm:px-6 sm:py-8 print:px-0 print:py-0">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Logo size={26} />
        <PrintButton />
      </div>

      <div className="card p-4 sm:p-8 print:border-0 print:p-0 print:shadow-none">
        {/* Cabeçalho */}
        <div className="mb-6 flex items-start justify-between border-b border-ink-100 pb-6">
          <div>
            <h1 className="text-lg font-bold uppercase tracking-wide text-ink-900">
              Ficha de Controle de Treinamentos
            </h1>
            <p className="mt-1 text-xs text-ink-500">Histórico de capacitações e situação por colaborador</p>
          </div>
          <div className="text-right text-xs text-ink-500">
            <p className="font-semibold text-ink-800">{colaborador.empresa.nome}</p>
            {colaborador.empresa.cnpj && <p>CNPJ: {colaborador.empresa.cnpj}</p>}
          </div>
        </div>

        {/* Dados do colaborador */}
        <div className="mb-6 grid grid-cols-2 gap-4 rounded-lg bg-ink-100/40 p-4 text-sm sm:grid-cols-4 print:bg-transparent print:border print:border-ink-100">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-300">Colaborador</p>
            <p className="mt-0.5 font-medium text-ink-800">{colaborador.nome}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-300">Matrícula</p>
            <p className="mt-0.5 font-medium text-ink-800">{colaborador.matricula ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-300">Cargo</p>
            <p className="mt-0.5 font-medium text-ink-800">{colaborador.cargo ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-300">Setor</p>
            <p className="mt-0.5 font-medium text-ink-800">{colaborador.setor?.nome ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-300">Unidade</p>
            <p className="mt-0.5 font-medium text-ink-800">{colaborador.unidade?.nome ?? "—"}</p>
          </div>
        </div>

        {/* Tabela de treinamentos realizados */}
        <div className="-mx-1 overflow-x-auto px-1 print:overflow-visible">
          <table className="w-full min-w-[640px] border-collapse text-xs print:min-w-0">
            <thead>
              <tr className="border-b-2 border-ink-800 text-left uppercase tracking-wide text-ink-500">
                <th className="py-2 pr-2">Data</th>
                <th className="py-2 pr-2">Treinamento</th>
                <th className="py-2 pr-2">Carga h.</th>
                <th className="py-2 pr-2">Instrutor</th>
                <th className="py-2 pr-2">Válido até</th>
                <th className="py-2 pr-2">Situação</th>
              </tr>
            </thead>
            <tbody>
              {colaborador.treinamentoRealizacoes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-ink-300">
                    Nenhum treinamento registrado para este colaborador.
                  </td>
                </tr>
              ) : (
                colaborador.treinamentoRealizacoes.map((r) => {
                  let status: TreinamentoStatus;
                  if (!r.validoAte) {
                    status = "sem_vencimento";
                  } else {
                    const s = trocaStatus(r.validoAte, diasAviso);
                    status = s === "vencida" ? "vencido" : s === "atencao" ? "atencao" : "ok";
                  }
                  return (
                    <tr key={r.id} className="border-b border-ink-100">
                      <td className="py-2 pr-2 align-top">{formatDate(r.realizadoEm)}</td>
                      <td className="py-2 pr-2 align-top font-medium text-ink-800">{r.treinamento.nome}</td>
                      <td className="py-2 pr-2 align-top">
                        {r.treinamento.cargaHorariaHoras ? `${r.treinamento.cargaHorariaHoras}h` : "—"}
                      </td>
                      <td className="py-2 pr-2 align-top">{r.instrutor ?? "—"}</td>
                      <td className="py-2 pr-2 align-top">{r.validoAte ? formatDate(r.validoAte) : "—"}</td>
                      <td className="py-2 pr-2 align-top">{treinamentoStatusLabel(status)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pendências */}
        {pendentes.length > 0 && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-700 print:border-ink-800 print:bg-transparent">
            <p className="mb-1 font-semibold uppercase tracking-wide">Treinamentos obrigatórios pendentes</p>
            <ul className="list-inside list-disc space-y-0.5">
              {pendentes.map((p) => (
                <li key={p.id}>{p.treinamento.nome}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Declaração e assinatura */}
        <div className="mt-10 space-y-6 text-xs text-ink-700">
          <p>
            Declaro ter participado do(s) treinamento(s) acima relacionado(s), estando ciente do conteúdo
            programático abordado e comprometendo-me a aplicar as orientações recebidas nas minhas atividades.
          </p>

          <div className="grid grid-cols-1 gap-10 pt-10 sm:grid-cols-2 print:grid-cols-2">
            <div className="border-t border-ink-800 pt-2 text-center">
              <p>{colaborador.nome}</p>
              <p className="text-ink-300">Assinatura do colaborador</p>
            </div>
            <div className="border-t border-ink-800 pt-2 text-center">
              <p>Responsável / Instrutor</p>
              <p className="text-ink-300">{colaborador.empresa.nome}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
