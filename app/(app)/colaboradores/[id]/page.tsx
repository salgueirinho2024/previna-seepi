import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import { DeleteButton } from "@/components/DeleteButton";
import { deleteColaborador } from "../actions";

export default async function ColaboradorDetalhePage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  const colaborador = await prisma.colaborador.findFirst({
    where: { id: params.id, empresaId: session.user.empresaId },
    include: {
      unidade: true,
      setor: true,
      entregas: { include: { itens: { include: { item: true } } }, orderBy: { entregueEm: "desc" } },
      devolucoes: { include: { item: true }, orderBy: { devolvidoEm: "desc" } },
    },
  });
  if (!colaborador) notFound();

  return (
    <div>
      <PageHeader
        title={colaborador.nome}
        subtitle={`${colaborador.matricula ?? "sem matrícula"} · ${colaborador.cargo ?? "—"} · ${
          colaborador.setor?.nome ?? "sem setor"
        } · ${colaborador.unidade?.nome ?? "sem unidade"}`}
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <Link href={`/solicitacoes/nova?colaboradorId=${colaborador.id}`} className="btn-primary">
          + Nova solicitação de EPI
        </Link>
        <Link href={`/devolucoes/nova?colaboradorId=${colaborador.id}`} className="btn-secondary">
          ↩️ Registrar devolução
        </Link>
        <Link href={`/ficha-epi/${colaborador.id}`} className="btn-secondary">
          📄 Ficha de EPI
        </Link>
        <Link href={`/colaboradores/${colaborador.id}/editar`} className="btn-secondary">
          Editar
        </Link>
        <DeleteButton action={deleteColaborador.bind(null, colaborador.id)} />
      </div>

      <div className="card p-5">
        <h2 className="mb-4 text-base font-semibold text-ink-900">Histórico de entregas</h2>
        {colaborador.entregas.length === 0 ? (
          <EmptyState title="Nenhuma entrega registrada ainda" />
        ) : (
          <div className="divide-y divide-ink-100">
            {colaborador.entregas.map((e) => (
              <div key={e.id} className="py-3">
                <p className="text-xs text-ink-300">{formatDateTime(e.entregueEm)}</p>
                <ul className="mt-1 space-y-1">
                  {e.itens.map((i) => (
                    <li key={i.id} className="text-sm text-ink-800">
                      {i.quantidade}× {i.item.nome} {i.item.ca ? `(CA ${i.item.ca})` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card mt-6 p-5">
        <h2 className="mb-4 text-base font-semibold text-ink-900">Histórico de devoluções</h2>
        {colaborador.devolucoes.length === 0 ? (
          <EmptyState title="Nenhuma devolução registrada" />
        ) : (
          <div className="divide-y divide-ink-100">
            {colaborador.devolucoes.map((d) => (
              <div key={d.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-ink-800">
                    {d.quantidade}× {d.item.nome}
                  </p>
                  <p className="text-xs text-ink-300">
                    {d.motivo} · {formatDateTime(d.devolvidoEm)}
                    {d.observacao ? ` · ${d.observacao}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
