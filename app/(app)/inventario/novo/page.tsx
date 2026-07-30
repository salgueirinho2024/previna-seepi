import { PageHeader } from "@/components/ui";
import { ItemForm } from "@/components/ItemForm";
import { createItem } from "../actions";

export default function NovoItemPage() {
  return (
    <div>
      <PageHeader title="Novo item de EPI" subtitle="Cadastre um item para controle de estoque e entregas" />
      <ItemForm action={createItem} submitLabel="Cadastrar item" />
    </div>
  );
}
