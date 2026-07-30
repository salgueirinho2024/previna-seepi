import Link from "next/link";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

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
            <Link
              key={d.id}
              href={`/colaboradores/${d.colaboradorId}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-ink-100/40"
            >
              <div>
                <p className="text-sm font-medium text-ink-800">
                  {d.quantidade}× {d.item.nome} · {d.colaborador.nome}
                </p>
                <p className="text-xs text-ink-300">
                  {d.motivo} · {formatDateTime(d.devolvidoEm)}
                  {d.observacao ? ` · ${d.observacao}` : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
