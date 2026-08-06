import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { PrintButton } from "@/components/PrintButton";
import { Logo } from "@/components/Logo";

export default async function FichaEpiPage({ params }: { params: { colaboradorId: string } }) {
  const session = await requireSession();

  const colaborador = await prisma.colaborador.findFirst({
    where: { id: params.colaboradorId, empresaId: session.user.empresaId },
    include: {
      unidade: true,
      setor: true,
      empresa: true,
      entregas: {
        include: { itens: { include: { item: true } } },
        orderBy: { entregueEm: "asc" },
      },
    },
  });
  if (!colaborador) notFound();

  // Uma linha por item entregue, na ordem cronológica das entregas.
  const linhas = colaborador.entregas.flatMap((entrega) =>
    entrega.itens.map((ei) => ({
      id: ei.id,
      entrega,
      item: ei.item,
      quantidade: ei.quantidade,
      proximaTroca: ei.proximaTroca,
    }))
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
              Ficha de Controle de Entrega de EPI
            </h1>
            <p className="mt-1 text-xs text-ink-500">Nos termos da NR-6 — Equipamento de Proteção Individual</p>
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
            <p className="text-xs uppercase tracking-wide text-ink-300">CPF</p>
            <p className="mt-0.5 font-medium text-ink-800">{colaborador.cpf ?? "—"}</p>
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

        {/* Tabela de entregas */}
        <div className="-mx-1 overflow-x-auto px-1 print:overflow-visible">
        <table className="w-full min-w-[640px] border-collapse text-xs print:min-w-0">
          <thead>
            <tr className="border-b-2 border-ink-800 text-left uppercase tracking-wide text-ink-500">
              <th className="py-2 pr-2">Data</th>
              <th className="py-2 pr-2">EPI</th>
              <th className="py-2 pr-2">CA</th>
              <th className="py-2 pr-2 text-center">Qtd.</th>
              <th className="py-2 pr-2">Motivo</th>
              <th className="py-2 pr-2">Próx. troca</th>
              <th className="py-2 pr-2">Assinatura</th>
            </tr>
          </thead>
          <tbody>
            {linhas.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-ink-300">
                  Nenhuma entrega de EPI registrada para este colaborador.
                </td>
              </tr>
            ) : (
              linhas.map((linha) => (
                <tr key={linha.id} className="border-b border-ink-100">
                  <td className="py-2 pr-2 align-top">{formatDate(linha.entrega.entregueEm)}</td>
                  <td className="py-2 pr-2 align-top font-medium text-ink-800">{linha.item.nome}</td>
                  <td className="py-2 pr-2 align-top">{linha.item.ca ?? "—"}</td>
                  <td className="py-2 pr-2 text-center align-top">{linha.quantidade}</td>
                  <td className="py-2 pr-2 align-top">{linha.entrega.solicitacaoId ? "Entrega" : "—"}</td>
                  <td className="py-2 pr-2 align-top">{linha.proximaTroca ? formatDate(linha.proximaTroca) : "—"}</td>
                  <td className="py-2 pr-2 align-top">
                    {linha.entrega.assinado ? (
                      <span className="text-brand-700">
                        ✓ assinado (manual) em {formatDate(linha.entrega.assinadoEm)}
                      </span>
                    ) : (
                      <span className="text-ink-300">pendente</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>

        {/* Declaração e assinatura */}
        <div className="mt-10 space-y-6 text-xs text-ink-700">
          <p>
            Declaro ter recebido treinamento sobre o uso correto, guarda e conservação do(s) Equipamento(s) de
            Proteção Individual acima relacionado(s), comprometendo-me a utilizá-lo(s) para a finalidade a que se
            destina(m), de acordo com a NR-6, comunicando qualquer alteração que o torne impróprio para uso.
          </p>

          <div className="grid grid-cols-1 gap-10 pt-10 sm:grid-cols-2 print:grid-cols-2">
            <div className="border-t border-ink-800 pt-2 text-center">
              <p>{colaborador.nome}</p>
              <p className="text-ink-300">Assinatura do colaborador</p>
            </div>
            <div className="border-t border-ink-800 pt-2 text-center">
              <p>Responsável pela entrega</p>
              <p className="text-ink-300">{colaborador.empresa.nome}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
