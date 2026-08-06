import Link from "next/link";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import { DevolucaoDeleteButton } from "@/components/DevolucaoDeleteButton";

export default async function DevolucoesPage() {
  const session = await requireSession();
  const devolucoes = await prisma.devolucao.findMany({
    where: { empresaId: session.user.empresaId },
    include: { colaborador: true, item: true },
    orderBy: { devolvidoEm: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Devoluções"
        subtitle={`${devolucoes.length} devolução(ões) registrada(s) · apenas histórico, não altera o estoque`}
        action={{ href: "/devolucoes/nova", label: "+ Registrar devolução" }}
      />

      {devolucoes.length === 0 ? (
        <EmptyState title="Nenhuma devolução registrada" subtitle="Registre a primeira devolução de EPI." />
      ) : (
        <div className="card divide-y divide-ink-100">
          {devolucoes.map((d) => (
            <div
              key={d.id}
              className="flex flex-col gap-1 px-5 py-2 hover:bg-ink-100/40 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
            >
              <Link href={`/colaboradores/${d.colaboradorId}`} className="min-w-0 flex-1 py-2">
                <p className="truncate text-sm font-medium text-ink-800">
                  {d.quantidade}× {d.item.nome} · {d.colaborador.nome}
                </p>
                <p className="text-xs text-ink-300">
                  {d.motivo} · {formatDateTime(d.devolvidoEm)}
                  {d.observacao ? ` · ${d.observacao}` : ""}
                </p>
              </Link>
              <div className="shrink-0 self-start sm:self-center">
                <DevolucaoDeleteButton id={d.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
