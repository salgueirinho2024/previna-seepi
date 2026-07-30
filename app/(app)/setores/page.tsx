import Link from "next/link";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState, Badge } from "@/components/ui";

export default async function SetoresPage() {
  const session = await requireSession();
  const setores = await prisma.setor.findMany({
    where: { empresaId: session.user.empresaId },
    include: {
      itensObrigatorios: { include: { item: true } },
      _count: { select: { colaboradores: true } },
    },
    orderBy: { nome: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Setores"
        subtitle={`${setores.length} setor(es) cadastrado(s)`}
        action={{ href: "/setores/novo", label: "+ Novo setor" }}
      />

      {setores.length === 0 ? (
        <EmptyState
          title="Nenhum setor cadastrado"
          subtitle="Cadastre setores e defina quais EPIs são obrigatórios para cada um."
        />
      ) : (
        <div className="card divide-y divide-ink-100">
          {setores.map((s) => (
            <Link
              key={s.id}
              href={`/setores/${s.id}/editar`}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-ink-100/40"
            >
              <div>
                <p className="text-sm font-medium text-ink-800">{s.nome}</p>
                <p className="text-xs text-ink-300">
                  {s._count.colaboradores} colaborador(es) · {s.itensObrigatorios.length} EPI(s) obrigatório(s)
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {s.itensObrigatorios.length === 0 ? (
                  <span className="text-xs text-ink-300">Nenhum EPI obrigatório definido</span>
                ) : (
                  s.itensObrigatorios.map((si) => (
                    <Badge key={si.id} className="bg-ink-100 text-ink-700">
                      {si.item.nome}
                    </Badge>
                  ))
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
