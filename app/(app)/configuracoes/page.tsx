import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { DiasAvisoTrocaForm, AccountForm } from "@/components/ConfiguracoesForm";

export default async function ConfiguracoesPage() {
  const session = await requireSession();

  const [empresa, user] = await Promise.all([
    prisma.empresa.findUniqueOrThrow({
      where: { id: session.user.empresaId },
      select: { diasAvisoTroca: true },
    }),
    prisma.user.findUniqueOrThrow({
      where: { id: session.user.id },
      select: { name: true, email: true, image: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Configurações" subtitle="Sua conta e as preferências gerais do sistema" />

      <div className="card p-6">
        <h2 className="mb-1 text-base font-semibold text-ink-900">Minha conta</h2>
        <p className="mb-5 text-sm text-ink-500">
          Atualize sua foto, nome, e-mail e senha de acesso.
        </p>
        <AccountForm name={user.name} email={user.email} image={user.image} />
      </div>

      <div className="card p-6">
        <h2 className="mb-1 text-base font-semibold text-ink-900">Aviso de troca periódica</h2>
        <p className="mb-4 text-sm text-ink-500">
          O Painel avisa quando um EPI está próximo da data de troca (`próxima troca`, calculada a partir do
          tempo de troca cadastrado em cada item). Defina com quantos dias de antecedência esse aviso deve
          aparecer.
        </p>
        <DiasAvisoTrocaForm diasAvisoTroca={empresa.diasAvisoTroca} />
      </div>
    </div>
  );
}
