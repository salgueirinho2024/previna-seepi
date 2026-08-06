import { PageHeader } from "@/components/ui";
import { TreinamentoForm } from "@/components/TreinamentoForm";
import { criarTreinamento } from "../../actions";

export default function NovoTreinamentoPage() {
  return (
    <div>
      <PageHeader title="Novo treinamento" subtitle="Cadastre um treinamento para o catálogo da empresa" />
      <TreinamentoForm action={criarTreinamento} submitLabel="Cadastrar treinamento" />
    </div>
  );
}
