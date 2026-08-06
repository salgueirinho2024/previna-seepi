import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui";
import { formatDateTime, formatBRL, statusBadgeClasses, statusLabel } from "@/lib/utils";
import { SolicitacaoActions } from "@/components/SolicitacaoActions";
import { SignButtons } from "@/components/SignButtons";

export default async function SolicitacaoDetalhePage({ params }: { params: { id: string } }) {
  const session = await requireSession();

  const solicitacao = await prisma.solicitacao.findFirst({
    where: { id: params.id, empresaId: session.user.empresaId },
    include: {
      colaborador: { include: { unidade: true } },
      itens: { include: { item: true } },
      entrega: { include: { itens: { include: { item: true } } } },
    },
  });
  if (!solicitacao) notFound();

  const custoTotal = solicitacao.itens.reduce((acc, si) => acc + Number(si.item.custoUnitario) * si.quantidade, 0);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-ink-900">EPI #{solicitacao.numero}</h1>
            <Badge className={statusBadgeClasses(solicitacao.status)}>{statusLabel(solicitacao.status)}</Badge>
          </div>
          <p className="mt-1 text-sm text-ink-500">
            {solicitacao.itens.length} tipo(s) de item · {solicitacao.motivo}
          </p>
        </div>
        <Link href={`/ficha-epi/${solicitacao.colaboradorId}`} className="btn-secondary">
          📄 Ficha de EPI do colaborador
        </Link>
      </div>

      <div className="card mb-6 grid grid-cols-2 gap-6 p-5 sm:grid-cols-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-300">Colaborador</p>
          <p className="mt-1 text-sm font-medium text-ink-800">{solicitacao.colaborador.nome}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-300">Unidade</p>
          <p className="mt-1 text-sm font-medium text-ink-800">{solicitacao.colaborador.unidade?.nome ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-300">Registrado em</p>
          <p className="mt-1 text-sm font-medium text-ink-800">{formatDateTime(solicitacao.createdAt)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-300">Entregue em</p>
          <p className="mt-1 text-sm font-medium text-ink-800">
            {solicitacao.entrega ? formatDateTime(solicitacao.entrega.entregueEm) : "—"}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <SolicitacaoActions id={solicitacao.id} status={solicitacao.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-5">
            <h2 className="mb-4 text-base font-semibold text-ink-900">
              {solicitacao.entrega ? "Itens entregues" : "Itens da entrega"}
            </h2>
            <div className="divide-y divide-ink-100">
              {(solicitacao.entrega ? solicitacao.entrega.itens : solicitacao.itens).map((i) => (
                <div key={i.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-ink-800">{i.item.nome}</p>
                    <p className="text-xs text-ink-300">
                      CA {i.item.ca ?? "—"} · {formatBRL(i.item.custoUnitario as unknown as number)}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-ink-700">{i.quantidade}×</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-end border-t border-ink-100 pt-3 text-sm font-medium text-ink-800">
              Custo total: {formatBRL(custoTotal)}
            </div>
          </div>
        </div>

        <div>
          {solicitacao.entrega && !solicitacao.entrega.assinado && (
            <div className="card p-5">
              <h2 className="mb-1 text-base font-semibold text-ink-900">Assinatura</h2>
              <p className="mb-4 text-sm text-ink-500">
                A assinatura é manual e escrita (papel/Ficha de EPI impressa). Confirme aqui após o colaborador assinar.
              </p>
              <SignButtons entregaId={solicitacao.entrega.id} />
            </div>
          )}

          {solicitacao.entrega?.assinado && (
            <div className="card p-5 text-center">
              <p className="text-3xl">✅</p>
              <p className="mt-2 text-sm font-medium text-ink-800">Entrega assinada</p>
              <p className="text-xs text-ink-300">
                assinatura manual confirmada em {formatDateTime(solicitacao.entrega.assinadoEm)}
              </p>
            </div>
          )}

          {!solicitacao.entrega && (
            <div className="card p-5 text-center text-sm text-ink-300">
              Efetue a entrega para liberar a confirmação de assinatura.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
