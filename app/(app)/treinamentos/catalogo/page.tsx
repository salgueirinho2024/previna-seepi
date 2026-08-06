import Link from "next/link";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState } from "@/components/ui";

export default async function CatalogoTreinamentosPage() {
  const session = await requireSession();
  const treinamentos = await prisma.treinamentoCatalogo.findMany({
    where: { empresaId: session.user.empresaId },
    include: { _count: { select: { realizacoes: true, setoresObrigatorios: true } } },
    orderBy: { nome: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Catálogo de treinamentos"
        subtitle={`${treinamentos.length} treinamento(s) cadastrado(s)`}
        action={{ href: "/treinamentos/catalogo/novo", label: "+ Novo treinamento" }}
      />

      <div className="mb-6">
        <Link href="/treinamentos" className="text-sm text-ink-500 hover:underline">
          ← Voltar ao painel de treinamentos
        </Link>
      </div>

      {treinamentos.length === 0 ? (
        <EmptyState title="Nenhum treinamento cadastrado" subtitle="Cadastre o primeiro treinamento do catálogo." />
      ) : (
        <div className="card divide-y divide-ink-100">
          {treinamentos.map((t) => (
            <Link
              key={t.id}
              href={`/treinamentos/catalogo/${t.id}/editar`}
              className="flex flex-col gap-2 px-5 py-4 hover:bg-ink-100/40 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink-800">{t.nome}</p>
                <p className="text-xs text-ink-300">
                  {t.cargaHorariaHoras ? `${t.cargaHorariaHoras}h` : "carga horária não informada"} ·{" "}
                  {t.periodicidadeDias ? `validade ${t.periodicidadeDias} dias` : "não vence"}
                </p>
              </div>
              <div className="shrink-0 text-xs text-ink-300 sm:text-right">
                {t._count.setoresObrigatorios} setor(es) · {t._count.realizacoes} realização(ões)
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
