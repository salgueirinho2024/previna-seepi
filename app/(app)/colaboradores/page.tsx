import Link from "next/link";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState } from "@/components/ui";

export default async function ColaboradoresPage({
  searchParams,
}: {
  searchParams: { modulo?: string };
}) {
  const session = await requireSession();
  const colaboradores = await prisma.colaborador.findMany({
    where: { empresaId: session.user.empresaId },
    include: { unidade: true },
    orderBy: { nome: "asc" },
  });
  const sufixoModulo = searchParams.modulo === "treinamentos" ? "?modulo=treinamentos" : "";

  return (
    <div>
      <PageHeader
        title="Colaboradores"
        subtitle={`${colaboradores.length} colaborador(es) cadastrado(s)`}
        action={{ href: "/colaboradores/novo", label: "+ Novo colaborador" }}
      />

      {colaboradores.length === 0 ? (
        <EmptyState title="Nenhum colaborador cadastrado" subtitle="Cadastre o primeiro colaborador para começar." />
      ) : (
        <div className="card divide-y divide-ink-100">
          {colaboradores.map((c) => (
            <Link
              key={c.id}
              href={`/colaboradores/${c.id}${sufixoModulo}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-ink-100/40"
            >
              <div>
                <p className="text-sm font-medium text-ink-800">{c.nome}</p>
                <p className="text-xs text-ink-300">
                  {c.matricula ?? "sem matrícula"} · {c.cargo ?? "—"} · {c.unidade?.nome ?? "sem unidade"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
