import Link from "next/link";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState, Badge } from "@/components/ui";
import { formatBRL } from "@/lib/utils";

export default async function InventarioPage() {
  const session = await requireSession();
  const itens = await prisma.itemEPI.findMany({
    where: { empresaId: session.user.empresaId },
    orderBy: { nome: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Inventário"
        subtitle={`${itens.length} item(ns) de EPI cadastrado(s)`}
        action={{ href: "/inventario/novo", label: "+ Novo item" }}
      />

      {itens.length === 0 ? (
        <EmptyState title="Nenhum item cadastrado" subtitle="Cadastre o primeiro item de EPI." />
      ) : (
        <div className="card divide-y divide-ink-100">
          {itens.map((item) => {
            const baixo = item.estoqueAtual <= item.estoqueMinimo;
            return (
              <Link
                key={item.id}
                href={`/inventario/${item.id}/editar`}
                className="flex items-center justify-between px-5 py-4 hover:bg-ink-100/40"
              >
                <div>
                  <p className="text-sm font-medium text-ink-800">{item.nome}</p>
                  <p className="text-xs text-ink-300">
                    CA {item.ca ?? "—"} · {item.fabricante ?? "—"} · {formatBRL(item.custoUnitario as unknown as number)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-ink-800">{item.estoqueAtual} em estoque</p>
                  {baixo && <Badge className="bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400">estoque baixo</Badge>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
